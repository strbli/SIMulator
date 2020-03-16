#include <stdbool.h>
#include <stdint.h>
#include "utils.h"
#include "simemu.h"
#include "usbd_cdc_if.h"

#define BAUD_SLOW 10400
#define BAUD_FAST 240000

#define SC_DATA_BUF_LEN 320
#define CMDLINE_MAX_LEN 640

#define STATE_NULL -1
#define STATE_OFF 0
#define STATE_WAIT_CLK 1
#define STATE_INIT_ATR 2
#define STATE_INIT_PTS 3
#define STATE_INIT_PTS_ECHO 4
#define STATE_WAIT_ACK 100
#define STATE_RECV_HDR 200
#define STATE_RECV_DATA 201
#define STATE_SENDING_NUL 300
#define STATE_SENDING_ACK 301
#define STATE_SENDING_RESP 302
#define STATE_SENDING_STATUS 303
#define STATE_ERROR 999

#define serial_send_async(a, b) serial_send_async_(iface, a, b)
#define is_serial_idle() is_serial_idle_(iface)

static void reset_all();
static void begin_atr();
static int parse_pts(uint8_t *pts_buf, uint32_t pts_len);
static void begin_normal_operation();
static void go_to_state(int state);
static void usb_send_resp();
static void usb_send_hdr();
static bool sim_is_reset();
static bool sim_was_reset();

static bool sim_is_reset();
static bool sim_was_reset();

static int set_baudrate_scale(int, int);
static int get_clock_measure();

int simemu_on_cmdline(char *cmdline);
static bool on_cmdline_ack(char *cmdline);
static bool on_cmdline_status(char *cmdline);
static bool on_cmdline_response(char *cmdline);


static SMARTCARD_HandleTypeDef *iface;
static int state;
static uint32_t last_nul_tick = 0;
static int killed = 0;
static uint16_t clk_counted = 0;
static uint16_t last_clk_cnt = 0;
static uint32_t last_state_tick = 0;
static uint32_t trx_error;
static bool serial_ignore_next_rx;

// Incoming buffers (from modem to computer)
static struct ringbuf rb;
static uint8_t rb_buf[300];
static struct cmd_hdr hdr;
static uint8_t cmddata_buf[SC_DATA_BUF_LEN];
static uint8_t atr_buf[64];
static uint8_t atr_len = 0;
static uint8_t pts_buf[7];
static uint8_t pts_len = 0;

// Outgoing buffers and flags (from computer to modem)
static bool sim_nul_present;
static uint8_t sim_nul[1];
static bool sim_ack_present;
static uint8_t sim_ack[1];
static int sim_resp_len;
static uint8_t sim_resp[1+SC_DATA_BUF_LEN];
static bool sim_state_present;
static uint8_t sim_state[2];


const uint8_t default_atr[] = {
  0x3B,  // TS
  0x9F,  // T0
  0x96,0x80,0x1F,0xC7, // TA1, TD1, TD2, TA3
  0x80,0x31,0xE0,0x73,0xFE,0x21,0x13,0x57,  // T1-T8
  0x4A,0x33,0x05,0x24,0x33,0x32,0x00,  // T9-T15
  0xB1  // No TCK
};
const int Fi_lookup[16] = {
  -1, 372, 558, 744, 1116, 1488, 1860, -1,
  -1, 512, 768, 1024, 1536, 2048, -1, -1
};
const int Di_num_lookup[16] = {
  -1, 1, 2, 4, 8, 16, 32, -1,
  -1, 1, 1, 1, 1, 1, 1, 1
};
const int Di_den_lookup[16] = {
  0, 1, 1, 1, 1, 1, 1, 0,
  0, 0, 2, 4, 8, 16, 32, 64
};



