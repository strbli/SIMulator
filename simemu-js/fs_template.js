function bfh(hex) {
    return Buffer.from(hex, 'hex');
}


let USIM = {
    name: "USIM",
    aid: "a0000000871002ffffffff8903020000",
    fcp: bfh("6231820278218410a0000000871002ffffffff8903020000a503de01048a01058b032f0608c60c90016083010183010a830181"),
    
    0x6f05: {
        name: "LI",
        fcp: bfh("62178202412183026f058a01058b036f06048002000a880110"),
        binary: bfh("454effffffffffffffff")
    },
    0x6f06: {
        name: "ARR",
        fcp: bfh("621a8205422100260983026f068a01058b036f0601800201568801b8"),
        records: [ null,
            bfh("800101900080015aa40683010a9501088001249700ffffffffffffffffffffffffffffffffff"),
            null, null, null, null,
            bfh("800103a406830101950108800158a40683010a9501088001249700ffffffffffffffffffffff"),
        ]
    },
    0x6f07: {
        name: 'IMSI',
        fcp: bfh("62178202412183026f078a01058b036f060580020009880138"),
        binary: bfh("083901711050455732"),
    },
    0x6f08: {
        name: "Keys",
        fcp: bfh("62178202412183026f088a01058b036f060680020021880140"),
        binary: bfh("07ccbb074c6a720b97eda4ec2db6bdb39ee2908cfe0acd8aea956cd306d6410f2a"),
    },
    0x6f09: {
        name: "KEYSPS",
        fcp: bfh("62178202412183026f098a01058b036f060680020021880148"),
        binary: bfh("078ba70960b2fb26e24cb52fec45eccd0bd5863dbc643e4bc728eae0645539f21b"),
    },
    0x6f15: {
        fcp: bfh("62168202412183026f158a01058b036f06058002001a8800"),
        binary: bfh("01f00200038004c005c00600070008830984c05dff00ff00ff00"),
    },
    0x6f2c: {
        name: "DCK",
    },
    0x6f31: {
        name: "HPPLMN",
        fcp: bfh("62178202412183026f318a01058b036f060580020001880190"),
        binary: bfh("01"),
    },
    0x6f32: {
        name: "CNL",
    },
    0x6f37: {
        name: "ACMmax",
    },
    0x6f38: {
        name: "UST",
        fcp: bfh("62178202412183026f388a01058b036f06058002000c880120"),
        binary: bfh("000a100c2736000040021004"),
    },
    0x6f39: {
        name: "ACM",
    },
    0x6f3b: {
        name: "FDN",
    },
    0x6f3c: {
        name: "SMS",
        fcp: bfh("62198205422100b00a83026f3c8a01058b036f0606800206e08800"),
        records: [null,
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6f3e: {
        name: "GID1",
    },
    0x6f3f: {
        name: "GID2",
    },
    0x6f40: {
        name: "MSISDN",
        fcp: bfh("62198205422100200483026f408a01058b036f0606800200808800"),
        records: [ null,
            bfh("ffffffffffffffffffffffffffffffffffff07818156343815f4ffffffffffff"),
            bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6f41: {
        name: "PUCT",
    },
    0x6f42: {
        name: "SMSP",
        fcp: bfh("621982054221002e0383026f428a01058b036f06068002008a8800"),
        records: [null,
            bfh("534d532053657474696e6773ffffffffffffe1ffffffffffffffffffffffff07919107739608f0ffffffff0000a7"),
            bfh("456d707479ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("456d707479ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6f43: {
        name: "SMSS",
        fcp: bfh("62168202412183026f438a01058b036f0606800200028800"),
        binary: bfh("a4ff"),
    },
    0x6f45: {
        name: "CBMI",
    },
    0x6f46: {
        name: "SPN",
        fcp: bfh("ffffffffffffffff"),
        binary: bfh("006a6121206d6f62696cffffffffffffff")
    },
    0x6f47: {
        name: "SMSR",
    },
    0x6f48: {
        name: "CBMID",
    },
    0x6f49: {
        name: "SDN",
    },
    0x6f4b: {
        name: "EXT2",
    },
    0x6f4c: {
        name: "EXT3",
    },
    0x6f4d: {
        name: "BDN",
    },
    0x6f4e: {
        name: "EXT5",
    },
    0x6f4f: {
        name: "CCP2",
    },
    0x6f50: {
        name: "CBMIR",
    },
    0x6f55: {
        name: "EXT4",
    },
    0x6f56: {
        name: "EST",
        fcp: bfh("62178202412183026f568a01058b036f060780020002880128"),
        binary: bfh("0000"),
    },
    0x6F5b: {
        name: "START-HFN",
        fcp: bfh("62178202412183026f5b8a01058b036f060680020006880178"),
        binary: bfh("000008000000"),
    },
    0x6F5c: {
        name: "THRESHOLD",
        fcp: bfh("62178202412183026f5c8a01058b036f060580020003880180"),
        binary: bfh("ffffff"),
    },
    0x6f60: {
        name: "PLMNwAcT",
        fcp: bfh("621c8202412183026f60a5038001718a01058b036f061580020028880150"),
        binary: bfh(
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
        fcp: bfh("62178202412183026f618a01058b036f0605800201f4880188"),
        binary: bfh(
            "62f2204000" +
            "62f2208000" +
            "62f2200080" +
            "22f2014000" +
            "22f2018000" +
            "22f2010080" +
            "02f4404000" +
            "02f4408000" +
            "02f4400080" +
            "12f4104000" +
            "12f4108000" +
            "12f4100080" +
            "32f0304000" +
            "32f0308000" +
            "32f0300080" +
            "62f8104000" +
            "62f8108000" +
            "62f8100080" +
            "32f2104000" +
            "32f2108000" +
            "32f2100080" +
            "72f8108000" +
            "72f8100080" +
            "22f8104000" +
            "22f8108000" +
            "22f8100080" +
            "02f8014000" +
            "02f8018000" +
            "02f8010080" +
            "92f5508000" +
            "92f5500080" +
            "02f8024000" +
            "02f8028000" +
            "02f8020080" +
            "32f8204000" +
            "32f8208000" +
            "32f8200080" +
            "12f4704000" +
            "12f4708000" +
            "12f4700080" +
            "02f6104000" +
            "02f6108000" +
            "02f6100080" +
            "02f8104000" +
            "02f8108000" +
            "02f8100080" +
            "72f0778000" +
            "72f0770080" +
            "22f2884000" +
            "22f2888000" +
            "22f2880080" +
            "32f8108000" +
            "32f8100080" +
            "12f4304000" +
            "12f4308000" +
            "12f4300080" +
            "62f2704000" +
            "62f2708000" +
            "62f2700080" +
            "62f8304000" +
            "62f8308000" +
            "62f8300080" +
            "32f0204000" +
            "32f0208000" +
            "32f0200080" +
            "72f8778000" +
            "72f8770080" +
            "02f6024000" +
            "02f6028000" +
            "02f6020080" +
            "62f0104000" +
            "62f0108000" +
            "62f0100080" +
            "72f8124000" +
            "72f8128000" +
            "72f8120080" +
            "62f0304000" +
            "62f0308000" +
            "62f0300080" +
            "32f2308000" +
            "32f2300080" +
            "22f2104000" +
            "22f2108000" +
            "22f2100080" +
            "62f2104000" +
            "62f2108000" +
            "62f2100080" +
            "62f8608000" +
            "62f8600080" +
            "62f0208000" +
            "62f0200080" +
            "02f6014000" +
            "02f6018000" +
            "02f6010080" +
            "22f8208000" +
            "22f8200080" +
            "72f0998000" +
            "72f0990080" +
            "32f2508000" +
            "32f2500080" +
            ""),
    },
    0x6f62: {
        name: "HPLMNwAcT",
        fcp: bfh("62178202412183026f628a01058b036f060580020032880198"),
        binary: bfh(
            "1300144000" +
            "1300148000" +
            "1300140080" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000" +
            "ffffff0000"),
    },
    0x6f73: {
        name: "PSLOCI",
        fcp: bfh("62178202412183026f738a01058b036f06068002000e880160"),
        binary: bfh("ffffffffffffff172217fffeff01"),
    },
    0x6f78: {
        name: "ACC",
        fcp: bfh("62178202412183026f788a01058b036f060580020002880130"),
        binary: bfh("0008"),
    },
    0x6f7b: {
        name: "FPLMN",
        fcp: bfh("62178202412183026f7b8a01058b036f06068002002d880168"),
        binary: bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    },
    0x6f7e: {
        name: "LOCI",
        fcp: bfh("621c8202412183026f7ea503de01088a01058b036f06068002000b880158"),
        binary: bfh("5b5680f362f22003bfff00"),
    },
    0x6f80: {
        name: "ICI",
    },
    0x6f81: {
        name: "OCI",
    },
    0x6f82: {
        name: "ICT",
    },
    0x6f83: {
        name: "OCT",
    },
    0x6fad: {
        name: "AD",
        fcp: bfh("62178202412183026fad8a01058b036f060180020004880118"),
        binary: bfh("00000003"),
    },
    0x6fb1: {
        name: "VGCS",
    },
    0x6fb2: {
        name: "VGCSS",
    },
    0x6fb3: {
        name: "VBS",
    },
    0x6fb4: {
        name: "VBSS",
    },
    0x6fb5: {
        name: "eMLPP",
    },
    0x6fb6: {
        name: "AAeM",
    },
    0x6fb7: {
        name: "ECC",
        fcp: bfh("621a8205422100040583026fb78a01058b036f060180020014880108"),
        binary: bfh("621a8205422100040583026fb78a01058b036f060180020014880108"),
            records: [ null,
            bfh("ffffffff"),
            bfh("ffffffff"),
            bfh("ffffffff"),
            bfh("ffffffff"),
            bfh("ffffffff"),
        ]
    },
    NOT_FOUND_0x6fc3: {
        name: "Hiddenkey",
    },
    0x6fc4: {
        name: "NETPAR",
        fcp: bfh("62168202412183026fc48a01058b036f0606800200da8800"),
        binary: bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    },
    0x6fc5: {
        name: "PNN",
        fcp: bfh("621a8205422100180a83026fc58a01058b036f0601800200f08801c8"),
        records: [null,
            bfh("43058441aa890affffffffffffffffffffffffffffffffff"),
            bfh("430e8641aa890a6aa6c7f2f7b0cc6603ffffffffffffffff"),
            bfh("430b834fb319e42cd3ef6ff91affffffffffffffffffffff"),
            bfh("430f87e3329b5d6787e5a0301d342d0601ffffffffffffff"),
            bfh("430880cdb03c4d4fb7cbffffffffffffffffffffffffffff"),
            bfh("43088741aa890a224a01ffffffffffffffffffffffffffff"),
            bfh("ffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("ffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("ffffffffffffffffffffffffffffffffffffffffffffffff"),
            bfh("ffffffffffffffffffffffffffffffffffffffffffffffff"),
        ]
    },
    0x6fc6: {
        name: "OPL",
        fcp: bfh("621a8205422100081483026fc68a01058b036f0601800200a08801d0"),
        records: [null,
            bfh("130014fa00fb8f02"), bfh("130014fb90fc9401"),
            bfh("130014fc95fde702"), bfh("13d1dd0000fffe01"),
            bfh("13d2dd0000fffe01"), bfh("13d3dd0000fffe01"),
            bfh("13d4dd0000fffe01"), bfh("13d5dd0000fffe01"),
            bfh("09f1810000fffe04"), bfh("13d0dd0000fffe01"),
            bfh("ffffffffffffffff"), bfh("ffffffffffffffff"),
            bfh("ffffffffffffffff"), bfh("ffffffffffffffff"),
            bfh("ffffffffffffffff"), bfh("ffffffffffffffff"),
            bfh("ffffffffffffffff"), bfh("ffffffffffffffff"),
            bfh("ffffffffffffffff"), bfh("ffffffffffffffff"),
        ]
    },
    0x6fc7: {
        name: "MBDN",
    },
    0x6fc8: {
        name: "EXT6",
    },
    0x6fc9: {
        name: "MBI",
    },
    0x6fca: {
        name: "MWIS",
    },
    0x6fcb: {
        name: "CFIS",
    },
    0x6fcc: {
        name: "EXT7",
    },
    0x6fcd: {
        name: "SPDI",
    },
    0x6fce: {
        name: "MMSN",
    },
    0x6fcf: {
        name: "EXT8",
    },
    0x6fd0: {
        name: "MMSICP",
    },
    0x6fd1: {
        name: "MMSUP",
    },
    0x6fd2: {
        name: "MMSUCP",
        fcp: bfh("621f8202412183026fd2a50691047f666fd28a01058b036f060980020010880108"),
        binary: bfh("00000000000000000000000000000000")
    },
    0x6fd3: {
        name: "NIA",
    },
    0x6fd4: {
        name: "VGCSCA",
    },
    0x6fd5: {
        name: "VBSCA",
    },
    0x6fd6: {
        name: "GBABP",
    },
    0x6fd7: {
        name: "MSK",
    },
    0x6fd8: {
        name: "MUK",
    },
    0x6fd9: {
        name: "EHPLMN",
        fcp: bfh("62178202412183026fd98a01058b036f06058002000f8801e8"),
        binary: bfh("130014ffffffffffffffffffffffff"),
    },
    0x6fda: {
        name: "GBANL",
    },
    0x6fdb: {
        name: "EHPLMNPI",
    },
    0x6fdc: {
        name: "LRPLMNSI",
        fcp: bfh("62168202412183026fdc8a01058b036f0605800200018800"),
        binary: bfh("01"),
    },
    0x6fdd: {
        name: "NAFKCA",
    },
    0x6fde: {
        name: "SPNI",
    },
    0x6fdf: {
        name: "PNNI",
    },
    0x6fe2: {
        name: "NCP-IP",
    },
    0x6fe3: {
        name: "EPSLOCI",
        fcp: bfh("62178202412183026fe38a01058b036f0606800200128801f0"),
        binary: bfh("0bf662f220ea6240f602e86462f220bbbd00"),
    },
    0x6fe4: {
        name: "EPSNSC",
        fcp: bfh("621a8205422100360183026fe48a01058b036f0606800200368801c0"),
        records: [ null,
            bfh("a03480010781209770ad30653eedf0bb54c5d14e3ca7989d69610d350ceaa31cb1d19416e05f94820400000008830400000005840122"),
        ]
    },
    0x6fe6: {
        name: "UFC",
    },
    0x6fe7: {
        name: "UICCIARI",
    },
    0x6fe8: {
        name: "NASCONFIG",
    },
    0x6fec: {
        name: "PWS",
    },
    0x6fed: {
        name: "FDNURI",
    },
    0x6fee: {
        name: "BDNURI",
    },
    0x6fef: {
        name: "SDNURI",
    },
    0x6ff0: {
        name: "IWL",
    },
    0x6ff1: {
        name: "IPS",
    },
    0x6ff2: {
        name: "IPD",
    },
    0x6ff3: {
        name: "ePDGId",
    },
    0x6ff4: {
        name: "ePDGSelection",
    },
    0x6ff5: {
        name: "ePDGIdEm",
    },
    0x6ff6: {
        name: "ePDGSelectionEm",
    },
    0x6ff7: {
        name: "FromPreferred",
    },
    0x6ff8: {
        name: "IMSConfigData",
    },
    0x6ff9: {
        name: "3GPPPSDATAOFF",
    },
    0x6ffa: {
        name: "3GPPPSDATAOFFservicelist",
    },
    0x6fff: {
        name: "TVCONFIG",
    },
    '6FYY': {
        name: "XCAPconfigData",
    },
    0x5f3b: {
        0x4f20: {
            name: "Kc",
            fcp: bfh("62178202412183024f208a01058b036f060680020009880108"),
            binary: bfh("56e3b49900433dc907"),
        },
        0x4f52: {
            name: "KcGPRS",
            fcp: bfh("62178202412183024f528a01058b036f060680020009880110"),
            binary: bfh("3a7efb54c610523507"),
        },
    },
    0x5f30: {
        0x4f34: {
            fcp: bfh("62218202412183024f34a50891067f665f304f348a01058b036f060180020003880108"),
            binary: bfh("130014")
        },
        0x4f36: {
            fcp: bfh("62218202412183024f36a50891067f665f304f368a01058b036f060180020001880110"),
            binary: bfh("03")
        },
    },
    0x5f40: {
        0x4f44: {
            fcp: bfh("62168202412183024f448a01058b036f0609800200018800")
        }
    },
};

let ISIM = {
    name: "ISIM",
    aid: "a0000000871004ffffffff8903020000",
    fcp: bfh("6229820278218410a0000000871004ffffffff89030200008a01058b032f0608c60990014083010183010a"),
};

let fileSystem = {
    0x3f00: {
        name: "MF",
        fcp: bfh("62288202782183023f00a50b8001718303015d72de01048a01058b032f0601c60990014083010183010a"),
        0x2fe2: {
            name: "ICCID",
            fcp: bfh("62178202412183022fe28a01058b032f06058002000a880110"),
            binary: bfh("98107120720155742593")
        },
        0x2f05: {
            name: "PL",
            fcp: bfh("62178202412183022f058a01058b032f06048002000a880128"),
            binary: bfh("454effffffffffffffff")
        },
        0x2f06: {
            name: "ARR",
        },
        0x2f08: {
            name: "UMPC",
        },
        0x2f00: {
            name: "DIR",
            fcp: bfh("621a8205422100260383022f008a01058b032f0602800200728801f0"),
            records: [ null,
                bfh("61184f10a0000000871002ffffffff890302000050045553494dffffffffffffffffffffffff"),
                bfh("61184f10a0000000871004ffffffff890302000050044953494dffffffffffffffffffffffff"),
                bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
            ]
        },
        0x7f10: {
            name: "TELECOM",
            0x5f3a: {
                0x4f30: {
                    fcp: bfh("62198205422100210183024f308a01058b036f0603800200218800"),
                    binary: bfh("130014"),
                    records: [ null,
                        bfh("a80fc0034f3a01c5034f0909c9034f210baa0ec2034f4a08c7024f4bcb034f3d0f")
                    ]
                },
                0x4f3a: {
                    fcp: bfh("621a8205422100220283024f3a8a01058b036f060280020044880108"),
                    records: [ null,
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    ]
                },
                0x4f4a: {
                    fcp: bfh("621a82054221000d0a83024f4a8a01058b036f060280020082880140"),
                },
                0x4f09: {
                    fcp: bfh("621a8205422100020283024f098a01058b036f060480020004880148"),
                    records: [ null,
                        bfh("0000"),
                        bfh("0000"),
                    ]
                },
                0x4f21: {
                    fcp: bfh("621a8205422100020283024f218a01058b036f060480020004880158"),
                    records: [ null,
                        bfh("0000"),
                        bfh("0000"),
                    ]
                },
                0x4f22: {
                    fcp: bfh("62178202412183024f228a01058b036f060480020004880160"),
                    binary: bfh("00000000"),
                },
                0x4f23: {
                    fcp: bfh("62178202412183024f238a01058b036f060480020002880168"),
                    binary: bfh("0000"),
                },
                0x4f24: {
                    fcp: bfh("62178202412183024f248a01058b036f060480020002880170"),
                    binary: bfh("0000"),
                },
                0x4f4b: {
                    fcp: bfh("62198205422100280a83024f4b8a01058b036f0604800201908800"),
                    records: [ null,
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                        bfh("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                    ]
                }
            },
            0x6f06: {
                fcp: bfh("621982054221001b0583026f068a01058b036f0601800200878800"),
                records: [ null,
                    null,
                    bfh("800103a406830101950108800158a40683010a9501088001249700"),
                    bfh("800101a40683010195010880015aa40683010a9501088001249700"),
                    bfh("800103a406830101950108800118a40683010a9501088001649700")
                ]
            },
        },
        0x7f66: USIM,
        0x7fff: USIM
    }
};


fileSystem.getADFbyID = function (aid) {
    return {
        'a0000000871002ffffffff8903020000': USIM,
        'a0000000871004ffffffff8903020000': ISIM
    }[aid];
};

module.exports = fileSystem;