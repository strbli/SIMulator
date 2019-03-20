#include "utils.h"


bool serial_recv_async_(SMARTCARD_HandleTypeDef *iface, void *ptr, uint16_t len) {
  if (len == 0)
    return true;

  HAL_StatusTypeDef status;
  status = HAL_SMARTCARD_Receive_IT(iface, ptr, len);
  if (status != HAL_OK) {
    dbg_printf("HAL_SMARTCARD_Receive_IT failed %d\n", status);
    return false;
  }

  return true;
}


bool serial_send_async_(SMARTCARD_HandleTypeDef *iface, uint8_t *ptr, uint16_t len) {
  HAL_StatusTypeDef status;
  status = HAL_SMARTCARD_Transmit_IT(iface, ptr, len);
  READ_REG(iface->Instance->DR);
  if (status != HAL_OK) {
    dbg_printf("HAL_SMARTCARD_Transmit_IT failed %d\n", status);
    return false;
  }
  return true;
}


bool is_serial_idle_(SMARTCARD_HandleTypeDef *iface) {
  HAL_SMARTCARD_StateTypeDef rxState = iface->RxState;
  HAL_SMARTCARD_StateTypeDef txState = iface->gState;

  bool trx_end = rxState == HAL_SMARTCARD_STATE_READY;
  trx_end = trx_end && txState == HAL_SMARTCARD_STATE_READY;
  
  return trx_end;
}


uint8_t unhex_nibble(char c1) {
  if (c1 >= '0' && c1 <= '9') {
    return c1 - '0';
  } else if (c1 >= 'a' && c1 <= 'f') {
    return c1 - 'a' + 0xa;
  } else if (c1 >= 'A' && c1 <= 'F') {
    return c1 - 'A' + 0xa;
  } else {
    return 0xff;
  }
}


uint32_t sscan_hex(char *string, uint8_t *dst, uint32_t len) {
  uint32_t i;
  for (i = 0; i < len; i++) {
    uint8_t n1, n2;
    n1 = unhex_nibble(string[i*2]);
    if (n1 == 0xff)
      break;
    n2 = unhex_nibble(string[i*2+1]);
    if (n2 == 0xff)
      break;

    dst[i] = n1 * 16 + n2;
  }
  return i;
}


ssize_t usb_send_hex(char c, const void *data, uint32_t len) {
  const uint8_t *data_ptr = (const uint8_t *) data;
  static char usb_tx_buf[768];
  size_t pos = 0;

  usb_tx_buf[pos++] = c;
  if (len > 0) {
    usb_tx_buf[pos++] = ' ';
    for (int i = 0; i < len; i++) {
      pos += sprintf(usb_tx_buf + pos, "%02x", data_ptr[i]);
    }
  }
  usb_tx_buf[pos++] = '\n';
  usb_tx_buf[pos++] = 0;
  
  dbg_printf("USB sending %s\n", usb_tx_buf);
  ssize_t r = CDC_WriteString(usb_tx_buf);
  if (r < 0) {
    dbg_printf("CDC_WriteString failed %d\n", r);
    return r;
  } else {
    return pos;
  }
}


ssize_t parse_cmdline_hex(char *cmdline, char *cmd, uint8_t *dest, size_t len) {
  if (cmd != NULL) {
    *cmd = cmdline[0];
  }

  if (len == 0) {
    if (cmdline[1] != 0) {
      CDC_WriteString("E PARSE X1\n");
      return -1;
    }
    return 0;
  }

  if (cmdline[1] != ' ') {
    CDC_WriteString("E PARSE X2\n");
    return -2;
  }

  size_t matches = sscan_hex((char *) &cmdline[2], dest, len);
  if (matches == 0) {
    CDC_WriteString("E PARSE X3\n");
    return -3;
  }

  if (cmdline[2 + matches * 2] != 0) {
    CDC_WriteString("E PARSE X4\n");
    return -4;
  }

  return matches;
}


int ringbuf_init(struct ringbuf *rb, uint8_t *buf, uint32_t size) {
  rb->buf = buf;
  rb->size = size;
  rb->wpos = 0;
  rb->rpos = 0;
}


uint32_t ringbuf_count(struct ringbuf *rb) {
  uint32_t size = rb->size;
  uint32_t rpos = rb->rpos;
  uint32_t wpos = rb->wpos;
  return (size + wpos - rpos) % size;
}


int ringbuf_peek(struct ringbuf *rb, uint8_t *dst, uint32_t off, uint32_t len) {
  uint32_t size = rb->size;
  uint32_t pos = rb->rpos;
  uint32_t count = ringbuf_count(rb);
  if (count < len) {
    dbg_printf("ringbuf underflow\n");
    return -1;
  }
  pos += off;
  for (uint32_t i = 0; i < len; i++) {
    pos %= size;
    dst[i] = rb->buf[pos++];
  }
  return len;
}


int ringbuf_read(struct ringbuf *rb, uint8_t *dst, uint32_t len) {
  int amount = ringbuf_peek(rb, dst, 0, len);
  if (amount > 0) {
    uint32_t pos = rb->rpos + amount;
    pos %= rb->size;
    rb->rpos = pos;
  }
  return amount;
}


int ringbuf_write(struct ringbuf *rb, uint8_t *src, uint32_t len) {
  uint32_t size = rb->size;
  uint32_t space = size - ringbuf_count(rb) - 1;
  uint32_t wpos = rb->wpos;
  if (space < len) {
    dbg_printf("ringbuf overflow\n");
    return -1;
  }
  for (uint32_t i = 0; i < len; i++) {
    uint8_t byte = src[i];
    rb->buf[wpos++] = byte;
    wpos %= size;
  }
  if (wpos < rb->wpos) {
    dbg_printf("ringbuf wrap\n");
  }
  rb->wpos = wpos;
  return len;
}

