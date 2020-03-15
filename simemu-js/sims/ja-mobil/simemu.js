const sprintf = require('sprintf-js').sprintf;
const Milenage = require('milenage');
const root = require("./files");
const tlv = require("../../tlv");
const base = require("../../sim");


const FILE_NOT_FOUND = 0x6a82;

class SimEmu extends base {
    constructor(s) {
        super(s, root);
    }

    getStatus(p1, p2) {
        let status_current_MF = {num: 3, cla: 2, val: Buffer.from("3f00", 'hex')};
        if (typeof this.c.AID !== "undefined") {
            status_current_MF = {num: 4, cla: 2, val: Buffer.from(this.c.AID, 'hex')};
        }

        let status_5 = {num: 5, cla: 2, val: [
                {num: 0, cla: 2, val: Buffer.from("71", 'hex')},
                {num: 1, cla: 2, val: Buffer.from("010a32", 'hex')},
                {num: 2, cla: 2, val: Buffer.from("0a", 'hex')},
                {num: 3, cla: 2, val: Buffer.from("0000548a", 'hex')},
            ]};
        if (typeof this.c.AID === "undefined") {
            status_5.val.splice(1,2);
        }

        let status_1 = {num: 1, cla: 2, val: Buffer.from("00015441", 'hex')};
        if (typeof this.c.AID !== "undefined") {
            status_1.val = Buffer.from("00000cfc", 'hex');
        }

        let status_11 = {num: 11, cla: 2, val: Buffer.from("2f0602", 'hex')};
        if (typeof this.c.AID !== "undefined") {
            status_11.val = Buffer.from("2f0608", 'hex');
        }

        let status_object = [{
            num: 2, cla: 1, val: [
                {num: 2, cla: 2, val: Buffer.from("7821", 'hex')},
                status_current_MF,
                status_5,
                {num: 10, cla: 2, val: Buffer.from("05", 'hex')},
                status_11,
                {num: 6, cla: 3, val: Buffer.from("900140830101830181", 'hex')},
                status_1
            ]
        }];
        let status = tlv.encode(status_object);
        console.log("Status is " + status.toString('hex'));
        return status;
    }
}


module.exports = SimEmu;