#include <stdbool.h>
#include <stdint.h>
#include "utils.h"
#include "simrdr.h"
#include "usbd_cdc_if.h"

#define BAUD_SLOW (4000000/372)
#define BAUD_FAST (4000000/16)


#define STATE_NULL -1
#define STATE_OFF 0
#define STATE_RST 1
#define STATE_INIT_ATR 2
#define STATE_INIT_PTS 3
#define STATE_INIT_PTS_ECHO 4
#define STATE_IDLE 100
#define STATE_SENDING_HDR 200
#define STATE_SENDING_DATA 201
#define STATE_RECV_NUL 300
#define STATE_RCVD_ACK 301
#define STATE_RECV_RESP 302
#define STATE_RECV_SW2 303
#define STATE_ERROR 999

#define serial_send_async(a, b) serial_send_async_(iface, a, b)
#define is_serial_idle() is_serial_idle_(iface)

static void reset_all();
static void go_to_state(int state);
static ssize_t parse_atr(uint8_t *atr, uint16_t len);
static void send_pts();

int simrdr_on_cmdline(char *cmdline);


static SMARTCARD_HandleTypeDef *iface;
static int state;
static uint32_t last_state_tick = 0;
static uint32_t trx_error;
static bool serial_ignore_next_rx;

// Incoming buffers (from SIM to computer)
static struct ringbuf rb;
static uint8_t rb_buf[300];
static uint8_t atr[64];
static uint8_t atr_len;
static uint8_t pts_echo[6];
static uint8_t ack;
static uint8_t resp[256+2];
static uint8_t status[2];
static uint32_t resp_len;

// Outgoing buffers and flags (from computer to SIM)
static uint8_t sim_hdr[5];
static bool sim_hdr_present;
static uint8_t sim_data[256];
static uint32_t sim_data_len;
static uint8_t sim_pts[6];
static uint32_t sim_pts_len;
static uint32_t sim_pts_echo_len;
static bool sim_hdr_present;
static bool sim_powered;
static bool sim_nrst;


void simrdr_init(SMARTCARD_HandleTypeDef *hsc) {
  iface = hsc;
  state = STATE_NULL;
}


