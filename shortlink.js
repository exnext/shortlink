'use strict';

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/'));


const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite:./shortlink.db');

class Link extends Model {}
Link.init({
  tag: DataTypes.STRING,
  url: DataTypes.STRING,
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  expire: DataTypes.DATE,
  added: DataTypes.DATE
}, { sequelize, modelName: 'link' });


app.get('/', (req, res) => {
    console.log(req.client);
    if (req.query.list) {
        Link.findAll()
        .then((links) => {
            res.send(links);
        });
    } else if (req.query.url) {
        let data = buildData(req.query);

        sequelize.sync()
        .then(() => Link.create(data))
        .then(link => {
            res.send(link.toJSON());
        });
    } else {
        res.redirect('/add');
    }
});

app.post('/', (req, res) => {
    let data = buildData(req.body);

    sequelize.sync()
    .then(() => Link.create(data))
    .then(link => {
        res.send(link);
    });
});

app.get('/:tag', (req, res) => {
    Link.findAll({ where: { tag: req.params.tag } })
    .then((link) => {
        if (req.query.view) {
            res.send(link[0]);
        } else {
            // res.redirect(link.url);
            res.send(link[0].url);
        }
    });
});

function generateTag(params, attempts = 10) {
    let allowUserTag = params.tag/* && your autythication conditions*/;
    let tag;

    if (allowUserTag) {
        tag = params.tag;
    }

    tag = tag || Math.random().toString(36).substring(2, 15);

    // if (db.existTag(tag)) {
    //     if (allowUserTag) {
    //         throw 'the tag is used';
    //     } else if (attempts) {
    //         tag = generateTag(params, attempts--);
    //     } else {
    //         throw 'internal error, please try again';
    //     }
    // }

    return tag;
}

function buildData(data) {
    return {
        tag: generateTag(data),
        url: data.url,
        name: data.name,
        description: data.description,
        expire: data.expire,
        added: new Date()
    }
}

const PORT = 8080;
const HOST = '0.0.0.0';
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);