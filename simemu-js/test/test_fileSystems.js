const EventEmitter = require('events');
const fs = require('fs');
const SimEmu = require("../simemu");
const MockSerial = require("./mock-serial");
const assert = require("assert").strict;
const fcp_lib = require("../fcp");
let util = require("util");


function forAllChildren(dir, callback) {
    for (let key in dir) {
        if (!dir.hasOwnProperty(key)) continue;
        let i = parseInt(key, 0);
        if (!(0 <= i && i <= 0xffff)) continue;
        if (!dir.hasOwnProperty(i)) continue;
        let file = dir[i];

        if (!file.hasOwnProperty("id")) {
            let fcp;
            if (file.fcp && (fcp = fcp_lib.parse(file.fcp)) && fcp.File_Identifier) {
                file.id = parseInt(fcp.File_Identifier, 16);
            } else {
                file.id = i;
            }
        }

        if (i < 0x7f00) {
            if (file.hasOwnProperty("id"))
                assert.equal(file.id, i, pfile(file));
        }

        callback(i, file);
    }
}

function pfile(file) {
    if (file.name)
        return file.name;
    if (file.id)
        return file.id.toString(16);
    if (file.fcp)
        return file.fcp.toString('hex');
    throw new Error("this file has no idendification");
}

function checkFile(file) {
    if (!file.hasOwnProperty("fcp")) {
        console.log(`file ${pfile(file)} has no fcp`);
        return;
    }
    let fcp = fcp_lib.parse(file.fcp);
    if (fcp === null) {
        console.log(`file ${pfile(file)} has null fcp`);
        return;
    }

    if (file.hasOwnProperty("id") && fcp.hasOwnProperty("File_Identifier"))
        assert.equal(parseInt(fcp.File_Identifier, 16), file.id, pfile(file));

    if (fcp.hasOwnProperty("File_Descriptor")) {
        let fd = fcp.File_Descriptor;
        switch (fd.EF_structure) {
            case fcp_lib.EFStructure[0]:
                assert.equal(fcp.File_Descriptor.file_type, fcp_lib.FileType[7]);
                break;

            case fcp_lib.EFStructure[1]:
                assert(!file.hasOwnProperty("records"), pfile(file));
                assert(fcp.hasOwnProperty("File_Size_Data"));
                if (!file.hasOwnProperty("binary")) {
                    console.log(`File ${pfile(file)} has no binary, should have ${fcp.File_Size_Data} bytes.`);
                }
                if (file.hasOwnProperty("binary")) {
                    assert.equal(fcp.File_Size_Data, file.binary.length, pfile(file));
                }
                break;

            case fcp_lib.EFStructure[2]:
            case fcp_lib.EFStructure[6]:
                assert(!file.hasOwnProperty("binary"), pfile(file));
                assert(fd.hasOwnProperty("Maximum_record_size"));
                assert(fcp.hasOwnProperty("File_Size_Data"));
                let exp_record_count = fcp.File_Size_Data / fd.Maximum_record_size;
                assert.equal(exp_record_count, exp_record_count | 0, pfile(file));
                if (!file.hasOwnProperty("records"))
                    console.log(`File ${pfile(file)} has no records, `
                        + `should have ${exp_record_count} of size ${fd.Maximum_record_size}`);
                if (file.hasOwnProperty("records")) {
                    for (let i = 1; i < file.records.length; i++) {
                        let record = file.records[i];
                        assert(Buffer.isBuffer(record), pfile(file));
                        assert.equal(record.length, fd.Maximum_record_size, pfile(file));
                    }
                    if (file.records.length - 1 !== exp_record_count) {
                        console.log(`File ${pfile(file)} has ${file.records.length - 1} records, `
                            + `should have ${exp_record_count}`);
                    }
                }
                break;

            default:
                console.log(fd.EF_structure);
                break;
        }
    }
}

function checkEF(file) {
    checkFile(file);
}

function checkDir(dir) {
    checkFile(dir);

    forAllChildren(dir, (id, file) => {
        let type = id >> 8;

        checkFile(file);
        if (type === 0x2f || type === 0x4f || type === 0x6f) {
            checkEF(file);
        } else if (type === 0x7f || type === 0x5f) {
            checkDir(file);
        } else {
            assert.fail("unknown file type " + type.toString(16));
        }
    });
    return true;
}

function checkFileSystem(root) {
    let MF = root[0x3f00];
    assert.equal(MF.name, "MF");
    checkDir(MF);
}

module.exports = {checkFileSystem};

describe("SimEmu file systems", function () {
    describe("Check emulated SIM cards' file systems", function () {
        it("Check Ja! mobil SIM card", function () {
            const Sim = require('../sims/ja-mobil/simemu');
            const sim = new Sim(new SimEmu(MockSerial()));
            checkFileSystem(sim.root);
        });
        it("Check vodafone.it SIM card", function () {
            const Sim = require('../sims/vodafone.it/simemu');
            const sim = new Sim(new SimEmu(MockSerial()));
            checkFileSystem(sim.root);
        });
        it("Check k-classic SIM card", function () {
            const Sim = require('../sims/k-classic/simemu');
            const sim = new Sim(new SimEmu(MockSerial()));
            checkFileSystem(sim.root);
        });
    });
});
