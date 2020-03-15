# SIMulator Setup

TODO: actual readme will be available soon

## Hardware
- STM32F103
- Breadboard
- SIM holder
- Level shifter (optional)
- Resistors
- LEDs for status indictation (optional)
- Wires

## schematic
![Schematic](https://epozzobon.it/images/SIMulator-schematic.png)

## USB CDC serial driver
- linux: set up permissions in udev & join the plugdev group
- windows: install a driver maybe?

# Compilation and flashing of the firmware

```bash
sudo pacman -S arm-none-eabi-gcc arm-none-eabi-binutils arm-none-eabi-gdb arm-none-eabi-newlib
git clone https://github.com/strbli/SIMulator.git SIMulator
cd SIMulator/emu-sim-fw
make

# Flash build/simemu.bin with you preferred tool, e.g. stm32flash
yay -S stm32flash
stm32flash -w build/simemu.bin /dev/ttyUSB0
```

# Program installation
```bash
sudo pacman -S nodejs npm
cd SIMulator/simemu-js
npm install
npm start /dev/ttyACM0 sims/passthrough/simemu.js
```

## Customzing emulated SIM cards

## Customizing the SIM Man-In-The-Middle

# API REFERENCE!
