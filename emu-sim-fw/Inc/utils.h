#ifndef __UTILS_H__
#define __UTILS_H__

#include "stm32f1xx_hal.h"
#include "stdint.h"
#include "stdbool.h"
#include "usbd_cdc_if.h"
#include "../Src/RTT/SEGGER_RTT.h"
#include "../Src/RTT/SEGGER_RTT_Conf.h"

#define dbg_printf(...) SEGGER_RTT_printf(0, __VA_ARGS__)

struct ringbuf {
    uint32_t size;
    uint8_t *buf;
    volatile uint32_t rpos;
    volatile uint32_t wpos;
};

bool serial_recv_async_(SMARTCARD_HandleTypeDef *iface, void *ptr, uint16_t len);
bool serial_send_async_(SMARTCARD_HandleTypeDef *iface, uint8_t *ptr, uint16_t len);
bool is_serial_idle_(SMARTCARD_HandleTypeDef *iface);
uint8_t unhex_nibble(char c1);
uint32_t sscan_hex(char *string, uint8_t *dst, uint32_t len);
ssize_t usb_send_hex(char c, const void *data, uint32_t len);
ssize_t parse_cmdline_hex(char *cmdline, char *cmd, uint8_t *dest, size_t len);
int ringbuf_init(struct ringbuf *rb, uint8_t *buf, uint32_t size);
uint32_t ringbuf_count(struct ringbuf *rb);
int ringbuf_at(struct ringbuf *rb, uint32_t pos);
int ringbuf_peek(struct ringbuf *rb, uint8_t *dst, uint32_t off, uint32_t len);
int ringbuf_read(struct ringbuf *rb, uint8_t *dst, uint32_t len);
int ringbuf_write(struct ringbuf *rb, uint8_t *src, uint32_t len);


#endif
