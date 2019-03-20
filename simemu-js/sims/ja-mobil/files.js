const tlv = require("../../tlv");
const fcp_parser = require("../../fcp");


function h2b(hex) {
    return Buffer.from(hex, 'hex');
}

function h2tlv(hex) {
    return tlv.decode(Buffer.from(hex, 'hex'));
}

function h2fcp(hex) {
    let fcp = fcp_parser.parse(h2b(hex));
    return h2tlv(hex);
}

let USIM = {
    name: "USIM",
    aid: "a0000000871002ff4994208903100000",
    fcp: h2fcp("6231820278218410a0000000871002ffffffff8903020000a503de01048a01058b032f0608c60c90016083010183010a830181840f000000000000000000000000000000"),

    0x6f07: {
        name: 'IMSI',
        fcp: h2fcp("621c8202412183026f07a5038001718a01058b036f060880020009880138"),
        binary: h2b("082926100170459707"),
    },
    0x6f31: {
        name: "HPPLMN",
        fcp: h2fcp("821c00000000000000000000000000000000000000000000000000000000"),
        binary: h2b("05"),
    },
    0x6f38: {
        name: "UST",
        fcp: h2fcp("621c8202412183026f38a5038001718a01058b036f06028002000c880120"),
        binary: h2b("022a170c2336000000020000"),
    },
    0x6f3b: {
        fcp: h2fcp("621e82054221001e0a83026f3ba5038001718a01058b036f06138002012c8800"),
        records: [null,
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            ]
    },
    0x6f3c: {
        name: "SMS",
        fcp: h2fcp("621e8205422100b01483026f3ca5038001718a01058b036f060f80020dc08800"),
        records: [null,
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6f40: {
        name: "MSISDN",
        fcp: h2fcp("621e82054221001e0483026f40a5038001718a01058b036f060f800200788800"),
        records: [ null,
            h2b("ffffffffffffffffffffffffffffffffffff07818156343815f4ffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6f42: {
        name: "SMSP",
        fcp: h2fcp("621e8205422100280283026f42a5038001718a01058b036f060f800200508800"),
        records: [null,
            h2b("ffffffffffffffffffffffffe1ffffffffffffffffffffffff0791947101670000581f0d000000a8"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6f46: {
        name: "SPN",
        fcp: h2fcp("821B000000000000000000000000000000000000000000000000000000"),
        binary: h2b("006a6121206d6f62696cffffffffffffff")
    },
    0x6f56: {
        name: "EST",
        fcp: h2fcp("621c8202412183026f56a5038001718a01058b036f061380020001880128"),
        binary: h2b("00"),
    },
    0x6f60: {
        name: "PLMNwAcT",
        fcp: h2fcp("621c8202412183026f60a5038001718a01058b036f061580020028880150"),
        binary: h2b(
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000")
    },
    0x6f61: {
        name: "OPLMNwAcT",
        fcp: h2fcp("621c8202412183026f61a5038001718a01058b036f0616800200ff880188"),
        binary: h2b(
            "32f230008012f470008022f210008002f810008002f461008022f810008082f610008032f4030080" +
            "130062008062f020008032f802008032f010008012f603008012f910008042f010008002f2100080" +
            "72f010008022f630008052f010008024f420008042f419008032f120008082f450008092f4100080" +
            "92f720008072f610008072f230008092f314008044f0010080330420008052f510008054f0800080" +
            "24f520008005f510008072f812008006f410008024f030008042f710008082f010008042f6100080" +
            "05f221008012f830008042f810008015f010008064f679008072f410008027f270008015f5200080" +
            "73f010008024f7100080ffffffffff"),
    },
    0x6f73: {
        name: "PSLOCI",
        fcp: h2fcp("821c00000000000000000000000000000000000000000000000000000000"),
        binary: h2b("f6b00833fe231362f21044ca0100"),
    },
    0x6f78: {
        name: "ACC",
        fcp: h2fcp("821c00000000000000000000000000000000000000000000000000000000"),
        binary: h2b("0001"),
    },
    0x6f7b: {
        name: "FPLMN",
        fcp: h2fcp("821c00000000000000000000000000000000000000000000000000000000"),
        binary: h2b("ffffffffffff62f23062f220"),
    },
    0x6f7e: {
        name: "LOCI",
        fcp: h2fcp("621c8202412183026f7ea5038001718a01058b036f06118002000b880158"),
        binary: h2b("3542accd62f21044ca0000"),
    },
    0x6fad: {
        name: "AD",
        fcp: h2fcp("621c8202412183026fada5038001718a01058b036f061280020004880118"),
        binary: h2b("00ffff02"),
    },
    0x6fb7: {
        name: "ECC",
        fcp: h2fcp("621f8205422100100383026fb7a5038001718a01058b036f060780020030880108"),
        records: [ null,
            h2b("ffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffff"),
        ]
    },
    0x5f3b: {
        0x4f20: {
            name: "Kc",
            fcp: h2fcp("821c00000000000000000000000000000000000000000000000000000000"),
            binary: h2b("5b052e1993f0e73c"),
        },
        0x4f52: {
            name: "KcGPRS",
            fcp: h2fcp("821c00000000000000000000000000000000000000000000000000000000"),
            binary: h2b("2dbe12acd24870fd01"),
        },
    },
};

let fileSystem = {
    0x3f00: {
        name: "MF",
        fcp: h2fcp("62288202782183023f00a50b8001718303015d72de01048a01058b032f0601c60990014083010183010a"),
        0x2f00: {
            name: "DIR",
            fcp: h2fcp("621f8205422100160283022f00a5038001718a01058b032f06078002002c8801f0"),
            records: [ null,
                h2b("61124f10a0000000871002ff49942089031000005000"),
            ]
        },
        0x7f10: {
            name: "TELECOM",
            0x5f3a: {
                0x4f02: {
                    fcp: h2fcp("621f82054221001efa83024f02a5038001718a01058b036f060980021d4c880110"),
                },
                0x4f30: {
                    fcp: h2fcp("621e8205422100120183024f30a5038001718a01058b036f0607800200128800"),
                    records: [ null,
                        h2b("a80ac0034f0202c5034f0404ffffffffffff")
                    ]
                },
            },
            0x6f44: {
                fcp: h2fcp("621e82054621001e0a83026f44a5038001718a01058b036f06038002012c8800"),
            },
        },
        0x7fff: USIM
    }
};


fileSystem.getADFbyID = function (aid) {
    let table = {};
    table[USIM.aid] = USIM;
    return table[aid];
};

module.exports = fileSystem;