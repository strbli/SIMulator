const tlv = require("./tlv");
const sprintf = require("sprintf-js").sprintf;
const assert = require("assert").strict;


const EFStructure = ['No information given', 'Transparent', 'Linear fixed, no further info',
    'Linear fixed SIMPLE-TLV', 'Linear variable, no further info', 'Linear variable SIMPLE-TLV',
    'Cyclic, no further info', 'Cyclic, SIMPLE-TLV'];
const FileType = ['Working EF', 'Internal EF', 2, 3, 4, 5, 6, 'DF'];
const WriteBehavior = ['one-time write', 'proprietary', 'write OR', 'write AND'];

function parse(buf) {
    let fcp;
    if (Buffer.isBuffer(buf)) {
        fcp = tlv.decode(buf);
    } else {
        fcp = buf;
    }

    fcp = fcp.find(t => t.tag === 0x62);
    if (!fcp)
        return null;
    fcp = fcp.val;
    
    let result = {};

    for (var k in fcp) {
        let t = fcp[k];
        switch (t.tag) {
            case 0x80:
                assert(!("File_Size_Data" in result));
                assert(t.val.length === 2);
                result.File_Size_Data = t.val.readUInt16BE();
                break;

            case 0x81:
                assert(!("File_Size_Total" in result));
                assert(t.val.length === 2);
                result.File_Size_Total = t.val.readUInt16BE();
                break;

            case 0x82:
                assert(!("File_Descriptor" in result));
                assert(t.val.length >= 1);
                let fd = { raw: t.val.toString('hex') };
                let file_desc_byte = t.val[0];
                if ((file_desc_byte & 0x80) === 0) {
                    fd.shareable = (file_desc_byte & 0x40) === 0x40;
                    let file_type = (file_desc_byte & 0x38) >> 3;
                    fd.file_type = FileType[file_type];
                    let EF_structure = file_desc_byte & 0x07;
                    fd.EF_structure = EFStructure[EF_structure];
                }

                if (t.val.length >= 2) {
                    let data_coding_byte = t.val[1];
                    let behavior_of_write_functions = (0x60 & data_coding_byte) >> 5;
                    fd.behavior_of_write_functions = WriteBehavior[behavior_of_write_functions];
                    fd.Data_unit_size = data_coding_byte & 0x07;
                }

                if (t.val.length >= 4) {
                    fd.Maximum_record_size = t.val[2] * 256 + t.val[3];
                } else if (t.val.length === 3) {
                    fd.Maximum_record_size = t.val[2];
                }
                result.File_Descriptor = fd;
                break;

            case 0x83:
                assert(!("File_Identifier" in result));
                assert(t.val.length === 2);
                result.File_Identifier = t.val.toString('hex');
                if (!("SFI" in result)) {
                    result.SFI = t.val[1] & 0x1f;
                }
                break;

            case 0x84:
                assert(!("AID" in result));
                assert(t.val.length >= 1 && t.val.length <= 16);
                result.AID = t.val.toString('hex');
                break;

            case 0x85:
                assert(!("Proprietary_Primitive" in result));
                result.Proprietary_Primitive = t.val.toString('hex');
                break;

            case 0x86:
                assert(!("Security_Attributes" in result));
                result.Security_Attributes = t.val.toString('hex');
                break;

            case 0x87:
                assert(!("FCI_ext_EF_id" in result));
                assert(t.val.length === 2);
                result.FCI_ext_EF_id = t.val.toString('hex');
                break;

            case 0x88:
                assert(!("SFI_Support" in result));
                assert(t.val.length <= 1);
                if (t.val.length === 0) {
                    result.SFI_Support = false;
                    result.SFI = null;
                } else {
                    assert.equal(t.val[0] & 0x07, 0);
                    let sfi = t.val[0] >> 3;
                    assert.notEqual(sfi, 0);
                    assert.notEqual(sfi, 31);
                    result.SFI_Support = true;
                    result.SFI = sfi;
                }
                break;

            case 0x8a:
                assert(!("Life_Cycle_Status" in result));
                result.Life_Cycle_Status = t.val.toString('hex');
                break;

            case 0x8b:
                assert(!("Security_Attribute_Reference_Format" in result));
                result.Security_Attribute_Reference_Format = t.val.toString('hex');
                break;

            case 0x8c:
                assert(!("Security_Attribute_Compact_Format" in result));
                result.Security_Attribute_Compact_Format = t.val.toString('hex');
                break;

            case 0xab:
                assert(!("Security_Attribute_Template_Expanded_Format" in result));
                result.Security_Attribute_Template_Expanded_Format = t.val;
                break;

            case 0xa5:
                assert(!("Proprietary_Template" in result));
                result.Proprietary_Template = t.val;
                break;

            case 0xc6:
                assert(!("PIN_Status_data_objects" in result));
                result.PIN_Status_data_objects = t.val.toString('hex');
                break;

            default:
                let name = sprintf("tag_%x", t.tag);
                assert(!(name in result));
                if ((t.tag & 0x20) === 0x20)
                    result[name] = t.val;
                else
                    result[name] = t.val.toString('hex');
                break
        }
    }

    return result;
}

module.exports = {
    parse,
    EFStructure, WriteBehavior, FileType
};