void simemu_init(SMARTCARD_HandleTypeDef *hsc) {
  iface = hsc;
  dbg_printf("Ok, let's see how bad we can fuck this up\n");
  state = STATE_NULL;
  HAL_GPIO_WritePin(Status_LED1_GPIO_Port, Status_LED1_Pin, GPIO_PIN_RESET);
}


static bool sim_is_reset() {
  return !HAL_GPIO_ReadPin(SIMemu_RST_GPIO_Port, SIMemu_RST_Pin);
}


static bool sim_was_reset() {
  return killed || sim_is_reset();
}


static int parse_pts(uint8_t *pts_buf, uint32_t pts_len) {
  uint8_t ptss, pts0, pts1=0, pts2=0, pts3=0, pck, ck;
  int i = 0;
  int expected_pts_len = 3;

  if (pts_len < 3) {
    dbg_printf("Receiving PTS: %d/%d.\n", pts_len, 3);
    return 0;
  }
  
  ptss = pts_buf[i++];
  ck = ptss;

  if (ptss != 0xff) {
    dbg_printf("PTSS is %02x, expected FF.\n", ptss);
    return -17;
  }

  pts0 = pts_buf[i++];
  ck ^= pts0;

  expected_pts_len = 3;
  if (pts0 & 0x10)
    expected_pts_len++;
  if (pts0 & 0x20)
    expected_pts_len++;
  if (pts0 & 0x40)
    expected_pts_len++;
  if (pts0 & 0x80)
    expected_pts_len++;

  dbg_printf("Receiving PTS: %d/%d.\n", pts_len, expected_pts_len);

  if (pts_len < expected_pts_len)
    return 0;

  if (pts_len > expected_pts_len) {
    return -26;
  }
  
  if (pts0 & 0x10) {
    pts1 = pts_buf[i++];
    ck ^= pts1;
  }
  
  if (pts0 & 0x20) {
    pts2 = pts_buf[i++];
    ck ^= pts2;
  }
  
  if (pts0 & 0x40) {
    pts3 = pts_buf[i++];
    ck ^= pts3;
  }

  pck = pts_buf[i++];
  ck ^= pck;

  dbg_printf("PTS: %02x,%02x,%02x,%02x,%02x,%02x\n",
                    ptss, pts0, pts1, pts2, pts3, pck);

  // Finished receiving PTS, now parse it

  if (ck != 0) {
    dbg_printf("XOR of all bytes of PTS is 0x%02x, should be 0.\n", ck);
    return -18;
  }

  if (pts0 & 0x80) {
    dbg_printf("PTS0 has b8, but I can't parse it.\n");
    return -19;
  }

  if (pts0 & 0x40) {
    dbg_printf("PTS3 is present, I don't know how to handle it.\n");
    return -20;
  }

  if (pts0 & 0x40) {
    dbg_printf("PTS3 is present, I don't know how to handle it.\n");
    return -21;
  }

  int selected_protocol = pts0 & 0x0f;
  if (selected_protocol != 0) {
    dbg_printf("Interface selected protocol %d, but I don't know it.\n", selected_protocol);
    return -22;
  }

  int Fi = Fi_lookup[(pts1 & 0xf0) >> 4];
  if (Fi == -1) {
    dbg_printf("Unknown encoding for Fi for PTS1=%02x\n", pts1);
    return -23;
  }

  int Di_num = Di_num_lookup[pts1 & 0x0f];
  int Di_den = Di_den_lookup[pts1 & 0x0f];
  if (Di_den == 0) {
    dbg_printf("Unknown encoding for Di for PTS1=%02x\n", pts1);
    return -24;
  }

  if (Di_num != 32 || Di_den != 1 || Fi != 512) {
    dbg_printf("Only Fi=512 and Di=32 are implemented\n", pts1);
    return -25;
  }

  return pts_len;
}


