const EventEmitter = require('events');

function createMockSerial() {
    let wrote = [];

    let mockSerial = new EventEmitter();

    mockSerial.write = function (text, callback) {
        if (typeof text !== "string") {
            throw new Error("write() called with no string");
        }
        wrote.push(text.trimRight());
        if (typeof callback === 'function') {
            callback();
        }
    };

    mockSerial.flush = function () {};

    mockSerial.getSent = function () {
        if (wrote.length === 0) {
            throw new Error("Nothing to read");
        }
        let s = wrote.shift();
        return s.split(' ');
    };

    return mockSerial;
}

module.exports = createMockSerial;