const sprintf = require('sprintf-js').sprintf;
const Milenage = require('milenage');
const root = require("./files");
const tlv = require("../../tlv");
const base = require("../../sim");


const FILE_NOT_FOUND = 0x6a82;

class SimEmu extends base {
    constructor(s) {
        super(s, root);
        this.clas[0x80][0x10] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "PERFORM SCQL OPERATION" };
            this.sim.sendAckGetData((cmdData) => {
                console.log("PERFORM SCQL OPERATION, handling data");
                this.setFetched(Buffer.from("d03a810301250082028182050c534d532053657276696365738f0e80496e666f2053657276696365738f0b81577c72746572627563688f0482466178", 'hex'));
                this.sendSuccStatus();
            });
        };
        this.clas[0x80][0xC2] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "ENVELOPE" };
            this.sim.sendAckGetData((cmdData) => {
                console.log("ENVELOPE received, contains " + cmdData.toString('hex'));
                this.setFetched(Buffer.from(
                    "d0"+"09"+
                    "81"+"03"+"012606"+
                    "82"+"02"+"8182", 'hex'));
                this.sendSuccStatus();
            });
        };
        this.clas[0x80][0x14] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "TERMINAL RESPONSE" };
            this.sim.sendAckGetData((cmdData) => {
                if (c.Apdu.hdr.p3 === 0x16) {
                    this.fetchedResp = Buffer.from("d00e810301050082028182190303090a", 'hex');
                } else if (c.Apdu.hdr.p3 === 0x10) {
                    this.fetchedResp = null;
                }

                if (this.fetchedResp) {
                    this.sw1_succ = 0x91;
                    this.sw2_succ = this.fetchedResp.length;
                } else {
                    this.sw1_succ = 0x90;
                    this.sw2_succ = 0;
                }
                this.sendSuccStatus();
            });
        };
        this.clas[0x80][0xf2] = (c, hdr) => {
            c.Apdu = {hdr: hdr, name: "GET STATUS"};
            let status = this.getStatus(hdr.p1, hdr.p2);
            if (hdr.p3 === status.length) {
                if (status.length === 0)
                    this.sendSuccStatus();
                else
                    this.sendData(status);
            } else
                this.sim.sendStatus(0x6c, status.length);
        };

        const op_c = Buffer.from("9D3E6CC3875CD8EFEEA121D18A52F795", 'hex');
        const key = Buffer.from("A4E80E161AFDC33A90ECFC8A0F8AD9B8", 'hex');
        this.milenage = Milenage({ op_c, key });
    }

    getStatus(p1, p2) {
        // 84 0c a0000000871002ff49ff0589
        if (p2 === 0x01) {
            let status_current_MF = {num: 3, cla: 2, val: Buffer.from("3f00", 'hex')};
            if (typeof this.c.AID !== "undefined") {
                status_current_MF = {num: 4, cla: 2, val: Buffer.from(this.c.AID, 'hex')};
            }
            let status = tlv.encode([status_current_MF]);
            console.log("Status is " + status.toString('hex'));
            return status;
        } else if (p2 === 0) {
            return Buffer.from("623482027821840CA0000000871002FF49FF05898A01058B032F0618C61890017E83010183010A83010B83010C83010D83010E830181", 'hex');
        } else {
            return "";
        }
    }

    terminalResponse(p1, p2) {
        let hdr = this.c.Apdu.hdr;
        if (hdr.p3 === 0x16) {
            this.fetchedResp = Buffer.from("d00e810301050082028182190303090a", 'hex');
        } else if (hdr.p3 === 0x0c) {
            this.fetchedResp = Buffer.from("d00d8103010300820281820402011e", 'hex');
        } else if (hdr.p3 === 0x10) {
            this.fetchedResp = null;
        }
    }
}


module.exports = SimEmu;
