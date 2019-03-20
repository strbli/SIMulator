const fcp_parser = require("../fcp");
const tlv = require("../tlv");
const util = require("util");
const assert = require('assert').strict;


function h2b(hex) {
    return Buffer.from(hex, 'hex');
}

function h2tlv(hex) {
    return tlv.decode(Buffer.from(hex, 'hex'));
}



describe("FCP", function() {
    it("Decode FCP 0x6fc6", function () {
        let fcp = fcp_parser.parse(h2b("621a8205422100081483026fc68a01058b036f0601800200a08801d0"));
        console.log(fcp);
    });

    it("Decode FCP USIM", function () {
        let fcp = fcp_parser.parse(h2b("623c8202782183027ff08410a0000000871002ff33ffff8906030100a507800171830223568a01058b032f0602c60f9001f083010183010a83010b830181"));
        console.log(fcp);
    });
});