#ifndef __SIMRDR_H__
#define __SIMRDR_H__

#include "stm32f1xx_hal.h"
#include "usb_device.h"

void simrdr_init(SMARTCARD_HandleTypeDef *hsc);
void simrdr_run();
int simrdr_on_cmdline(char *cmd);
void simrdr_on_tick();
void simrdr_on_tx();
void simrdr_on_rx();
void simrdr_on_trx_error();
void simrdr_on_serial();


#endif
