const tlv = require("../tlv");
const util = require("util");
const assert = require('assert').strict;

describe("TLV", function() {
    it("Decode and re-encode a BER-TLV", function () {
        let testHex = "622c8202782183023f00a50980017183040000548a8a01058b032f0602c609900140830101830181810400015441";
        let test = Buffer.from(testHex, 'hex');
        let decoded = tlv.decode(test);
        console.log(util.inspect(decoded, {showHidden: false, depth: null}));
        let encoded = tlv.encode(decoded);
        assert.equal(testHex, encoded.toString('hex'));
    });

    it("Decode and re-encode a SIMPLE-TLV", function () {
        let testHex = "622c8202782183023f00a50980017183040000548a8a01058b032f0602c609900140830101830181810400015441";
        let test = Buffer.from(testHex, 'hex');
        let decoded = tlv.SIMPLE.decode(test);
        console.log(util.inspect(decoded, {showHidden: false, depth: null}));
        let encoded = tlv.SIMPLE.encode(decoded);
        assert.equal(testHex, encoded.toString('hex'));
    });
});