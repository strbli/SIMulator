const sprintf = require('sprintf-js').sprintf;
const Milenage = require('milenage');

const STATE_READY = 1;
const STATE_WAITING_ACK = 2;
const STATE_WAITING_RESP = 3;
const STATE_WAITING_COMMAND_DATA = 4;

class SimMITM {
    constructor(s, root) {
        this.sim = s;
        this.state = STATE_READY;
        this.currentCmd = null;

        const op_c = Buffer.from("00000000000000000000000000000000", 'hex');
        const key = Buffer.from("00000000000000000000000000000000", 'hex');
        this.milenage = Milenage({ op_c, key });

        this.sim.on('error', arg => this.simOnError(arg));

        this.sim.on('hdr', b => {
            this.currentCmd = b;
            this.sim.reader.sendHdr(b);
            this.state = STATE_WAITING_ACK;
        });

        this.sim.on('data', (b) => {
            this.sim.reader.sendData(b);
            this.state = STATE_WAITING_ACK;
        });

        this.sim.reader.on('ack', (arg) => {
            let dir = SimMITM.getDirection(this.currentCmd);
            if (dir === c2i) {
                this.state = STATE_WAITING_RESP;
            } else {
                if (dir !== i2c)
                    console.log(sprintf("direction of command %s not found", this.currentCmd.toString('hex')));
                this.sim.sendAck();
                this.state = STATE_WAITING_COMMAND_DATA;
            }
        });

        this.sim.reader.on('resp', (b) => {
            this.sim.sendData(b);
            this.state = STATE_READY;
        });

        this.sim.reader.on('status', (b) => {
            this.sim.sendStatus(b[0], b[1]);
            this.state = STATE_READY;
            this.currentCmd = null;
        });

        this.sim.reader.enableSim();
    }

    simOnError(arg) {
        this.state = STATE_READY;
        if (arg === 'RST') {
            console.log("");
            console.log("#########################");
            console.log("#                       #");
            console.log("#  Sim card got reset!  #");
            console.log("#                       #");
            console.log("#########################");
            console.log("");
        } else if (arg === 'OVERFLOW') {
            throw "OVERFLOW IN USB COMMUNICATION!";
        } else if (arg === 'MODEM_TRX') {
            console.log("TRX error with modem!");
        } else {
            throw new Error(arg);
        }
    }

    static getDirection(hdr) {
        switch (hdr[1]) {
            case 0x20: return i2c;
            case 0x2c: return c2i;
            case 0x70: return c2i;
            case 0x88: return i2c;
            case 0xa2: return i2c;
            case 0xa4: return i2c;
            case 0xb0: return c2i;
            case 0xb2: return c2i;
            case 0xc0: return c2i;
            case 0xd6: return i2c;
            case 0xdc: return c2i;
            case 0x10: return i2c;
            case 0x12: return c2i;
            case 0x14: return i2c;
            case 0xf2: return c2i;
            default: return null;
        }
    }
}

const c2i = 1;
const i2c = 2;


module.exports = SimMITM;