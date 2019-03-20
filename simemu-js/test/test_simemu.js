const fs = require('fs');
const assert = require("assert").strict;
const SimEmu = require("../simemu");
const MockSerial = require("./mock-serial");
let util = require("util");

function performTest(module, log) {
    let serial = MockSerial();
    let sim = new SimEmu(serial);
    let simemu = new module(sim);

    let file = {};
    let contents = fs.readFileSync(log);
    file.lines = contents.toString('ascii').split('\n');
    file.currentLine = 0;
    file.read = function () {
        while (file.currentLine < file.lines.length) {
            let line = file.lines[file.currentLine++];
            console.log("PARSING LOG LINE " + file.currentLine);
            let args = line.split(': ', 2);
            if (args.length === 2) {
                let type = args[0];
                let data = args[1];
                return {type, data};
            }
        }
    };

    while (file.currentLine < file.lines.length) {
        let h = file.read();
        if (!h) {
            break;
        }
        assert.equal(h.type, 'HDR');

        serial.emit('data', 'C ' + h.data + '\n');
        let sent = serial.getSent();

        let a = file.read();
        while (a.type === 'NULL') {
            a = file.read();
        }
        let s = null;

        if (a.type === 'ACK') {
            if (sent[0] === 'A') {
                let d = file.read();
                assert.strictEqual(d.type, "DATA");
                serial.emit('data', 'D ' + d.data + '\n');

                s = file.read();
                sent = serial.getSent();
            } else if (sent[0] === 'R') {
                let r = file.read();
                assert.strictEqual(r.type, "DATA");
                assert.equal(sent[1].toUpperCase(), r.data.toUpperCase());

                s = file.read();
                sent = serial.getSent();
            } else {
                assert.fail(sent[0]);
                throw "Expected ACK or Response, got " + sent[0] + ", line " + i;
            }
        } else if (a.type === 'STATE') {
            s = a;
        }

        while (s.type === 'NULL') {
            s = file.read();
        }

        assert.strictEqual(s.type, "STATE");
        assert.strictEqual(sent[0], "S");
        assert.strictEqual(sent[1].toUpperCase(), s.data.toUpperCase());
    }

    console.log("");
    console.log("TEST FINISHED WITHOUT EXCEPTIONS");
    return true;
}

module.exports = performTest;

describe("SimEmu", function () {
    describe("Compare acquired log to the emulated cards", function () {
        it("Emulate Ja! mobil SIM card", function () {
            const simEmu0 = require('../sims/ja-mobil/simemu');
            performTest(simEmu0, './sims/ja-mobil/apdu.log');
        });
        it("Emulate vodafone.it SIM card", function () {
            const simEmu2 = require('../sims/vodafone.it/simemu');
            performTest(simEmu2, './sims/vodafone.it/apdu.log');
        });
        it("Emulate k-classic SIM card", function () {
            const simEmu2 = require('../sims/k-classic/simemu');
            performTest(simEmu2, './sims/k-classic/apdu.log');
        });
    });
});
