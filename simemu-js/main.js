const sprintf = require('sprintf-js').sprintf;
const SimEmu = require('./simemu');
const process = require('process');
const fs = require('fs');


function parseArgs() {
    let argv = require('minimist')(process.argv.slice(2));

    let ttyClass = null;
    if (argv.f) {
        ttyClass = require('./serial-port');
    } else {
        ttyClass = require('serialport');
    }

    let simemuFile = 'passthrough.js';
    if (argv.s) { simemuFile = argv.s; }
    let simClass = null;
    try {
        simClass = require(simemuFile);
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            if (simemuFile.substr(simemuFile.length - 3) === '.js') {
                simemuFile = simemuFile.substr(0, simemuFile.length - 3);
                if (simemuFile.charAt(0) !== '/')
                    simemuFile = "./" + simemuFile;
                simClass = require(simemuFile);
            }
        }
    }

    let ttyPath = '/dev/ttyACM0';
    if (argv.t) { ttyPath = argv.t; }

    return {simClass, ttyPath, ttyClass};
}

const config = parseArgs();

const EmulatedSim = config.simClass;

const SerialPort = config.ttyClass;
const port = new SerialPort(config.ttyPath);

port.on('error', (error) => {
    console.log(`Port error: "${error}"`);
    exit();
});

port.open(function (err) {
    if (err) {
        console.log('Error opening port: ', err.message);
        exit();
        return;
    }

    const simemu = new SimEmu(port);
    const emulatedSim = new EmulatedSim(simemu);

    simemu.on('error', (err) => {
        console.log('Error(', this.name, '):', err.message);
    })
});

// Let's keep this process alive
const keepAlive = setInterval(() => {}, 1000);
function exit() { clearInterval(keepAlive); }