void simemu_run() {
  bool serial_idle = is_serial_idle();
  uint32_t transfered, space;
  int clock = get_clock_measure();

  if (state != STATE_OFF && sim_was_reset()) {
    CDC_WriteString("E RST\n");
    go_to_state(STATE_OFF);
  }

  switch (state) {
    case STATE_OFF:
      /* Wait until the modem resets the card. */
      READ_REG(iface->Instance->DR);
      if (!sim_was_reset()) {
        CDC_WriteString("I BOOT\n");
        dbg_printf("Powered up\n");
        go_to_state(STATE_WAIT_CLK);
      }
      break;

    case STATE_WAIT_CLK:
      /* This state waits until the modem starts sending a clock. */
      if (clock > 100000) {
        dbg_printf("Clock received: %d\n", clock);
        go_to_state(STATE_INIT_ATR);
      }
      break;

    case STATE_INIT_ATR:
      /* In this state we just wait 1 tick and then send the ATR. */
      if ((HAL_GetTick() - last_state_tick) > 1) {
        dbg_printf("Sending ATR\n");
        begin_atr();
        serial_send_async(atr_buf, atr_len);
        pts_len = 0;
        go_to_state(STATE_INIT_PTS);
      }
      break;

    case STATE_INIT_PTS:
      /* In this state we wait for the PTS, parse it, and echo it. */
      transfered = ringbuf_count(&rb);
      if (serial_idle && transfered > 0) {
        space = sizeof(pts_buf) - pts_len;
        pts_len += ringbuf_read(&rb, pts_buf + pts_len, transfered > space ? space : transfered);
        int r = parse_pts(pts_buf, pts_len);
        if (r > 0) {
          usb_send_hex('P', pts_buf, pts_len);
          go_to_state(STATE_INIT_PTS_ECHO);
          serial_send_async(pts_buf, pts_len);
        } else if (r < 0) {
          dbg_printf("parse_pts() returned %d\n", r);
          go_to_state(STATE_OFF);
        }
      }
      break;

    case STATE_INIT_PTS_ECHO:
      /* Wait until the PTS echo is completely sent */
      if (serial_idle) {
        begin_normal_operation();
        go_to_state(STATE_RECV_HDR);
      }
      break;

    case STATE_RECV_HDR:
      /* Receive a 5 byte APDU header */
      transfered = ringbuf_count(&rb);
      if (transfered == 5) {
        ringbuf_read(&rb, &hdr, 5);
        go_to_state(STATE_WAIT_ACK);
        sim_resp_len = 0;
        sim_ack_present = false;
        sim_state_present = false;
        sim_nul_present = false;
        usb_send_hdr();
      } else if (transfered > 5) {
        dbg_printf("received more than 5 bytes of header! (%d)\n", transfered);
        go_to_state(STATE_OFF);
      }
      break;
    
    case STATE_RECV_DATA:
      /* Receive the data of a command APDU */
      transfered = ringbuf_count(&rb);
      if (sim_resp_len > 0) {
        if (transfered > 0) {
          dbg_printf("conflict: modem is sending data but I have a response ready\n", transfered);
          sim_resp_len = 0;
        } else {
          // TODO: sending response data here should be allowed
        }
      }
      if (transfered == hdr.p3) {
        ringbuf_read(&rb, cmddata_buf, hdr.p3);
        go_to_state(STATE_WAIT_ACK);
        usb_send_resp();
      } else if (transfered > hdr.p3) {
        dbg_printf("received more than %d bytes of data! (%d)\n", hdr.p3, transfered);
        go_to_state(STATE_OFF);
      }
      break;

    case STATE_WAIT_ACK:
      /* The modem is waiting for us to acknowledge or send a response or a state. */
      if (sim_ack_present) {
        dbg_printf("Returning ack %02x\n", sim_ack[0]);
        go_to_state(STATE_SENDING_ACK);
        serial_send_async(sim_ack, 1);
        sim_ack_present = false;
        sim_nul_present = false;
      } else if (sim_state_present && sim_resp_len == 0) {
        // Must check in this order since an interrupt could
        // arrive between two checks!
        dbg_printf("Returning state %02x%02x\n",
            sim_state[0], sim_state[1]);
        go_to_state(STATE_SENDING_STATUS);
        serial_send_async(sim_state, 2);
        sim_state_present = false;
      } else if (sim_resp_len) {
        dbg_printf("Returning response %d bytes\n", sim_resp_len);
        go_to_state(STATE_SENDING_RESP);
        serial_send_async(sim_resp, sim_resp_len);
        sim_resp_len = 0;
      } else if (sim_nul_present) {
        sim_nul_present = false;
        dbg_printf("Returning nul\n");
        go_to_state(STATE_SENDING_NUL);
        serial_send_async(sim_nul, 1);
        usb_send_hex('N', NULL, 0);
      }
      break;

    case STATE_SENDING_ACK:
      /* Wait until ACK is out, then switch to receiving data. */
      if (serial_idle) {
        go_to_state(STATE_RECV_DATA);
      }
      break;

    case STATE_SENDING_RESP:
      /* Wait until response is out, then switch to receiving ACK. */
      if (serial_idle) {
        go_to_state(STATE_WAIT_ACK);
      }
      break;

    case STATE_SENDING_STATUS:
      /* Wait until status is out, then switch to waiting for a new APDU header. */
      if (serial_idle) {
        go_to_state(STATE_RECV_HDR);
      }
      break;

    case STATE_SENDING_NUL:
      /* Wait until NUL is out, then go back to receiving ACK. */
      if (serial_idle) {
        go_to_state(STATE_WAIT_ACK);
      }
      break;

    default:
      dbg_printf("Unexpected state %d\n", state);
      go_to_state(STATE_OFF);
      break;
  }

}