void simrdr_run() {
  bool serial_idle = is_serial_idle();
  uint32_t state_time = HAL_GetTick() - last_state_tick;
  uint32_t transfered, space;
  int result;

  if (state != STATE_OFF && !sim_powered) {
    go_to_state(STATE_OFF);
  }

  if (trx_error != 0) {
    dbg_printf("Error\n");
    go_to_state(STATE_ERROR);
  }

  switch (state) {

    case STATE_OFF:
      READ_REG(iface->Instance->DR);
      if (sim_powered && state_time > 10) {
        dbg_printf("SIM being powered on\n", state);
        HAL_GPIO_WritePin(SIM_VCC_GPIO_Port, SIM_VCC_Pin, GPIO_PIN_SET);
        go_to_state(STATE_RST);
      }
      break;

    case STATE_RST:
      if (sim_nrst && state_time > 10) {
        dbg_printf("SIM exiting reset\n", state);
        HAL_GPIO_WritePin(SIM_RST_GPIO_Port, SIM_RST_Pin, GPIO_PIN_SET);
        go_to_state(STATE_INIT_ATR);
      }
      break;

    case STATE_INIT_ATR:
      transfered = ringbuf_count(&rb);
      if (transfered > 0) {
        space = sizeof(atr) - atr_len;
        atr_len += ringbuf_read(&rb, atr + atr_len, transfered > space ? space : transfered);
        result = parse_atr(atr, atr_len);
        if (result < 0) {
          go_to_state(STATE_OFF);
        } else if (result > 0) {
          dbg_printf("Received ATR\n");
          usb_send_hex('t', atr, result);
          send_pts();
          go_to_state(STATE_INIT_PTS);
        } else if (atr_len >= sizeof(atr)) {
          dbg_printf("ATR buffer full but ATR is still incomplete\n");
          go_to_state(STATE_OFF);
        }
      }
      break;

    case STATE_INIT_PTS:
      if (serial_idle) {
        dbg_printf("PTS sent\n", state);
        sim_pts_echo_len = sim_pts_len;
        go_to_state(STATE_INIT_PTS_ECHO);
      }
      break;

    case STATE_INIT_PTS_ECHO:
      if (ringbuf_count(&rb) >= sim_pts_echo_len) {
        ringbuf_read(&rb, pts_echo, sim_pts_echo_len);
        usb_send_hex('p', pts_echo, sim_pts_echo_len);
        if (0 != memcmp(sim_pts, pts_echo, sim_pts_echo_len)) {
          dbg_printf("PTS was not echoed\n", state);
          go_to_state(STATE_OFF);
        } else {
          iface->Init.BaudRate = BAUD_FAST;
          if (HAL_SMARTCARD_Init(iface) != HAL_OK) {
            dbg_printf("Error on UART init\n", state);
            Error_Handler();
          }

          dbg_printf("SIM reset sequence completed\n");
          go_to_state(STATE_IDLE);
        }
      }
      break;

    case STATE_IDLE:
      if (serial_idle && sim_hdr_present) {
        dbg_printf("Sending INS %02x\n", sim_hdr[1]);
        serial_send_async(sim_hdr, 5);
        go_to_state(STATE_SENDING_HDR);
        sim_hdr_present = 0;
      }
      break;

    case STATE_SENDING_HDR:
      if (serial_idle) {
        dbg_printf("Header sent\n");
        go_to_state(STATE_RECV_NUL);
      }
      break;

    case STATE_RECV_NUL:
      if (ringbuf_count(&rb) >= 1) {
        ringbuf_read(&rb, &ack, 1);
        if (ack == sim_hdr[1]) {
          resp_len = sim_hdr[4];
          if (resp_len == 0) {
            resp_len = 256;
          }
          go_to_state(STATE_RCVD_ACK);
          dbg_printf("Received ACK\n");
          usb_send_hex('a', NULL, 0);
        } else if (ack == 0x60) {
          dbg_printf("Received NUL\n");
          go_to_state(STATE_RECV_NUL);
          usb_send_hex('n', NULL, 0);
        } else if ((ack & 0xf0) == 0x60 || (ack & 0xf0) == 0x90) {
          status[0] = ack;
          go_to_state(STATE_RECV_SW2);
        } else {
          dbg_printf("ACK is %02x (?)\n", ack);
          go_to_state(STATE_IDLE);
        }
      }
      break;

    case STATE_RCVD_ACK:
      transfered = ringbuf_count(&rb);
      if (transfered > 0 && sim_data_len > 0) {
        dbg_printf("Conflict: both SIM and USB sent DATA!\n");
        sim_data_len = 0;
      }
      if (transfered > 0) {
        dbg_printf("data is sent from SIM to INTERFACE\n");
        go_to_state(STATE_RECV_RESP);
      } else if (sim_data_len > 0) {
        dbg_printf("data is sent from INTERFACE to SIM\n");
        serial_send_async(sim_data, sim_data_len);
        go_to_state(STATE_SENDING_DATA);
        sim_data_len = 0;
      }
      break;

    case STATE_SENDING_DATA:
      if (serial_idle) {
        dbg_printf("Data sent\n");
        go_to_state(STATE_RECV_NUL);
      }
      break;

    case STATE_RECV_RESP:
      if (ringbuf_count(&rb) >= resp_len) {
        ringbuf_read(&rb, resp, resp_len);
        dbg_printf("Received response\n");
        usb_send_hex('r', resp, resp_len);
        go_to_state(STATE_RECV_NUL);
      }
      break;

    case STATE_RECV_SW2:
      if (ringbuf_count(&rb) >= 1) {
        ringbuf_read(&rb, status + 1, 1);
        dbg_printf("Received status\n");
        usb_send_hex('s', status, 2);
        go_to_state(STATE_IDLE);
      }
      break;
    
    default:
      dbg_printf("Unexpected state %d\n", state);
      go_to_state(STATE_OFF);
      break;
    
  }
}


static void go_to_state(int s) {
  uint32_t count;
  
  dbg_printf("state %d -> %d\n", state, s);
  HAL_GPIO_WritePin(Status_LED3_GPIO_Port, Status_LED3_Pin, GPIO_PIN_RESET);

  switch (s) {

    case STATE_OFF:
      dbg_printf("SIM being powered off\n", state);
      reset_all();
      dbg_printf("Smartcard interface ready to boot\n", state);
      state = s;
      break;

    case STATE_IDLE:
      HAL_GPIO_WritePin(Status_LED3_GPIO_Port, Status_LED3_Pin, GPIO_PIN_SET);
      count = ringbuf_count(&rb);
      if (count > 0) {
        dbg_printf("Warning: %d residual bytes in ringbuf\n", count);
      }
      ringbuf_init(&rb, rb_buf, sizeof(rb_buf));
      state = s;
      break;

    default:
      state = s;
      break;

  }

  last_state_tick = HAL_GetTick();
}


static void reset_all() {
  state = STATE_NULL;
  last_state_tick = 0;
  sim_powered = 0;
  sim_nrst = 0;
  sim_hdr_present = false;
  sim_data_len = 0;
  sim_pts_len = 0;
  sim_pts_echo_len = 0;
  trx_error = 0;
  serial_ignore_next_rx = false;
  resp_len = 0;
  atr_len = 0;
  ringbuf_init(&rb, rb_buf, sizeof(rb_buf));
  HAL_SMARTCARD_AbortTransmit_IT(iface);
  HAL_GPIO_WritePin(SIM_VCC_GPIO_Port, SIM_VCC_Pin, GPIO_PIN_RESET);
  HAL_GPIO_WritePin(SIM_RST_GPIO_Port, SIM_RST_Pin, GPIO_PIN_RESET);
  iface->Init.BaudRate = BAUD_SLOW;
  if (HAL_SMARTCARD_Init(iface) != HAL_OK) {
    dbg_printf("Error on UART init\n", state);
    Error_Handler();
  }
  /* Enable the SMARTCARD Parity Error and Data Register not empty Interrupts */
  SET_BIT(iface->Instance->CR1, USART_CR1_PEIE | USART_CR1_RXNEIE);
  /* Enable the SMARTCARD Error Interrupt: (Frame error, noise error, overrun error) */
  SET_BIT(iface->Instance->CR3, USART_CR3_EIE);
  READ_REG(iface->Instance->DR);
}


