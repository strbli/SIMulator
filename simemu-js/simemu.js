const EventEmitter = require('events');
const sprintf = require('sprintf');

const STATE_WAIT_HDR = 1;
const STATE_WAIT_DATA = 2;
const STATE_SENDING_ACK = 3;
const STATE_SENDING_STATUS = 5;

class SimEmu extends EventEmitter {
    constructor(port) {
        super();
        let sc = this;
        this.state = STATE_WAIT_HDR;
        this.port = port;
        this.dataCallback = null;
        this.reader = new Reader(this);

        let queue = "";
        port.on('data', (str) => {
            queue += str;
            while (1) {
                let o = queue.indexOf('\n');
                if (o === -1) {
                    return;
                }

                let str = queue.substr(0, o);
                queue = queue.substr(o+1);
                this.onLine(str);
                this.reader.onLine(str);
            }
        });
    }

    write(str, callback) {
        console.log("> > > Writing '" + str + "'");
        this.port.write(str + "\n", callback);
        this.port.flush();
    }

    sendStatus(sw1, sw2, callback) {
        if (this.state !== STATE_SENDING_STATUS && this.state !== STATE_SENDING_ACK) {
            this.emit('error', "Unexpected send status in state " + this.state);
        } else {
            let sw1sw2 = Buffer.from([sw1, sw2]).toString('hex');
            this.write("S " + sw1sw2, callback);
            this.state = STATE_WAIT_HDR;
        }
    }

    sendAckDataStatus(data, sw1, sw2, callback) {
        if (this.state !== STATE_SENDING_ACK) {
            this.emit('error', "Unexpected send data in state " + this.state);
        } else {
            data = data.toString('hex');
            this.state = STATE_SENDING_STATUS;
            this.write("R " + data, (err) => {
                if (err || typeof sw1 !== 'number') {
                    if (callback) { callback(err); }
                } else {
                    this.sendStatus(sw1, sw2, callback);
                }
            });
        }
    }

    sendAckGetData(dataCallback, callback) {
        if (this.state !== STATE_SENDING_ACK) {
            this.emit('error', "Unexpected send ack in state " + this.state);
        } else {
            this.state = STATE_WAIT_DATA;
            this.dataCallback = dataCallback;
            this.write("A", callback);
        }
    }

    sendAck(callback) {
        this.sendAckGetData(null, callback)
    }

    sendData(data, callback) {
        this.sendAckDataStatus(data, null, null, callback)
    }

    onLine(str) {
        console.log("< < <  '" + str + "'");

        let args = str.split(' ');
        let f = args[0];
        let arg = args[1];

        switch (f) {
            case 'I': {
                this.emit('info', arg);
            } break;

            case 'E': {
                this.emit('error', arg);
                this.state = STATE_WAIT_HDR;
            } break;

            case 'P': {
                let b = Buffer.from(arg, 'hex');
                this.emit('pts', b);
            } break;

            case 'C': {
                if (this.state !== STATE_WAIT_HDR) {
                    this.emit('error', "Unexpected hdr in state " + this.state);
                }
                let b = Buffer.from(arg, 'hex');
                this.state = STATE_SENDING_ACK;
                this.emit('hdr', b);
            } break;

            case 'D': {
                if (this.state !== STATE_WAIT_DATA) {
                    this.emit('error', "Unexpected data in state " + this.state);
                    this.state = STATE_WAIT_HDR;
                } else {
                    let b = Buffer.from(arg, 'hex');
                    this.state = STATE_SENDING_STATUS;
                    if (this.dataCallback) {
                        this.dataCallback(b);
                        this.dataCallback = null;
                    } else {
                        this.emit('data', b);
                    }
                }
            } break;
        }
    }
}

class Reader extends EventEmitter {
    constructor(simemu) {
        super();
        this.simemu = simemu;
    }

    onLine(str) {
        let args = str.split(' ');
        let f = args[0];
        let arg = args[1];

        switch (f) {
            case 'i': {
                this.emit('info', arg);
            } break;

            case 'e': {
                this.emit('error', arg);
            } break;

            case 't': {
                let b = Buffer.from(arg, 'hex');
                this.emit('atr', b);
            } break;

            case 'p': {
                let b = Buffer.from(arg, 'hex');
                this.emit('pts', b);
            } break;

            case 'a': {
                this.emit('ack', arg);
            } break;

            case 'n': {
                let b = Buffer.from(arg, 'hex');
                this.emit('nul', b);
            } break;

            case 'r': {
                let b = Buffer.from(arg, 'hex');
                this.emit('resp', b);
            } break;

            case 's': {
                let b = Buffer.from(arg, 'hex');
                this.emit('status', b);
            } break;
        }
    }

    sendHdr(hdr, callback) {
        let hexBuf = hdr.toString('hex');
        this.simemu.write("h " + hexBuf, callback);
    }

    sendData(data, callback) {
        let hexBuf = data.toString('hex');
        this.simemu.write("d " + hexBuf, callback);
    }

    setGPIO(power, reset, callback) {
        let byte = 0;
        if (power)
            byte |= 1;
        if (reset)
            byte |= 2;
        this.simemu.write(sprintf("o %02x", byte), callback);
    }

    enableSim(callback) {
        this.setGPIO(1, 1, callback);
    }
}

module.exports = SimEmu;