static void go_to_state(int s) {
  dbg_printf("State %d -> %d\n", state, s);

  switch (s) {

    case STATE_OFF:
      reset_all();
      state = s;

    case STATE_WAIT_ACK:
      state = s;
      last_nul_tick = HAL_GetTick();
      break;
    
    default:
      state = s;
      break;

  }

  if (s == STATE_RECV_HDR)
    HAL_GPIO_WritePin(Status_LED2_GPIO_Port, Status_LED2_Pin, GPIO_PIN_SET);
  else
    HAL_GPIO_WritePin(Status_LED2_GPIO_Port, Status_LED2_Pin, GPIO_PIN_RESET);

  last_state_tick = HAL_GetTick();
}


static void reset_all() {
  state = STATE_OFF;
  last_nul_tick = 0;
  killed = 0;
  clk_counted = 0;
  last_clk_cnt = 0;
  last_state_tick = 0;
  trx_error = 0;
  serial_ignore_next_rx = false;

  ringbuf_init(&rb, rb_buf, sizeof(rb_buf));
  memset(&hdr, 0, sizeof(hdr));
  atr_len = 0;
  pts_len = 0;

  sim_nul_present = false;
  sim_ack_present = false;
  sim_resp_len = 0;
  sim_state_present = false;

  CLEAR_BIT(iface->Instance->CR1, USART_CR1_PEIE | USART_CR1_RXNEIE);
  CLEAR_BIT(iface->Instance->CR3, USART_CR3_EIE);
  HAL_SMARTCARD_AbortReceive_IT(iface);
  HAL_SMARTCARD_AbortTransmit_IT(iface);
  HAL_GPIO_WritePin(Status_LED1_GPIO_Port, Status_LED1_Pin, GPIO_PIN_RESET);
  READ_REG(iface->Instance->DR);
}


static void begin_atr() {
  set_baudrate_scale(1, 372);
  atr_len = sizeof(default_atr);
  memcpy(atr_buf, default_atr, atr_len);
}


static void begin_normal_operation() {
  set_baudrate_scale(1, 16);

  dbg_printf("It might be working now, wtf!\n");

  CDC_WriteString("I START\n");

  sim_ack_present = false;
  sim_state_present = false;
  sim_resp_len = 0;
}