int simrdr_on_cmdline(char *cmdline) {
  ssize_t result;
  uint8_t mode;

  switch (cmdline[0]) {
    case 'o':
      result = parse_cmdline_hex(cmdline, NULL, &mode, 1);
      if (result != 1) return false;
      sim_powered = (mode & 0x01) != 0;
      sim_nrst = (mode & 0x02) != 0;
      return true;
    case 'h':
      result = parse_cmdline_hex(cmdline, NULL, sim_hdr, 5);
      sim_hdr_present = result == 5;
      return sim_hdr_present;
    case 'd':
      result = parse_cmdline_hex(cmdline, NULL, sim_data, 256);
      if (result <= 0) return false;
      sim_data_len = result;
      return true;
    case 'p':
      result = parse_cmdline_hex(cmdline, NULL, sim_pts, 6);
      if (result < 0) return false;
      sim_pts_len = result;
      return true;
    default:
      return false;
  }
}


static ssize_t parse_atr(uint8_t *atr, uint16_t len) {
  // Example ATR: 
  // 0x3B,  // (TS)
  // 0x9F,  // (T0) 1001, 15 Historical bytes
  // 0x96,
  // 0x80,
  // 0x1F,
  // 0xC7,
  // 0x80,0x31,0xE0,0x73,0xFE,0x21,0x1B,0x64,0x40,0x49,0x31,0x00,0x82,0x90,0x00,  // Historical bytes
  // 0xF9  // (TCK)

  uint8_t ts, t0, ck, k, y;
  uint8_t hist_chars[16];
  uint8_t ta[4];
  uint8_t tb[4];
  uint8_t tc[4];
  uint8_t td[4];
  int i, idx = 0;

  if (len < 3) {
    return 0;
  }

  ts = atr[idx++];
  if (ts != 0x3B) {
    dbg_printf("TS is not 0x3B\n", state);
    return -1;
  }

  t0 = atr[idx++];
  k = t0 & 0x0f;
  if (len < k + 3) {
    return 0;
  }

  i = 0;
  y = t0;
  while (1) {
    if (y & 0x10) {
      ta[i] = atr[idx++];
      if (idx >= len) return 0;
    }
    if (y & 0x20) {
      tb[i] = atr[idx++];
      if (idx >= len) return 0;
    }
    if (y & 0x40) {
      tc[i] = atr[idx++];
      if (idx >= len) return 0;
    }
    if (y & 0x80) {
      y = td[i++] = atr[idx++];
      if (i >= 4) return -3;
      if (idx >= len) return 0;
    } else {
      break;
    }
  }

  int exp_len = idx + k + 1;
  if (exp_len > len) {
    return 0;
  } else if (exp_len < len) {
    dbg_printf("ATR length expected to be %d, but is %d\n", idx + 1 + k, len);
    return -4;
  }

  dbg_printf("Historical characters:", idx + 1 + k, len);
  for (i = 0; i < k; i++) {
    uint8_t c = atr[idx++];
    dbg_printf(" %02x", c);
    hist_chars[i] = c;
  }
  dbg_printf("\n", idx + 1 + k, len);

  ck = 0;
  for (int i = 1; i < len; i++) {
    ck ^= atr[i];
  }
  if (ck != 0) {
    dbg_printf("XOR of all the bytes in the ATR is 0x%02x instead of 0\n", ck);
    return -2;
  }

  dbg_printf("ATR received correctly\n", state);
  return len;
}


static void send_pts() {
  sim_pts[0] = 0xff;
  sim_pts[1] = 0x10;
  sim_pts[2] = 0x96;
  sim_pts[3] = 0x79;
  sim_pts_len = 4;
  serial_send_async(sim_pts, sim_pts_len);
}


void simrdr_on_tx() {
  dbg_printf("SIM TX done\n");
}


void simrdr_on_rx() {
  dbg_printf("SIM RX done\n");
}


void simrdr_on_trx_error() {
  if (!sim_powered)
    return;
  
  trx_error = HAL_SMARTCARD_GetError(iface);
  dbg_printf("SIM TRX error %d\n", trx_error);
  READ_REG(iface->Instance->DR);

  CDC_WriteString("e SIM_TRX\n");
}

void simrdr_on_tick() {
  
}


void simrdr_on_serial() {
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


