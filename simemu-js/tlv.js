let sprintf = require('sprintf');



function decode_BER_TLV(buf) {
    let result = [];
    let i = 0;
    while (i < buf.length) {

        let lead = buf[i++];

        // 00 or FF are padding due to erased or modified TLV-coded data objects
        if (lead === 0xff || lead === 0) {
            continue;
        }

        // Bits B8 and B7: tag class: [ universal, application, context-specific, private ]
        let cla = (lead & 0xc0) >> 6;

        // B6: primitive (0) or constructed (1) data object
        let b6 = (lead & 0x20) !== 0;

        // Bits B5-B1: tag number
        let num = (lead & 0x1f);
        let tag = lead;
        if (num === 0x1f) {
            // the actual tag follows
            num = 0;
            let sub;
            do {
                sub = buf[i++];
                num = (num << 7) + (sub & 0x7f);
                tag = (tag << 8) + sub;
            } while ((sub & 0x80) !== 0);
        }

        // Length field
        let len = buf[i++];
        if ((len & 0x80) !== 0) {
            // length is encoded in the following (len & 0x7f) bytes
            let len_len = len & 0x7f;
            if (len_len > 2) {
                throw new Error("long form length is too long");
            }
            len = 0;
            for (let j = 0; j < len_len; j++) {
                len = (len << 8) + buf[i++];
            }
        }

        let val = buf.slice(i, i+len);
        if (val.length !== len) {
            throw new Error(`Required ${len} bytes, but got ${val.length}`);
        }

        let obj = {
            tag: tag,
            num: num,
            cla: cla,
            val: val
        };

        if (b6) {
            // recursively decode the constructed data object
            obj.val = decode_BER_TLV(obj.val);
        }
        result.push(obj);
        i += len;
    }
    return result;
}

function decode_SIMPLE_TLV(buf) {
    let result = [];
    let i = 0;
    while (i < buf.length) {
        // In simple TLV, leading byte codes no class and no construction-type
        let tag = buf[i++];

        // 00 or FF are padding due to erased or modified TLV-coded data objects
        if (tag === 0xff || tag === 0) {
            continue;
        }

        // Length field
        let len = buf[i++];
        if (len === 0xff) {
            // length is encoded in the following 2 bytes
            len = buf[i++] << 8;
            len += buf[i++];
        }

        let val = buf.slice(i, i+len);
        if (val.length !== len) {
            throw sprintf("Required %d bytes, but got %d", len, val.length);
        }

        let obj = {
            tag: tag,
            val: val
        };

        result.push(obj);
        i += len;
    }
    return result;
}

function encode_BER_TLV(list) {
    if (!(list instanceof Array)) {
        throw "Argument must be an Array"
    }

    let totalLength = 0;
    let all = [];
    for (let i = 0; i < list.length; i++) {
        let e = list[i];

        let val = null;
        let is_constructed = false;
        if (e.val instanceof Buffer) {
            val = e.val;
        } else if (typeof e.val !== "undefined") {
            if (typeof e.cla !== "undefined") {
                val = encode_BER_TLV(e.val);
                is_constructed = true;
            } else {
                val = encode_SIMPLE_TLV(e.val);
            }
        } else {
            throw "Unknown value type";
        }

        let lead = e.cla << 6;
        lead |= is_constructed ? 0x20 : 0;
        if (e.num <= 30) {
            lead |= e.num & 0x1f;
        }
        let pieces = [ lead ];

        if (e.num > 30) {
            let tag = e.num;
            pieces.push(0);
            while (tag > 0x7f) {
                pieces.push((tag & 0x7f) | 0x80);
                tag >>= 7;
            }
            pieces.push(tag & 0x7f);
        }

        let len = val.length;
        if (len <= 127) {
            pieces.push(len);
        } else if (len <= 255) {
            pieces.push(0x81);
            pieces.push(len);
        } else if (len <= 65535) {
            pieces.push(0x82);
            pieces.push((len >> 8) & 0xff);
            pieces.push(len & 0xff);
        } else {
            throw "Value is too long";
        }
        totalLength += pieces.length + len;

        pieces.push(val);
        all.push(pieces);
    }

    let result = Buffer.alloc(totalLength);
    let off = 0;
    for (let i = 0; i < list.length; i++) {
        let val = all[i].pop();
        for (let j = 0; j < all[i].length; j++) {
            let b = all[i][j];
            result.writeUInt8(b, off++);
        }
        val.copy(result, off);
        off += val.length;
    }

    return result;
}

function encode_SIMPLE_TLV(list) {
    if (!(list instanceof Array)) {
        throw "Argument must be an Array"
    }

    let totalLength = 0;
    let all = [];
    for (let i = 0; i < list.length; i++) {
        let e = list[i];
        if (e.tag < 1 || e.tag > 254) {
            throw "Tag out of range";
        }

        let pieces = [ e.tag ];

        let val = e.val;
        if (!(e.val instanceof Buffer)) {
            throw "Value must be a Buffer";
        }

        let len = val.length;
        if (len >= 1 << 16) {
            throw "Value is too long";
        }

        if (len <= 254) {
            pieces.push(len);
        } else {
            pieces.push(255);
            pieces.push((len >> 8) & 0xff);
            pieces.push(len & 0xff);
        }

        totalLength += pieces.length + len;

        pieces.push(val);
        all.push(pieces);
    }

    let result = Buffer.alloc(totalLength);
    let off = 0;
    for (let i = 0; i < list.length; i++) {
        let val = all[i].pop();
        for (let j = 0; j < all[i].length; j++) {
            let b = all[i][j];
            result.writeUInt8(b, off++);
        }
        val.copy(result, off);
        off += val.length;
    }

    return result;
}

module.exports = {
    encode: encode_BER_TLV,
    decode: decode_BER_TLV,
    BER: {
        encode: encode_BER_TLV,
        decode: decode_BER_TLV,
    },
    SIMPLE: {
        encode: encode_SIMPLE_TLV,
        decode: decode_SIMPLE_TLV,
    }
};