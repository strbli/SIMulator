const sprintf = require('sprintf');
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
                this.setFetched(Buffer.from("d081a8810301250082028182050c566f6461666f6e652053494d8f140a53657276697a692070657220507269766174698f140b53657276697a692070657220417a69656e64658f070c4d75736963618f040d46756e8f070e47696f6368698f060f53706f72748f05104e6577738f09114f726f73636f706f8f1212436f6d6d756e69747920467269656e64738f0a134d6f62696c655061798f1114506172746e657220566f6461666f6e65", 'hex'));
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

        const op_c = Buffer.from("9D3E6CC3875CD8EFEEA121D18A52F795", 'hex');
        const key = Buffer.from("A4E80E161AFDC33A90ECFC8A0F8AD9B8", 'hex');
        this.milenage = Milenage({ op_c, key });
    }

    getStatus(p1, p2) {
        if (p2 === 12) {
            return "";
        }
        let status_current_MF = {num: 3, cla: 2, val: Buffer.from("3f00", 'hex')};
        if (typeof this.c.AID !== "undefined") {
            status_current_MF = {num: 4, cla: 2, val: Buffer.from(this.c.AID, 'hex')};
        }
        let status = tlv.encode([status_current_MF]);
        console.log("Status is " + status);
        return status;
    }
}


module.exports = SimEmu;
