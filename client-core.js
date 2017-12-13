'use strict';

module.exports.execute = execute;

const chalk = require('chalk');
const request = require('request');

const red = chalk.hex('#f00');
const green = chalk.hex('#0f0');

function setCommander(device) {
    device
        .option('--from <name>')
        .option('--to <name>')
        .option('--text <text>');

    device.to = undefined;
    device.from = undefined;
    device.text = undefined;
}

function performOutput(message) {
    let result = '';
    if (message.from) {
        result += (`${red('FROM')}: ${message.from}\n`);
    }
    if (message.to) {
        result += (`${red('TO')}: ${message.to}\n`);
    }
    result += (`${green('TEXT')}: ${message.text}`);

    return result;
}

function execute() {
    let commander = require('commander');
    setCommander(commander);
    let opts = commander.parse(process.argv);

    function requestPromise({ qs = {}, method = 'GET', json = true }) {
        return new Promise((resolve, reject) => {
            request({ baseUrl: 'http://localhost:8080/messages/', url: '/', qs, method, json },
                (err, response, body) => err ? reject(err) : resolve(body));
        });
    }

    switch (process.argv[2]) {
        case 'list':
            return requestPromise({ qs: { from: opts.from, to: opts.to } })
                .then(messages => messages.map(x => performOutput(x)))
                .then(messages => messages.join('\n\n'));
        case 'send':
            return requestPromise({ qs: { from: opts.from, to: opts.to },
                method: 'POST', json: { text: opts.text } })
                .then(x => performOutput(x));
        default:
            return Promise.reject();
    }
}
