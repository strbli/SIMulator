const sprintf = require('sprintf');
const Milenage = require('milenage');
const tlv = require("./tlv");
const fcpParser = require("./fcp");


const FILE_NOT_FOUND = 0x6a82;

function newHDR(b) {
    let hdr = {};
    hdr.cla = b[0];
    hdr.ins = b[1];
    hdr.p1 = b[2];
    hdr.p2 = b[3];
    hdr.p3 = b[4];
    return hdr;
}

class Sim {
    constructor(s, root) {
        this.sim = s;
        this.root = root;

        this.sw1_succ = 0x90;
        this.sw2_succ = 0;
        this.fetchedResp = null;

        const op_c = Buffer.from("00000000000000000000000000000000", 'hex');
        const key = Buffer.from("00000000000000000000000000000000", 'hex');
        this.milenage = Milenage({ op_c, key });

        this.channels = [
            {idx:0, MF:root[0x3f00]},
            {idx:1, MF:root[0x3f00]},
            {idx:2, MF:root[0x3f00]},
            {idx:3, MF:root[0x3f00]}
        ];
        this.c = this.channels[0];

        let clas = {
            0: {},
            0x80: {}
        };

        clas[0][0x20] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "VERIFY" };
            if (hdr.p3 === 0) {
                this.sim.sendStatus(0x63, 0xc3);
            } else {
                this.sim.sendAckGetData((cmdData) => {
                    console.log("Verify, handling data");
                    this.sendSuccStatus();
                })
            }
        };
        clas[0][0x2C] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "VERIFY" };
            this.sim.sendStatus(0x63, 0xca);
        };
        clas[0][0x70] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "MANAGE CHANNEL" };
            let response = Buffer.from("01", 'hex');
            if (hdr.p3 === response.length) {
                this.sendData(response);
            } else {
                this.sim.sendStatus(0x6c, response.length);
            }
        };
        clas[0][0x88] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "INTERNAL AUTHENTICATE" };
            if (hdr.p1 !== 0) {
                throw "Algorithm not implemented";
            }
            this.sim.sendAckGetData((cmdData) => {
                console.log("INTERNAL AUTHENTICATE, handling data");

                if (hdr.p2 === 8 || hdr.p2 === 0x81) {
                    let resp = this.authenticateMilenage(hdr.p2, cmdData);
                    this.prepResponse(resp);
                } else {
                    throw sprintf("Secret %02x not implemented", hdr.p2);
                }
            });
        };
        clas[0][0xa2] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "SEARCH RECORD" };
            this.sim.sendAckGetData((cmdData) => {
                console.log("Search record, handling data");
                let searchString = cmdData;
                let results = [];
                if (!c.EF.records) {
                    throw "File has no records";
                }
                for (let i in c.EF.records) {
                    let record = c.EF.records[i];
                    if (record instanceof Buffer) {
                        if (record.includes(searchString)) {
                            results.push(i & 0xff);
                        }
                    }
                }
                if (results.length === 0) {
                    this.sim.sendStatus(0x62, 0x82);
                } else {
                    let response = Buffer.from(results);
                    this.prepResponse(response);
                }
            });
        };
        clas[0][0xa4] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "SELECT FILE" };
            this.sim.sendAckGetData((cmdData) => {
                console.log("Select file, handling data");
                let response = this.selectFile(hdr.p1, hdr.p2, cmdData);
                if (response !== FILE_NOT_FOUND) {
                    // File found
                    if (response) {
                        this.prepResponse(response);
                    } else {
                        this.sendSuccStatus();
                    }
                } else {
                    // File not found
                    this.sim.sendStatus(0x6a, 0x82);
                }
            });
        };
        clas[0][0xb0] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "READ BINARY" };
            let { binary, off } = this.binaryFileSelection(c, hdr);

            let respLen = hdr.p3 === 0 ? 256 : hdr.p3;
            if (respLen <= binary.length) {
                this.sendData(binary.slice(off, off+respLen));
            } else {
                this.sim.sendStatus(0x6c, binary.length & 0xff);
            }
        };
        clas[0][0xc0] = (c, hdr) => {
            // "GET RESPONSE"
            let response = c.Apdu.resData;
            console.log("GET RESPONSE, c.Apdu = ");
            console.log(c.Apdu);
            if (hdr.p3 === response.length)
                this.sendData(response);
            else
                this.sim.sendStatus(0x6c, response.length);
        };
        clas[0][0xb2] = (c, hdr) => {
            c.Apdu = {hdr: hdr, name: "READ RECORD(S)"};
            let ef;
            let sfi = (hdr.p2 & 0xf8) >> 3;
            ef = this.getFileBySFI(c, sfi);
            if (ef == null) {
                this.sim.sendStatus(0x6a, 0x82);
                return;
            }
            c.EF = ef;

            let recordIdx;
            let record_selection = hdr.p2 & 0x07;
            if (record_selection === 0x04) {
                recordIdx = hdr.p1;
            } else if (record_selection === 0) {
                recordIdx = 1;
            } else {
                throw new Error(sprintf("READ RECORD(S) with record selection mode %d is not Implemented", record_selection));
            }

            if (hdr.p1 === 0) {
                throw new Error("READ RECORD(S) with P1 = 0 is not Implemented");
            } else {
                recordIdx = hdr.p1;
            }
            if (!('records' in ef)) {
                throw new Error("File has no records");
            }
            if (!(recordIdx in ef.records)) {
                throw new Error("Record " + recordIdx + " not found");
            }
            let record = ef.records[recordIdx];
            if (hdr.p3 === record.length) {
                this.sendData(record);
            } else {
                this.sim.sendStatus(0x6c, record.length);
            }
        };
        clas[0][0xd6] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "UPDATE BINARY" };
            let { binary, off } = this.binaryFileSelection(c, hdr);
            this.sim.sendAckGetData((cmdData) => {
                cmdData.copy(binary, off);
                this.sendSuccStatus();
            });
        };
        clas[0][0xdc] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "UPDATE RECORD" };
            this.sim.sendAckGetData((cmdData) => {
                let recordIdx;

                if (hdr.p2 === 4) {
                    if (hdr.p1 === 0) {
                        recordIdx = c.selectedRecord;
                    } else {
                        recordIdx = hdr.p1;
                    }
                } else if (hdr.p2 === 0) {
                    recordIdx = 0;
                } else if (hdr.p2 === 1) {
                    recordIdx = c.selectedFile.records.length - 1;
                } else if (hdr.p2 === 2) {
                    recordIdx = c.selectedRecord + 1;
                } else if (hdr.p2 === 3) {
                    recordIdx = c.selectedRecord;
                } else {
                    throw new Error("UPDATE RECORD with P2 = "+hdr.p2+" is not Implemented");
                }

                c.EF.records[recordIdx] = cmdData;
                this.sendSuccStatus();
            });
        };
        clas[0x80][0xf2] = (c, hdr) => {
            c.Apdu = {hdr: hdr, name: "GET STATUS"};
            let response = this.getStatus(hdr.p1, hdr.p2);
            if (hdr.p3 === response.length) {
                if (response.length === 0)
                    this.sendSuccStatus();
                else
                    this.sendData(response);
            } else
                this.sim.sendStatus(0x6C, response.length);
        };
        clas[0x80][0x10] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "PERFORM SCQL OPERATION" };
            this.sim.sendAckGetData((cmdData) => {
                console.log("PERFORM SCQL OPERATION, handling data");
                this.sendSuccStatus();
            });
        };
        clas[0x80][0x12] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "FETCH" };
            if (hdr.p3 === this.fetchedResp.length) {
                let fetched = this.fetchedResp;
                this.setFetched(null);
                this.sendData(fetched);
            } else {
                this.sim.sendStatus(0x6c, this.fetchedResp.length);
            }
        };
        clas[0x80][0x14] = (c, hdr) => {
            c.Apdu = { hdr: hdr, name: "TERMINAL RESPONSE" };
            this.sim.sendAckGetData((cmdData) => {
                this.terminalResponse(hdr.p1, hdr.p2);

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
        clas[0xa0] = clas[0];
        this.clas = clas;

        this.sim.on('error', arg => this.simOnError(arg));

        this.sim.on('hdr', b => this.simOnHdr(b));

        this.sim.on('data', (b) => {
            throw "Unhandled response data " + b;
        });
    }

    binaryFileSelection(c, hdr) {
        let ef = c.EF;

        if ((hdr.p1 & 0x80) === 0x80) {
            let sfi = hdr.p1 & 0x1f;
            ef = c.EF = this.getFileBySFI(c, sfi);
        }

        let off = hdr.p2;
        if ((hdr.p1 & 0x80) === 0) {
            off += hdr.p1 * 256;
        }

        let binary = ef.binary;
        if (!binary) {
            throw new Error("Binary not found in selected EF");
        }

        return { binary, off }
    }


    simOnError(arg) {
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

    simOnHdr(b)  {
        let hdr = newHDR(b);
        let handled = [0, 0x80, 0x90, 0xa0];
        if (handled.includes(hdr.cla & 0xf0)) {
            let cla = hdr.cla & 0xfc;
            let classes = this.clas;
            let currentChannelIdx = hdr.cla & 0x03;
            this.c = this.channels[currentChannelIdx];
            if (cla in classes && hdr.ins in classes[cla]) {
                let f = classes[cla][hdr.ins];
                f(this.c, hdr);
            } else {
                console.log(sprintf("INS %02x of CLA %02x not found", hdr.ins, hdr.cla));
            }
        }
    }

    sendSuccStatus() {
        this.sim.sendStatus(this.sw1_succ, this.sw2_succ);
    }

    sendData(data) {
        this.sim.sendAckDataStatus(data, this.sw1_succ, this.sw2_succ);
    }

    prepResponse(response) {
        console.log(sprintf(
            "    Preparing response (0x%02x) %s",
            response.length,
            response.toString('hex')));
        this.c.Apdu.resData = response;
        this.sim.sendStatus(0x61, response.length);
    }

    getStatus(p1, p2) {
        throw "Subclass didn't implement getStatus";
    }

    terminalResponse(p1, p2) {
        this.fetchedResp = null;
    }

    selectFileFromId(id) {
        let c = this.c;
        let type = (id & 0xff00) >> 8;
        console.log(sprintf("    Selecting id = 0x%04x", id));

        const sources = {
            0x2f: { source: "MF", destination: "EF" },
            0x3f: { source: "root", destination: "MF" },
            0x4f: { source: "DF2", destination: "EF" },
            0x5f: { source: "DF1", destination: "DF2" },
            0x6f: { source: "DF1", destination: "EF" },
            0x7f: { source: "MF", destination: "DF1" },
        };

        if (!(type in sources)) {
            throw "Unknown file type";
        }

        let s = sources[type];
        let sourceField = s.source;
        let destinationField = s.destination;
        let source;
        if (sourceField === "root") {
            source = this.root;
        } else {
            source = c[sourceField];
        }

        if (typeof source === "undefined") {
            throw "There is no currently selected " + sourceField;
        }

        if (!(id in source)) {
            return null;
        }

        let file = source[id];
        c[destinationField] = file;
        return file;
    }


    selectFile(p1, p2, cmdData) {
        let file = null;
        let id;
        console.log(sprintf("selectFile(0x%02X, 0x%02X, 0x%s)", p1, p2, cmdData.toString('hex')));

        if ((p2 & 0xf0) !== 0) {
            console.log("SELECT FILE RFU P2");
            return null;
        }

        if (p1 === 0) {
            id = cmdData.readUInt16BE(0);
            console.log(sprintf("  file 0x%04X", id));
            file = this.selectFileFromId(id);
        } else if (p1 === 0x04) {
            let name = cmdData.toString('hex');
            file = this.root.getADFbyID(name);
            this.c.DF1 = file;
            this.c.AID = name;
        } else if (p1 === 0x08) {
            let path = [0x3f00];
            for (let off = 0; off < cmdData.length; off += 2) {
                id = cmdData.readUInt16BE(off);
                path.push(id);
            }
            console.log("  selecting file " + path.map(d => sprintf("0x%04x", d),  id).join('/'));
            for (let i in path) {
                file = this.selectFileFromId(path[i]);
                if (file === null)
                    break;
            }
        }

        if (file === null || typeof(file) === 'undefined') {
            console.log("    FILE NOT FOUND");
            return FILE_NOT_FOUND;
        }

        this.c.selectedFile = file;

        let recordSelectionMode = p2 & 0x03;
        if (file.records) {
            if (recordSelectionMode === 0) {
                this.c.selectedRecord = 0;
            } else if (recordSelectionMode === 1) {
                this.c.selectedRecord = file.records.length - 1;
            } else if (recordSelectionMode === 2) {
                throw new Error("\"Next record\" is not implemented yet");
            } else if (recordSelectionMode === 3) {
                throw new Error("\"Previous record\" is not implemented yet");
            } else {
                throw new Error("Invalid record selection");
            }
        }

        let return_what = (p2 & 0x0c) >> 2;
        return_what = ['fci', 'fcp', 'fmd'][return_what];
        if (typeof return_what !== "undefined") {
            let tags = file[return_what];
            let result;
            if (typeof tags === "undefined") {
                console.log(sprintf("    File has no %s", return_what));
                return null;
            } else {
                result = tlv.encode(tags);
                console.log(sprintf("    returning %s: %s", return_what, result.toString('hex')));
                return result;
            }
        }

        return null;
    }


    getFileBySFI(c, sfi) {
        let getFcp = (file) => {
            if ("fcp" in file)
                return fcpParser.parse(file.fcp);
            return null
        };

        if (sfi === 0) {
            return c.EF;
        } else if (sfi === 31) {
            throw new Error(sprintf("SFI %d is not Implemented", sfi));
        } else {
            let dir = c.selectedFile;
            let dirId = -1;
            let dirFcp = getFcp(dir);
            if (dirFcp) {
                dirId = parseInt(dirFcp.File_Identifier, 16);
            }
            if ((dirId & 0xff00) === 0x4f00) {
                dir = c.DF2;
            } else if ((dirId & 0xff00) === 0x2f00) {
                dir = c.MF;
            } else if ((dirId & 0xff00) === 0x6f00) {
                dir = c.DF1;
            }
            for (let i in dir) {
                let ef = dir[i];
                if (typeof ef !== "object")
                    continue;

                let fcp = getFcp(ef);
                if (fcp) {
                    if (fcp.SFI === sfi) {
                        console.log(sprintf("SFI %d found as file 0x%s", sfi, fcp.File_Identifier));
                        return ef;
                    }
                }
            }
            console.log(sprintf("SFI %d not found in file 0x%04x", sfi, dirId));
            return null;
        }
    }


    authenticateMilenage(secret, data) {
        console.log("AUTHENTICATING WITH MILENAGE ALGORITHM");

        let randLen = data[0];
        let rand = data.slice(1, 1 + randLen);
        if (rand.length !== 16)
            throw "Unexpected RAND length";

        let autnLen = data[1 + randLen];
        let autn = data.slice(2 + randLen, 2 + randLen + autnLen);
        if (autn.length !== 16)
            throw "Unexpected AUTN length";

        let { res, ck, ik, ak } = this.milenage.f2345(rand);
        res = Buffer.from(res);
        ck = Buffer.from(ck);
        ik = Buffer.from(ik);

        let amf = autn.slice(6, 8);
        let mac = autn.slice(8, 16);
        let sqn = [0, 1, 2, 3, 4, 5].map(i => autn[i] ^ ak[i]);
        sqn = Buffer.from(sqn);

        let kc = Array(8);
        for (let i = 0; i < 8; i++)
            kc[i] = ck[i] ^ ck[i + 8] ^ ik[i] ^ ik[i + 8];
        kc = Buffer.from(kc);

        let resp = Buffer.alloc(53);
        resp.writeUInt8(0xdb, 0);
        resp.writeUInt8(8, 1);
        res.copy(resp, 2);
        resp.writeUInt8(16, 10);
        ck.copy(resp, 11);
        resp.writeUInt8(16, 27);
        ik.copy(resp, 28);
        resp.writeUInt8(8, 44);
        kc.copy(resp, 45);

        return resp;
    }


    setFetched(response) {
        this.fetchedResp = response;
        if (response) {
            this.sw1_succ = 0x91;
            this.sw2_succ = this.fetchedResp.length;
        } else {
            this.sw1_succ = 0x90;
            this.sw2_succ = 0;
        }
    }
}


module.exports = Sim;
module.exports.tlv = require("./tlv");
module.exports.fcp = require("./fcp");