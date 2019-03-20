const tlv = require("../../tlv");
const fcp_parser = require("../../fcp");

const range = n => [...Array(n).keys()];

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

function repBuf(count, buf) {
    return range(count).map(() => {
        let newBuf = Buffer.allocUnsafe(buf.length);
        buf.copy(newBuf);
        return newBuf;
    });
}

function ffBuf(count) {
    let ff = h2b("ff");
    return Buffer.alloc(count, ff);
}

let USIM = {
    name: "USIM",
    aid: "a0000000871002ff49ff0589",
    fcp: h2fcp("623482027821840ca0000000871002ff49ff05898a01058b032f0618c61890017e83010183010a83010b83010c83010d83010e830181"),

    0x6f05: {
        name: 'LI',
        fcp: h2fcp("62178202412183026f058a01058b036f060580020008880110"),
        binary: h2b("6465656e6672ffff"),
    },
    0x6f06: {
        name: 'ARR',
        fcp: h2fcp("621a8205422100591583026f068a01058b036f06018002074d8801b8"),
        records: [null,
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("800101A010A406830101950108A40683010E950108800102A010A406830181950108A40683010E950108800118A010A40683010D950108A40683010E950108800140A010A40683010C950108A40683010E9501088001249700"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("800101A010A406830101950108A40683010E950108800102A010A40683010C950108A40683010E950108800118A010A40683010D950108A40683010E9501088001649700FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
            h2b("800101A010A406830101950108A40683010E950108800102A010A406830181950108A40683010E950108800118A010A40683010D950108A40683010E9501088001649700FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("800101A010A406830101950108A40683010E950108800102A010A406830181950108A40683010E950108840132A010A406830101950108A40683010E950108800118A010A40683010D950108A40683010E9501088001649700"),
            h2b("800103A010A406830101950108A40683010E950108800118A010A40683010D950108A40683010E950108800140A010A40683010C950108A40683010E9501088001249700FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("8001019000800102a010a40683010a950108a40683010e950108800118a010a40683010d950108a40683010e9501088001649700ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("800103A010A406830101950108A40683010E950108800118A010A40683010D950108A40683010E9501088001649700FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
            h2b("800101A010A406830101950108A40683010E950108800142A010A40683010C950108A40683010E950108800118A010A40683010D950108A40683010E9501088001249700FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
            h2b("800101A010A406830101950108A40683010E950108800102A010A406830181950108A40683010E950108800118A010A40683010D950108A40683010E950108800140A010A40683010C950108A40683010E9501088001249700"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("800103A010A406830101950108A40683010E9501088401329700800118A010A40683010D950108A40683010E950108800140A010A40683010C950108A40683010E9501088001249700FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
        ]
    },
    0x6f07: {
        name: 'IMSI',
        fcp: h2fcp("62178202412183026f078a01058b036f060380020009880138"),
        binary: h2b("082926701509898808"),
    },
    0x6f08: {
        name: 'Keys',
        fcp: h2fcp("62178202412183026f088a01058b036f060480020021880140"),
        binary: h2b("07ec784378c58975aba97710391434c96a2d8768ff3d1941b0b65717410be103a3"),
    },
    0x6f09: {
        name: 'KeysPS',
        fcp: h2fcp("62178202412183026f098a01058b036f060480020021880148"),
        binary: h2b("07D0950CC6F017B35CB4280DD17FE3D7F34DC1C839D2A689735CFA332D3805B70B"),
    },
    0x6f31: {
        name: "HPPLMN",
        fcp: h2fcp("62178202412183026f318a01058b036f060680020001880190"),
        binary: h2b("01"),
    },
    0x6f37: {
        name: "ACMmax",
        fcp: h2fcp("62168202412183026f378a01058b036f0607800200038800"),
        binary: h2b("000000"),
    },
    0x6f38: {
        name: "UST",
        fcp: h2fcp("62178202412183026f388a01058b036f06088002000c880120"),
        binary: h2b("9EDFB31DE7FE010000001000"),
    },
    0x6f39: {
        name: "ACM",
        fcp: h2fcp("62198205462100030a83026f398a01058b036f06098002001e8800"),
        records: [null,
            h2b("000000")
        ]
    },
    0x6f3b: {
        fcp: h2fcp("621982054221001e1e83026f3b8a01058b036f0607800203848800"),
        records: [null].concat(repBuf(30, h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")))
    },
    0x6f3c: {
        name: "SMS",
        fcp: h2fcp("62198205422100b00a83026f3c8a01058b036f060a800206e08800"),
        records: [null].concat(repBuf(20, h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")))
    },
    0x6f3e: {
        name: "GID1",
        fcp: h2fcp("62168202412183026f3e8a01058b036f0606800200148800"),
        binary: h2b("000604ffffffffffffffffffffffffffffffffff")
    },
    0x6f3f: {
        name: "GID2",
        fcp: h2fcp("62168202412183026F3F8A01058B036F060B800200148800"),
        binary: h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
    },
    0x6f40: {
        name: "MSISDN",
        fcp: h2fcp("621982054221001e0383026f408a01058b036f060a8002005a8800"),
        records: [ null,
            h2b("20ffffffffffffffffffffffffffffff0891945109072758f1ffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6f42: {
        name: "SMSP",
        fcp: h2fcp("621982054221002c0383026f428a01058b036f060a800200848800"),
        records: [null,
            h2b("ffffffffffffffffffffffffffffffffe1ffffffffffffffffffffffff0791947106004034581f0d000000ad"),
            h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
            h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
        ]
    },
    0x6f43: {
        name: "SMSS",
        fcp: h2fcp("62168202412183026F438A01058B036F060A800200028800"),
        binary: h2b("15FF")
    },
    0x6f45: {
        name: "CBMI",
        fcp: h2fcp("62168202412183026f458a01058b036f060a800200148800"),
        binary: h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
    },
    0x6f46: {
        fcp: h2fcp("62168202412183026f468a01058b036f060c800200118800"),
        binary: h2b("02FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
    },
    0x6f47: {
        name: "SMSR",
        fcp: h2fcp("621982054221001e0583026f478a01058b036f060d800200968800"),
        records: [null].concat(repBuf(10, h2b("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")))
    },
    0x6f48: {
        name: "CBMID",
        fcp: h2fcp("62178202412183026f488a01058b036f060e80020014880170"),
        binary: h2b("ffffffffffffffffffffffffffffffffffffffff")
    },
    0x6f49: {
        name: "SDN",
        fcp: h2fcp("621982054221001e0a83026f498a01058b036f060e8002012c8800"),
        records: [null].concat(repBuf(10, h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")))
    },
    0x6f4b: {
        name: "EXT2",
        fcp: h2fcp("621982054221000d0383026f4b8a01058b036f060f800200278800"),
        records: [null].concat(repBuf(10, h2b("00ffffffffffffffffffffffff")))
    },
    0x6f4c: {
        fcp: h2fcp("621982054221000d0383026f4c8a01058b036f0610800200278800"),
        records: [null].concat(repBuf(10, h2b("00ffffffffffffffffffffffff")))
    },
    0x6f4e: {
        name: "EXT5",
        fcp: h2fcp("621982054221000d0383026f4e8a01058b036f060a800200278800"),
        records: [null].concat(repBuf(10, h2b("00ffffffffffffffffffffffff")))
    },
    0x6f50: {
        name: "CBMIR",
        fcp: h2fcp("62168202412183026f508a01058b036f060a800200288800"),
        binary: h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
    },
    0x6f56: {
        name: "EST",
        fcp: h2fcp("62178202412183026f568a01058b036f060f80020001880128"),
        binary: h2b("00"),
    },
    0x6f57: {
        fcp: h2fcp("62168202412183026f578a01058b036f060f800200c88800"),
        binary: h2b("00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
    },
    0x6f5b: {
        name: "START-HFN",
        fcp: h2fcp("62178202412183026F5B8A01058B036F060D80020006880178"),
        binary: h2b("F00002F00004"),
    },
    0x6f5c: {
        name: "THRESHOLD",
        fcp: h2fcp("62178202412183026f5c8a01058b036f060380020003880180"),
        binary: h2b("00ffff"),
    },
    /*0x6f60: {
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
    },*/
    0x6f61: {
        name: "OPLMNwAcT",
        fcp: h2fcp("62178202412183026f618a01058b036f060e800200f0880188"),
        binary: h2b(
            "62f230808022f288808022f299808022f210808032f201808032f250808032f230808002f6028080" +
            "02f650808002f610808002f601808012f920808012f910808032f020808032f010808002f8108080" +
            "02f802808002f210808002f201808002f290808072f220808072f250808092f550808072f0998080" +
            "72f077808072f010808002f480808062f060808062f020808062f030808062f010808092f3148080" +
            "92f304808012f470808012f450808022f820808022f810808022f830808082f610808082f6408080" +
            "82f630808032f401808032f401808032f401808032f401808032f401808032f401808032f4018080"),
    },
    0x6f62: {
        name: "HPLMNwAcT",
        fcp: h2fcp("62178202412183026f628a01058b036f060e8002000a880198"),
        binary: h2b("62F270400062F2708080"),
    },
    0x6f73: {
        name: "PSLOCI",
        fcp: h2fcp("62178202412183026f738a01058b036f060d8002000e880160"),
        binary: h2b("E2B0A0B5FFFFFF62F230D6290100"),
    },
    0x6f78: {
        name: "ACC",
        fcp: h2fcp("62178202412183026f788a01058b036f060680020002880130"),
        binary: h2b("0001"),
    },
    0x6f7b: {
        name: "FPLMN",
        fcp: h2fcp("62178202412183026f7b8a01058b036f060d80020060880168"),
        binary: h2b("62f22062f21032f03022f21022f28822f20522f201ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    },
    0x6f7e: {
        name: "LOCI",
        fcp: h2fcp("62178202412183026f7e8a01058b036f060d8002000b880158"),
        binary: h2b("4A70F29662F230D629FF00"),
    },
    0x6f80: {
        name: "ICI",
        fcp: h2fcp("621a82054621002c0583026f808a01058b036f0611800200dc8801a0"),
        records: [ null,
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000001ffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000001ffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000001ffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000001ffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000001ffff"),
        ]
    },
    0x6f81: {
        name: "OCI",
        fcp: h2fcp("621a82054621002b0583026f818a01058b036f0611800200d78801a8"),
        records: [ null,
            h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF03819AB9FFFFFFFFFFFFFFFFFFFF081060000000FF000000FFFFFF"),
            h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF07811017132987F7FFFFFFFFFFFF081060000000FF000000FFFFFF"),
            h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0791937353141781FFFFFFFFFFFF081060000000FF000000FFFFFF"),
            h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000001FFFF"),
            h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000001FFFF"),
        ]
    },
    0x6fad: {
        name: "AD",
        fcp: h2fcp("62178202412183026fad8a01058b036f061380020004880118"),
        binary: h2b("01000102"),
    },
    0x6fb7: {
        name: "ECC",
        fcp: h2fcp("621a8205422100140583026fb78a01058b036f060c80020064880108"),
        records: [ null,
            h2b("11F2FF4E6F747275662046657565727765687200"),
            h2b("ffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffff"),
            h2b("ffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6fc4: {
        name: "NETPAR",
        fcp: h2fcp("62168202412183026fc48a01058b036f060d800200328800"),
        binary: h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    },
    0x6fc5: {
        fcp: h2fcp("621a82054221000e0283026fc58a01058b036f06148002001c8801c8"),
        records: [ null,
            h2b("430981cbd6901d9ecfd363ffffff"),
            h2b("430981cbd6901d9ecfd363ffffff"),
        ]
    },
    0x6fc6: {
        fcp: h2fcp("621a8205422100080183026fc68a01058b036f0614800200088801d0"),
        records: [ null,
            h2b("62f2700000fffe02"),
            h2b("62f2700000fffe02"),
        ]
    },
    0x6fc7: {
        name: "MBDN",
        fcp: h2fcp("621982054221001e0283026fc78a01058b036f06068002003c8800"),
        records: [ null,
            h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0791947139003033FFFFFFFFFFFF"),
            h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6fc9: {
        fcp: h2fcp("62198205422100040183026FC98A01058B036F0606800200048800"),
        records: [ null,
            h2b("01000000"),
            h2b("01000000"),
        ]
    },
    0x6fca: {
        fcp: h2fcp("62198205422100050183026fca8a01058b036f060d800200058800"),
        records: [ null,
            h2b("0000000000"),
            h2b("0000000000"),
        ]
    },
    0x6fcb: {
        fcp: h2fcp("62198205422100100183026fcb8a01058b036f060d800200108800"),
        records: [ null,
            h2b("0100ffffffffffffffffffffffffffff"),
            h2b("0100ffffffffffffffffffffffffffff"),
        ]
    },
    0x6fcd: {
        fcp: h2fcp("62178202412183026fcd8a01058b036f060b800200148801d8"),
        binary: h2b("ffffffffffffffffffffffffffffffffffffffff"),
    },
    0x5f3b: {
        0x4f20: {
            name: "Kc",
            fcp: h2fcp("62178202412183024f208a01058b036f060480020009880108"),
            binary: h2b("DEDF2CFFE745FED207"),
        },
        0x4f52: {
            name: "KcGPRS",
            fcp: h2fcp("62178202412183024F528A01058B036F060480020009880110"),
            binary: h2b("7586FA0365575AD701"),
        },
    },
};

let fileSystem = {
    0x3f00: {
        name: "MF",
        fcp: h2fcp("62308202782183023f00a507800171830242788a01058b032f0601c61590017c83010183010a83010b83010c83010d83010e"),
        0x2f00: {
            name: "DIR",
            fcp: h2fcp("621a8205422100210183022f008a01058b032f0604800200218801f0"),
            records: [ null,
                h2b("61144f0ca0000000871002ff49ff058950045553494dffffffffffffffffffffff"),
            ]
        },
        0x2fe2: {
            name: "ICCID",
            fcp: h2fcp("62178202412183022fe28a01058b032f06028002000a880110"),
            binary: h2b("989422160622318808f4")
        },
        0x2f05: {
            name: "PL",
            fcp: h2fcp("62178202412183022F058A01058B032F060580020008880128"),
            binary: h2b("6465656e6672ffff")
        },
        0x2f06: {
            name: "ARR",
            fcp: h2fcp("62198205422100591883022f068a01058b032f0602800208588800"),
            records: [ null ]
                .concat(repBuf(3, ffBuf(89)))
                .concat([h2b("8001019000800102a010a40683010c950108a40683010e950108800118a010a40683010d950108a40683010e9501088001649700ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")])
                .concat(repBuf(20, ffBuf(89)))
        },
        0x7f10: {
            fcp: h2fcp("62248202782183027f108a01058b032f0601c61290017883010183010a83010c83010d83010e"),
            name: "TELECOM",
            0x5f3a: {
                fcp: h2fcp("62218202782183025f3a8a01058b036f060cc60f90017083010183010c83010d83010e"),
                0x4f02: {
                    name: "PROSE_ANN",
                    fcp: h2fcp("621f820542210011fa83024f02a5038001718a01058b036f060980020011880110"),
                    records: [null].concat(repBuf(250, h2b("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")))
                },
                0x4f09: {
                    fcp: h2fcp("621a820542210002fa83024f098a01058b036f0607800201f4880108"),
                    records: [null].concat(repBuf(250, h2b("0000")))
                },
                0x4f11: {
                    fcp: h2fcp("621a820542210011fa83024f118a01058b036f06058002109a880110"),
                    records: [null].concat(repBuf(250, h2b("ffffffffffffffffffffffffffffffffff")))
                },
                0x4f12: {
                    fcp: h2fcp("621a82054221000d0a83024f128a01058b036f060580020082880118"),
                    records: [null].concat(repBuf(250, h2b("00ffffffffffffffffffffffff")))
                },
                0x4f15: {
                    fcp: h2fcp("621a820542210002fa83024f158a01058b036f0605800201f4880160"),
                    records: [null].concat(repBuf(250, h2b("ffff")))
                },
                0x4f16: {
                    fcp: h2fcp("621a820542210002fa83024f168a01058b036f0607800201f4880128"),
                    records: [null].concat(repBuf(250, h2b("0000")))
                },
                0x4f19: {
                    fcp: h2fcp("621a8205422100101983024f198a01058b036f060580020190880120"),
                    records: [null].concat(repBuf(25, h2b("ffffffffffffffffffffffffffffffff")))
                },
                0x4f22: {
                    fcp: h2fcp("62178202412183024f228a01058b036f060780020004880168"),
                    binary: h2b("00000000"),
                },
                0x4f23: {
                    fcp: h2fcp("62178202412183024F238A01058B036F060780020002880170"),
                    binary: h2b("0000"),
                },
                0x4f24: {
                    fcp: h2fcp("62178202412183024F248A01058B036F060780020002880178"),
                    binary: h2b("0000"),
                },
                0x4f30: {
                    fcp: h2fcp("62198205422100640183024f308a01058b036f0609800200648800"),
                    records: [ null,
                        h2b("a819c0034f3a0ac1034f150cc5034f0901c9034f1605c4034f1102a90aca034f5109c3034f1904aa0ac2034f1203cb034f3d08ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                    ]
                },
                0x4f3a: {
                    fcp: h2fcp("622282054221001efa83024f3aa50691047f106f3a8a01058b036f060b80021d4c880150"),
                    records: [null,
                        h2b("4141114d65696e65204e756d6d6572ff0891945109072758f1ffffffffff"),
                        h2b("4d61696c626f78ffffffffffffffffff0791947139003033ffffffffffff"),
                        h2b("4b6f6e746f2d41626672616765ffffff04811a10fbffffffffffffffffff"),
                        h2b("4175666c6164756e6720706572426f6e04811a30fbffffffffffffffffff"),
                        h2b("4175666c6164756e6720706572534d5304814545f5ffffffffffffffffff"),
                        h2b("4f7074696f6e736d616e61676572ffff04811a40fbffffffffffffffffff"),
                        h2b("4b756e64656e626574726575756e67ff0891947186884545f5ffffffffff"),
                        h2b("414441432050616e6e656e68696c66650481222222ffffffffffffffffff"),
                        h2b("41444143205665726b656872696e666f04812294f9ffffffffffffffffff"),
                        h2b("4175736b756e667420496e6c616e64ff04811188f1ffffffffffffffffff"),
                        h2b("4175736b756e6674204175736c616e6404811188f2ffffffffffffffffff"),
                        h2b("546178692d53657276696365ffffffff03812849ffffffffffffffffffff"),
                        h2b("5765747465722d496e666fffffffffff0481398873ffffffffffffffffff"),
                        h2b("5765636b7275662d53657276696365ff0481395263ffffffffffffffffff"),
                        h2b("53706f72742d496e666fffffffffffff04817776f8ffffffffffffffffff"),
                        h2b("43696e656d61ffffffffffffffffffff0481423626ffffffffffffffffff"),
                    ].concat(repBuf(0xea, ffBuf(30)))
                },
                0x4f3d: {
                    fcp: h2fcp("621a82054221000f0a83024f3d8a01058b036f060580020096880140"),
                    records: [null].concat(repBuf(25, h2b("ffffffffffffffffffffffffffffff")))
                },
                0x4f3e: {
                    fcp: h2fcp("621a82054221000f0a83024f3e8a01058b036f060580020096880140"),
                },
                0x4f51: {
                    fcp: h2fcp("621a82054221002a1983024f518a01058b036f06078002041a880148"),
                    records: [null].concat(repBuf(25, ffBuf(42)))
                },
            },
            0x6f06: {
                name: 'ARR',
                fcp: h2fcp("62198205422100440c83026f068a01058b036f0601800203308800"),
                records: [null,
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("800103A010A406830101950108A40683010E950108800118A010A40683010D950108A40683010E950108800140A010A40683010C950108A40683010E9501088001249700"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("800103A010A406830101950108A40683010E950108800118A010A40683010D950108A40683010E9501088001649700FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("800101A010A406830101950108A40683010E950108800102A010A40683010C950108A40683010E950108800118A010A40683010D950108A40683010E9501088001649700"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    h2b("800103A010A406830101950108A40683010E950108800118A010A40683010C950108A40683010E9501088001649700FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
                    h2b("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                ]
            },
            0x6f44: {
                fcp: h2fcp("621e82054621001e0a83026f44a5038001718a01058b036f06038002012c8800"),
            },
        },
        0x7f20: {
            name: "GSM",
            fcp: h2fcp("62278202782183027f208a01058b032f0601c61590017c83010183010a83010b83010c83010d83010e"),
            0x6f15: {
                fcp: h2fcp("62168202412183026F158A01058B036F0607800200128800"),
                binary: h2b("01ff02ff03ff04ff05ff07ff08ff09ffc0ff"),
            },
            0x6f16: {
                fcp: h2fcp("62168202412183026f168a01058b036f0608800200038800"),
                binary: h2b("02f300"),
            },
            0x6fad: {
                fcp: h2fcp("621E8202412183026FADA50691047FF06FAD8A01058B036F060E800200048800"),
                binary: h2b("01000102"),
            },
        },
        0x7f43: {
            fcp: h2fcp("62268202782183027f43a503de01048a01058b032f0601c60f90017083010183010c83010d83010e"),
            0x6f15: {
                fcp: h2fcp("62168202412183026F158A01058B036F0607800200128800"),
                binary: h2b("01ff02ff03ff04ff05ff07ff08ff09ffc0ff"),
            },
            0x6f16: {
                fcp: h2fcp("62168202412183026f168a01058b036f0608800200038800"),
                binary: h2b("02f300"),
            },
            0x6fad: {
                fcp: h2fcp("621E8202412183026FADA50691047FF06FAD8A01058B036F060E800200048800"),
                binary: h2b("01000102"),
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