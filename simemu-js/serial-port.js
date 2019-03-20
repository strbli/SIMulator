const fs = require('fs');
const termios = require('termios');
const EventEmitter = require('events');

class SerialPort extends EventEmitter {
    constructor(ttyPath) {
        super();
        this.fd = null;
        this.ttyPath = ttyPath;
    }

    open(cb) {
        const O_RDWR = 2;
        const O_NOCTTY = 0x1000;
        const O_SYNC = 0x1000000;
        let flags = O_RDWR | O_NOCTTY | O_SYNC;
        flags = 'rs+';
        fs.open(this.ttyPath, flags, (err, fd) => {
            if (err) {
                if (cb) {
                    cb(err);
                }
                return;
            }

            let tty_state = termios.getattr(fd);
            tty_state.lflag.ICANON = false;  // don't canonicalize input lines
            tty_state.lflag.IEXTEN = false;  // disable DISCARD and LNEXT
            tty_state.lflag.ISIG = false;  // disable signals INTR, QUIT, [D]SUSP
            tty_state.lflag.ECHO = false;  // disable echoing
            tty_state.iflag.ICRNL = false;  // don't map CR to NL (ala CRMOD)
            tty_state.iflag.INPCK = false;  // disable checking of parity errors
            tty_state.iflag.ISTRIP = false;  // don't strip 8th bit off chars
            tty_state.iflag.IXON = false;  // disable output flow control
            tty_state.iflag.BRKINT = false;  // don't map BREAK to SIGINT
            tty_state.oflag.OPOST = false;  // disable output post-processing
            tty_state.cflag.CS8 = true;  // 8 bits per transfer
            termios.setattr(fd, tty_state);

            this.fd = fd;
            const stream = fs.createReadStream(null, {fd});
            stream.on('data', (d) => this.emit('data', d));

            if (cb) {
                cb(null);
            }
        });
    }

    write(d, callback) {
        fs.write(this.fd, d, (err) => {
            if (err) {
                console.log("Serial port write error: " + err);
            }
            if (callback) {
                callback(err);
            }
        });
    }

    // these functions are here for compatibility with the serial-port module
    flush() { }
    drain() { }
}

module.exports = SerialPort;