static void usb_send_hdr() {
  if ((hdr.ins & 1) || (hdr.ins & 0xf0) == 0x60 || (hdr.ins & 0xf0) == 0x90) {
    dbg_printf("Invalid ins received: 0x%02x\n", hdr.ins);
  }

  usb_send_hex('C', &hdr, 5);
}


static void usb_send_resp() {
  usb_send_hex('D', cmddata_buf, hdr.p3);
}


static int get_clock_measure() {
  int clock = clk_counted * 2000;
  return clock;
}


static int set_baudrate_scale(int numerator, int denominator) {
  HAL_SMARTCARD_AbortReceive_IT(iface);
  HAL_SMARTCARD_AbortTransmit_IT(iface);

  int clock = get_clock_measure();

  uint32_t baud = clock * numerator / denominator;
  dbg_printf("Computed baud rate is %d\n", baud);
  
  iface->Init.BaudRate = baud;
  if (HAL_SMARTCARD_Init(iface) != HAL_OK) {
    dbg_printf("Setting baudrate failed %d\n", baud);
    Error_Handler();
  }
  /* Enable the SMARTCARD Parity Error and Data Register not empty Interrupts */
  SET_BIT(iface->Instance->CR1, USART_CR1_PEIE | USART_CR1_RXNEIE);
  /* Enable the SMARTCARD Error Interrupt: (Frame error, noise error, overrun error) */
  SET_BIT(iface->Instance->CR3, USART_CR3_EIE);

  return baud;
}


int simemu_on_cmdline(char *cmdline) {
  ssize_t result;

  switch (cmdline[0]) {
    case 'A':
      result = parse_cmdline_hex(cmdline, NULL, NULL, 0);
      if (result < 0) return false;
      sim_ack[0] = hdr.ins;
      sim_ack_present = true;
      return result;
    case 'S':
      result = parse_cmdline_hex(cmdline, NULL, sim_state, 2);
      if (result != 2) return false;
      sim_state_present = true;
      return result;
    case 'R':
      result = parse_cmdline_hex(cmdline, NULL, sim_resp+1, SC_DATA_BUF_LEN);
      if (result <= 0) return false;
      sim_resp[0] = hdr.ins;
      sim_resp_len = 1+result;
      return result;
    default:
      return false;
  }
}


void simemu_on_rst(int rst) {
  if (!rst)
    killed = 1;
}


void simemu_on_tx() {
  dbg_printf("MODEM TX done\n");
}


void simemu_on_rx() {
  dbg_printf("MODEM RX done\n");
}


void simemu_on_trx_error() {
  trx_error = HAL_SMARTCARD_GetError(iface);
  dbg_printf("Modem TRX error %d\n", trx_error);
  READ_REG(iface->Instance->DR);
  
  CDC_WriteString("E MODEM_TRX\n");
}


void simemu_on_tick() {
  uint16_t clk_counter = TIM1->CNT;
  clk_counted = clk_counter - last_clk_cnt;
  last_clk_cnt = clk_counter;

  if (HAL_GetTick() - last_nul_tick >= 100) {
    sim_nul[0] = 0x60;  // NUL (keep alive)
    sim_nul_present = true;
  }
}


void simemu_on_serial() {
  uint8_t byte;
  uint32_t isrflags;

  if (iface->gState != HAL_SMARTCARD_STATE_READY) {
    serial_ignore_next_rx = true;
  }
  
  isrflags = READ_REG(iface->Instance->SR);
  if ((isrflags & USART_SR_RXNE) != RESET) {
    byte = (uint8_t) READ_REG(iface->Instance->DR);
    if (serial_ignore_next_rx) {
      serial_ignore_next_rx = false;
    } else {
      ringbuf_write(&rb, &byte, 1);
    }
  }
  
}

