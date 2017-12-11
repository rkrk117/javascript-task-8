'use strict';

const http = require('http');

const server = http.createServer();

const urlapi = require('url');
const queryapi = require('querystring');

let vault = [];

function extractQuery(from, to) {
    let filter;
    if (from && to) {
        filter = (note) => note.from === from && note.to === to;
    } else if (from) {
        filter = (note) => note.from === from;
    } else if (to) {
        filter = (note) => note.to === to;
    } else {
        filter = () => true;
    }

    return vault.filter(filter);
}

server.on('request', (req, res) => {
    let { query } = urlapi.parse(req.url);
    let { from, to } = queryapi.parse(query);
    res.setHeader('content-type', 'application/json');
    if (req.url.match(/^\/messages/) && req.method === 'GET') {
        res.write(JSON.stringify(extractQuery(from, to)));
        res.end();
    } else if (req.url.match(/^\/messages/) && req.method === 'POST') {
        let note = {};
        let text = '';
        req.on('data', more => {
            text += more;
        });
        req.on('end', () => {
            if (from) {
                note.from = from;
            }
            if (to) {
                note.to = to;
            }
            note.text = JSON.parse(text).text;
            vault.push(note);
            res.write(JSON.stringify(note));
            res.end();
        });
    } else {
        res.statusCode = 404;
        res.end();
    }
});

module.exports = server;
