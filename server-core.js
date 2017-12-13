'use strict';

const http = require('http');

const server = http.createServer();

const urlapi = require('url');
const queryapi = require('querystring');

let vault = [];

function filterForQuery(from, to) {
    if (from && to) {
        return (note) => note.from === from && note.to === to;
    } else if (from) {
        return (note) => note.from === from;
    } else if (to) {
        return (note) => note.to === to;
    }

    return () => true;
}

server.on('request', (req, res) => {
    let query = urlapi.parse(req.url).query;
    let { from, to } = queryapi.parse(query);
    res.setHeader('content-type', 'application/json');
    if ((/^\/messages($|\?)/).test(req.url)) {
        if (req.method === 'GET') {
            res.write(JSON.stringify(vault.filter(filterForQuery(from, to))));
            res.end();
        } else if (req.method === 'POST') {
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
        }
    } else {
        res.statusCode = 404;
        res.end();
    }
});

module.exports = server;
