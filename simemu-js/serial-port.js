const fs = require('fs');
const termios = require('node-termios');
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

            let tty_state = termios.Termios(fd);
            const sym = termios.native.ALL_SYMBOLS;
            tty_state.c_lflag &= ~sym.ICANON;  // don't canonicalize input lines
            tty_state.c_lflag &= ~sym.IEXTEN;  // disable DISCARD and LNEXT
            tty_state.c_lflag &= ~sym.ISIG;    // disable signals INTR, QUIT, [D]SUSP
            tty_state.c_lflag &= ~sym.ECHO;    // disable echoing
            tty_state.c_iflag &= ~sym.ICRNL;   // don't map CR to NL (ala CRMOD)
            tty_state.c_iflag &= ~sym.INPCK;   // disable checking of parity errors
            tty_state.c_iflag &= ~sym.ISTRIP;  // don't strip 8th bit off chars
            tty_state.c_iflag &= ~sym.IXON;    // disable output flow control
            tty_state.c_iflag &= ~sym.BRKINT;  // don't map BREAK to SIGINT
            tty_state.c_oflag &= ~sym.OPOST;   // disable output post-processing
            tty_state.c_cflag |= sym.CS8;      // 8 bits per transfer
            tty_state.writeTo(fd);

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
