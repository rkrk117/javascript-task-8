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
        .option('--text <text>')
        .command('list')
        .command('send');

    device.to = undefined;
    device.from = undefined;
    device.text = undefined;
}

function performOutput(message) {
    return [
        message.from && `${red('FROM')}: ${message.from}`,
        message.to && `${red('TO')}: ${message.to}`,
        `${green('TEXT')}: ${message.text}`
    ].filter(Boolean).join('\n');
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

    switch (opts.args[0]) {
        case 'list':
            return requestPromise({ qs: { from: opts.from, to: opts.to } })
                .then(messages => messages.map(x => performOutput(x)))
                .then(messages => messages.join('\n\n'));
        case 'send':
            return requestPromise({ qs: { from: opts.from, to: opts.to },
                method: 'POST', json: { text: opts.text } })
                .then(x => performOutput(x));
        default:
            return Promise.reject('Supported only: list, send');
    }
}
