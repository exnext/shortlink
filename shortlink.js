'use strict';

const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
    console.log(req.client);
    if (req.query.list) {
        db.getUrlsList()
            .then((result) => {
                res.send(result);
            })
            .catch((error) => {
                res.send(error);
            });
    } else if (req.query.url) {
        let data = buildData(req.query);

        db.insert(data)
            .then((result) => {
                res.send('added ' + result.$tag);
            })
            .catch((error) => {
                res.send(error);
            });
    } else {
        res.redirect('/add');
    }
});

app.post('/', (req, res) => {
    let data = buildData(req.body);

    db.insert(data)
        .then((result) => {
            res.send('added ' + result.$tag);
        })
        .catch((error) => {
            res.send(error);
        });
});

app.get('/add', (req, res) => {
    res.send('add');
});

app.get('/:tag', (req, res) => {
    db.getUrl(req.params.tag)
        .then((result) => {
            console.log(result);
            if (!!req.query.view) {
                res.send(result);
            } else {
                res.redirect(result.url);
            }
        })
        .catch((error) => {
            console.log(error);
            res.send(error);
        });
});

function generateTag(params, attempts = 10) {
    let allowUserTag = params.tag/* && your autythication conditions*/;
    let tag;

    if (allowUserTag) {
        tag = params.tag;
    }

    tag = tag || Math.random().toString(36).substring(2, 15);

    if (db.existTag(tag)) {
        if (allowUserTag) {
            throw 'the tag is used';
        } else if (attempts) {
            tag = generateTag(params, attempts--);
        } else {
            throw 'internal error, please try again';
        }
    }

    return tag;
}

function buildData(data) {
    return {
        $tag: generateTag(data),
        $url: data.url,
        $name: data.name,
        $description: data.description,
        $expire: data.expire,
        $added: new Date()
    }
}

db.init().then(() => {
    const PORT = 8080;
    const HOST = '0.0.0.0';
    app.listen(PORT, HOST);
    console.log(`Running on http://${HOST}:${PORT}`);
});