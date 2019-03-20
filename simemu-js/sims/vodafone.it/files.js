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

function repeatRecord(hex, times, callback) {
    let result = [null];
    for (let i = 0; i < times; i++)
        result.push(h2b(hex));
    if (callback)
        callback(result);
    return result;
}

let USIM = {
    name: "USIM",
    aid: "a0000000871002ffffffff8903020000",
    fcp: h2fcp("623c8202782183027ff08410a0000000871002ff33ffff8906030100a507800171830223568a01058b032f0602c60f9001f083010183010a83010b830181"),

    0x6f05: {
        name: "LI",
        fcp: h2fcp("621f8202412183026f05a506c00100de01008a01058b036f06138002000c880110"),
        binary: h2b("ffffffffffffffffffffffff")
    },
    0x6f06: {
        name: "ARR",
        fcp: h2fcp("622282054221003c1783026f06a506c00100de01208a01058b036f0601800205648801b8"),
        records: [ null,
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("800103a406830101950108800150a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("8001019000800102a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("800101a406830101950108800102a010a406830181950108a40683010a950108800150a40683010a9501088401d4a40683010a950108ffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("800101a406830101950108800152a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("800103a406830101950108800150a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        ]
    },
    0x6f07: {
        name: 'IMSI',
        fcp: h2fcp("62258202412183026f07a50cc0010091047f206f07de01008a01058b036f060380020009880138"),
        binary: h2b("082922012910715642"),
    },
    0x6f08: {
        name: "Keys",
        fcp: h2fcp("621f8202412183026f08a506c00180de01008a01058b036f060880020021880140"),
        binary: h2b("07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    },
    0x6f09: {
        name: "KEYSPS",
        fcp: h2fcp("621f8202412183026f09a506c00180de01008a01058b036f060880020021880148"),
        binary: h2b("07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    },
    0x6f31: {
        name: "HPPLMN",
        fcp: h2fcp("62258202412183026f31a50cc0010091047f206f31de01008a01058b036f061580020001880190"),
        binary: h2b("05"),
    },
    0x6f38: {
        name: "UST",
        fcp: h2fcp("621f8202412183026f38a506c00100de01008a01058b036f060c80020009880120"),
        binary: h2b("0eee1f8c630e580000"),
    },
    0x6f3b: {
        name: "UST",
        fcp: h2fcp("62278205422100202883026f3ba50cc0010091047f106f3bde01008a01058b036f0609800205008800"),
        records: repeatRecord("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 0x28)
    },
    0x6f3c: {
        name: "SMS",
        fcp: h2fcp("62278205422100b01483026f3ca50cc0010091047f106f3cde01008a01058b036f060d80020dc08800"),
        records: repeatRecord("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 0x20)
    },
    0x6f3e: {
        fcp: h2fcp("62248202412183026f3ea50cc0010091047f206f3ede01008a01058b036f060b800200018800"),
        binary: h2b("ff")
    },
    0x6f3f: {
        fcp: h2fcp("62248202412183026f3fa50cc0010091047f206f3fde01008a01058b036f060b800200018800"),
        binary: h2b("ff")
    },
    0x6f40: {
        name: "MSISDN",
        fcp: h2fcp("62218205422100180383026f40a506c00100de01008a01058b036f060d800200488800"),
        records: [ null,
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6f42: {
        name: "SMSP",
        fcp: h2fcp("622782054221002e0383026f42a50cc0010091047f106f42de01008a01058b036f060d8002008a8800"),
        records: [null,
            h2b("fffffffffffffffffffffffffffffffffffffdffffffffffffffffffffffff0791934329002000ffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6f43: {
        name: "SMSS",
        fcp: h2fcp("62248202412183026f43a50cc0010091047f106f43de01008a01058b036f060d800200028800"),
        binary: h2b("ffff"),
    },
    0x6f45: {
        fcp: h2fcp("62248202412183026f45a50cc0010091047f206f45de01008a01058b036f06048002001e8800"),
        binary: h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    },
    0x6f47: {
        fcp: h2fcp("622782054221001e1483026f47a50cc0010091047f106f47de01008a01058b036f060d800202588800"),
        records: repeatRecord("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 20),
    },
    0x6f49: {
        fcp: h2fcp("62278205422100200a83026f49a50cc0010091047f106f49de01008a01058b036f060b800201408800"),
        records: repeatRecord("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 0xA)
    },
    0x6f4b: {
        fcp: h2fcp("622782054221000d0383026f4ba50cc0010091047f106f4bde01008a01058b036f0609800200278800"),
    },
    0x6f4e: {
        fcp: h2fcp("622182054221000d0183026f4ea506c00100de01008a01058b036f06048002000d8800"),
    },
    0x6f50: {
        fcp: h2fcp("62248202412183026f50a50cc0010091047f206f50de01008a01058b036f0604800200148800"),
        binary: h2b("1112112bffffffffffffffffffffffffffffffff")
    },
    0x6f56: {
        name: "EST",
        fcp: h2fcp("621f8202412183026f56a506c00100de01008a01058b036f060980020003880128"),
        binary: h2b("000000"),
    },
    0x6F5b: {
        name: "START-HFN",
        fcp: h2fcp("621f8202412183026f5ba506c00180de01008a01058b036f060880020006880178"),
        binary: h2b("000000000000"),
    },
    0x6F5c: {
        name: "THRESHOLD",
        fcp: h2fcp("621f8202412183026f5ca506c00100de01008a01058b036f060e80020003880180"),
        binary: h2b("ffffff"),
    },
    0x6f60: {
        name: "PLMNwAcT",
        fcp: h2fcp("62258202412183026f60a50cc0010091047f206f60de01008a01058b036f060a80020177880150"),
        binary: h2b("02f801808012f410808062f220808032f451808022f810808002f250808032f210808022f6108080130014808002f610808002f440808012f901808062f010808006f220808062f810808082f620808064f000808092f304808032f030808012f607808072f210808042f080808072f620808052f010808072f810808015f010808032f810808005f530808024f430808082f410808042f450808052f510808072f010808054f460808004f402808004f472808004f411808004f434808025f5308080330850808042f820808005f291808036f920808014f320808072f420808056f510808042f620808082f010808024f620808014f9208080ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000")
    },
    0x6f61: {
        name: "OPLMNwAcT",
        fcp: h2fcp("62258202412183026f61a50cc0010091047f206f61de01008a01058b036f060c80020177880188"),
        binary: h2b("02f801808012f410808062f220808032f451808022f810808002f250808032f210808022f6108080130014808002f610808002f440808012f901808062f010808006f220808062f810808082f620808064f000808092f304808032f030808012f607808072f210808042f080808072f620808052f010808072f810808015f010808032f810808005f530808024f430808082f410808042f450808052f510808072f010808054f460808004f402808004f472808004f411808004f434808025f5308080330850808042f820808005f291808036f920808014f320808072f420808056f510808042f620808082f010808024f620808014f9208080ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000ffffff0000"),
    },
    0x6f62: {
        name: "HPLMNwAcT",
        fcp: h2fcp("62258202412183026f62a50cc0010091047f206f62de01008a01058b036f060b8002000a880198"),
        binary: h2b("22f2018080ffffff8080"),
    },
    0x6f73: {
        name: "PSLOCI",
        fcp: h2fcp("62258202412183026f73a50cc0018091047f206f53de01008a01058b036f06088002000e880160"),
        binary: h2b("ffffffffffffff22f201fffeff01"),
    },
    0x6f78: {
        name: "ACC",
        fcp: h2fcp("62258202412183026f78a50cc0010091047f206f78de01008a01058b036f060380020002880130"),
        binary: h2b("0010"),
    },
    0x6f7b: {
        name: "FPLMN",
        fcp: h2fcp("62258202412183026f7ba50cc0010091047f206f7bde01008a01058b036f060a8002000c880168"),
        binary: h2b("ffffffffffffffffffffffff"),
    },
    0x6f7e: {
        name: "LOCI",
        fcp: h2fcp("62258202412183026f7ea50cc0018091047f206f7ede01008a01058b036f06088002000b880158"),
        binary: h2b("ffffffff22f201fffe0003"),
    },
    0x6fad: {
        name: "AD",
        fcp: h2fcp("62258202412183026fada50cc0010091047f206fadde01008a01058b036f060780020004880118"),
        binary: h2b("00000102"),
    },
    0x6fb7: {
        name: "ECC",
        fcp: h2fcp("62228205422100100583026fb7a506c00100de01008a01058b036f060780020050880108"),
        records: [ null,
            h2b("ffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6fc4: {
        name: "NETPAR",
        fcp: h2fcp("621e8202412183026fc4a506c00180de01008a01058b036f060a800200928800"),
        binary: h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    },
    0x6fc5: {
        name: "PNN",
        fcp: h2fcp("621a8205422100180a83026fc58a01058b036f0601800200f08801c8"),
        records: [null,
            h2b("43058441aa890affffffffffffffffffffffffffffffffff"),
            h2b("430e8641aa890a6aa6c7f2f7b0cc6603ffffffffffffffff"),
            h2b("430b834fb319e42cd3ef6ff91affffffffffffffffffffff"),
            h2b("430f87e3329b5d6787e5a0301d342d0601ffffffffffffff"),
            h2b("430880cdb03c4d4fb7cbffffffffffffffffffffffffffff"),
            h2b("43088741aa890a224a01ffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6fc6: {
        name: "OPL",
        fcp: h2fcp("621a8205422100081483026fc68a01058b036f0601800200a08801d0"),
        records: [null,
            h2b("130014fa00fb8f02"), h2b("130014fb90fc9401"),
            h2b("130014fc95fde702"), h2b("13d1dd0000fffe01"),
            h2b("13d2dd0000fffe01"), h2b("13d3dd0000fffe01"),
            h2b("13d4dd0000fffe01"), h2b("13d5dd0000fffe01"),
            h2b("09f1810000fffe04"), h2b("13d0dd0000fffe01"),
            h2b("ffffffffffffffff"), h2b("ffffffffffffffff"),
            h2b("ffffffffffffffff"), h2b("ffffffffffffffff"),
            h2b("ffffffffffffffff"), h2b("ffffffffffffffff"),
            h2b("ffffffffffffffff"), h2b("ffffffffffffffff"),
            h2b("ffffffffffffffff"), h2b("ffffffffffffffff"),
        ]
    },
    0x6fd2: {
        name: "MMSUCP",
        fcp: h2fcp("621f8202412183026fd2a50691047f666fd28a01058b036f060980020010880108"),
        binary: h2b("00000000000000000000000000000000")
    },
    0x6fd9: {
        name: "EHPLMN",
        fcp: h2fcp("62178202412183026fd98a01058b036f06058002000f8801e8"),
        binary: h2b("130014ffffffffffffffffffffffff"),
    },
    0x6fdc: {
        name: "LRPLMNSI",
        fcp: h2fcp("62168202412183026fdc8a01058b036f0605800200018800"),
        binary: h2b("01"),
    },
    0x6fe3: {
        name: "EPSLOCI",
        fcp: h2fcp("62178202412183026fe38a01058b036f0606800200128801f0"),
        binary: h2b("0bf662f220ea6240f602e86462f220bbbd00"),
    },
    0x6fe4: {
        name: "EPSNSC",
        fcp: h2fcp("621a8205422100360183026fe48a01058b036f0606800200368801c0"),
        records: [ null,
            h2b("a03480010781209770ad30653eedf0bb54c5d14e3ca7989d69610d350ceaa31cb1d19416e05f94820400000008830400000005840122"),
        ]
    },
    0x5f3b: {
        0x4f20: {
            name: "Kc",
            fcp: h2fcp("62258202412183024f20a50cc0018091047f206f20de01008a01058b036f060880020009880108"),
            binary: h2b("ffffffffffffffff07"),
        },
        0x4f52: {
            name: "KcGPRS",
            fcp: h2fcp("62258202412183024f52a50cc0018091047f206f52de01008a01058b036f060880020009880110"),
            binary: h2b("ffffffffffffffff07"),
        },
    },
    0x5f30: {
        0x4f34: {
            fcp: h2fcp("62218202412183024f34a50891067f665f304f348a01058b036f060180020003880108"),
            binary: h2b("130014")
        },
    },
    0x5f40: {
        0x4f44: {
            fcp: h2fcp("62168202412183024f448a01058b036f0609800200018800"),
            binary: h2b("00")
        }
    },
};

let ISIM = {
    name: "ISIM",
    aid: "a0000000871004ffffffff8903020000",
    fcp: h2fcp("6229820278218410a0000000871004ffffffff89030200008a01058b032f0608c60990014083010183010a"),
};

let fileSystem = {
    0x3f00: {
        name: "MF",
        fcp: h2fcp("622a8202782183023f00a507800171830223568a01058b032f0602c60f9001f083010183010a83010b830181"),
        0x2fe2: {
            name: "ICCID",
            fcp: h2fcp("621f8202412183022fe2a506c00100de01008a01058b032f060c8002000a880110"),
            binary: h2b("989301140300203646f1")
        },
        0x2f00: {
            name: "DIR",
            fcp: h2fcp("62228205422100260583022f00a506c00100de01008a01058b032f0604800200be8801f0"),
            records: [ null,
                h2b("61204f10a0000000871002ff33ffff8906030100500c47454e45524943205553494dffffffff"),
                h2b("61194f0ca000000063504b43532d313550094d49445066696c6573ffffffffffffffffffffff"),
                h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            ]
        },
        0x2f05: {
            name: "PL",
            fcp: h2fcp("621f8202412183022f05a506c00100de01008a01058b032f06058002000c880128"),
            binary: h2b("6974656e646566727376ffff")
        },
        0x2f06: {
            fcp: h2fcp("62228205422100320e83022f06a506c00100de01208a01058b032f0601800202bc880130"),
            records: [ null,
                h2b("8001019000800102a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffff"),
                h2b("8001019000800102a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffff"),
                h2b("8001019000800102a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffff"),
                h2b("8001019000800102a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffff"),
            ]
        },
        0x7f10: {
            name: "TELECOM",
            0x5f3a: {
                name: "PHONEBOOK",
                0x4f30: {
                    name: "PBR",
                    fcp: h2fcp("62218205422100640283024f30a506c00100de01008a01058b036f0607800200c88800"),
                    records: [ null,
                        h2b("a819c0034f3a02c5034f1104c6034f1205c1034f1001c9034f170aa90ac4034f1508c3034f1609aa14c2034f4a03c7034f1306c8034f1407cb034f3d0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("a819c0034f3b11c5034f2510c6034f2814c1034f1812c9034f3115a90ac4034f1508c3034f1609aa14c2034f4a03c7034f1306c8034f1407cb034f3d0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                    ]
                },
                0x4f3a: {
                    fcp: h2fcp("6228820542210020fa83024f3aa50cc0010091047f106f3ade01008a01058b036f060380021f40880110"),
                    records: repeatRecord("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 0xfa, a => {
                        a[0x52] = h2b("536572762e436c692e45737465726fffffff0791934329001009ffffffffffff");
                        a[0x53] = h2b("416767696f726e612053494dffffffffffff04812402f2ffffffffffffffffff");
                        a[0x54] = h2b("50726f6d6f202620696e666f73696dffffff04812470f0ffffffffffffffffff");
                        a[0x55] = h2b("566f6461666f6e6520383932303030ffffff0481980200ffffffffffffffffff");
                        a[0x56] = h2b("4672656554696d65ffffffffffffffffffff04812477f4ffffffffffffffffff");
                        a[0x57] = h2b("4c6f6768692653756f6e65726965ffffffff04812455f2ffffffffffffffffff");
                        a[0x58] = h2b("4d756c74697061727479ffffffffffffffff038144f4ffffffffffffffffffff");
                        a[0x59] = h2b("5269636172696361ffffffffffffffffffff04812410f0ffffffffffffffffff");
                        a[0x5a] = h2b("536567722054656c65666f6e696361ffffff04812420f0ffffffffffffffffff");
                        a[0x5b] = h2b("5365677265742e2045737465726fffffffff0791934329000202ffffffffffff");
                        a[0x5c] = h2b("53657276697a692076696120534d53ffffff04812442f6ffffffffffffffffff");
                        a[0x5d] = h2b("53657276697a696f436c69656e7469ffffff038191f0ffffffffffffffffffff");
                        a[0x5e] = h2b("547261662e5265736964756f343034ffffff038104f4ffffffffffffffffffff");
                        a[0x5f] = h2b("547261662e5265736964756f343134ffffff038114f4ffffffffffffffffffff");
                        a[0x60] = h2b("566f6461666f6e65204f6e65ffffffffffff04812426f6ffffffffffffffffff");
                    })
                },
                0x4f4a: {
                    fcp: h2fcp("622882054221000d1483024f4aa50cc0010091047f106f4ade01008a01058b036f060380020104880118"),
                },
                0x4f09: {
                    fcp: h2fcp("621a8205422100020283024f098a01058b036f060480020004880148"),
                    records: [ null,
                        h2b("0000"),
                        h2b("0000"),
                    ]
                },
                0x4f10: {
                    fcp: h2fcp("6222820542210003fa83024f10a506c00100de01008a01058b036f0603800202ee880108"),
                    records: repeatRecord("ffffff", 0xfa)
                },
                0x4f11: {
                    fcp: h2fcp("6222820542210002fa83024f11a506c00100de01008a01058b036f0603800201f4880120"),
                    records: repeatRecord("0000", 0xfa)
                },
                0x4f12: {
                    fcp: h2fcp("6222820542210005fa83024f12a506c00100de01008a01058b036f0603800204e2880128"),
                    records: repeatRecord("0000000000", 0xfa)
                },
                0x4f15: {
                    fcp: h2fcp("6222820542210011fa83024f15a506c00100de01008a01058b036f06038002109a880140"),
                    records: repeatRecord("ffffffffffffffffffffffffffffffffff", 0xfa)
                },
                0x4f16: {
                    fcp: h2fcp("62228205422100143283024f16a506c00100de01008a01058b036f0603800203e8880148"),
                    records: repeatRecord("ffffffffffffffffffffffffffffffffffffffff", 0x32)
                },
                0x4f17: {
                    fcp: h2fcp("6222820542210002fa83024f17a506c00100de01008a01058b036f0603800201f4880150"),
                    records: repeatRecord("0000", 0xfa)
                },
                0x4f18: {
                    fcp: h2fcp("6222820542210003fa83024f18a506c00100de01008a01058b036f0603800202ee880190"),
                    records: repeatRecord("ffffff", 0xfa)
                },
                0x4f21: {
                    fcp: h2fcp("621a8205422100020283024f218a01058b036f060480020004880158"),
                    records: [ null,
                        h2b("0000"),
                        h2b("0000"),
                    ]
                },
                0x4f22: {
                    fcp: h2fcp("621f8202412183024f22a506c00100de01008a01058b036f060880020004880158"),
                    binary: h2b("00000000"),
                },
                0x4f23: {
                    fcp: h2fcp("621f8202412183024f23a506c00180de01008a01058b036f060880020002880160"),
                    binary: h2b("0001"),
                },
                0x4f24: {
                    fcp: h2fcp("621f8202412183024f24a506c00180de01008a01058b036f060880020002880168"),
                    binary: h2b("0000"),
                },
                0x4f25: {
                    fcp: h2fcp("6222820542210002fa83024f25a506c00100de01008a01058b036f0604800201f4880180"),
                    records: repeatRecord("0000", 0xfa)
                },
                0x4f28: {
                    fcp: h2fcp("6222820542210005fa83024f28a506c00100de01008a01058b036f0604800204e28801a0"),
                    records: repeatRecord("0000000000", 0xfa)
                },
                0x4f31: {
                    fcp: h2fcp("6222820542210002fa83024f31a506c00100de01008a01058b036f0604800201f48801a8"),
                    records: repeatRecord("0000", 0xfa)
                },
                0x4f3b: {
                    fcp: h2fcp("6222820542210020fa83024f3ba506c00100de01008a01058b036f060380021f40880188"),
                    records: repeatRecord("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 0xfa)
                },
                0x4f4b: {
                    fcp: h2fcp("62198205422100280a83024f4b8a01058b036f0604800201908800"),
                    records: [ null,
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    ]
                }
            },
            0x6f06: {
                name: "ARR",
                fcp: h2fcp("622182054221003c0a83026f06a506c00100de01008a01058b036f0601800202588800"),
                records: [ null,
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("800103a406830101950108800150a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("800101a406830101950108800152a40683010a9501088401d4a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("800103a406830101950108800150a40683010a950108ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                ]
            },
        },
        0x7f20: {
        },
        0x7f66: USIM,
        0x7fff: USIM
    }
};


fileSystem.getADFbyID = function (aid) {
    return {
        'a0000000871002ff33ffff8906030100': USIM,
        'a0000000871004ffffffff8903020000': ISIM
    }[aid];
};

module.exports = fileSystem;