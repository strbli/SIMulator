#ifndef __SIMEMU_H__
#define __SIMEMU_H__

#include "stm32f1xx_hal.h"
#include "usb_device.h"

struct cmd_hdr {
  uint8_t cla;
  uint8_t ins;
  uint8_t p1;
  uint8_t p2;
  uint8_t p3;
};

void simemu_init(SMARTCARD_HandleTypeDef *hsc);
void simemu_run();
int simemu_on_cmdline(char *cmd);
void simemu_on_pwr(int pwr);
void simemu_on_rst(int rst);
void simemu_on_tick();
void simemu_on_tx();
void simemu_on_rx();
void simemu_on_trx_error();
void simemu_on_serial();


#endif
