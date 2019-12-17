'use strict';

const express = require('express');
// const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/'));

// var NoSQL = require('nosql');
// var db2 = NoSQL.load('./database.nosql', ['linki']);
// db2.find().make(function(filter) {
//     filter.where('age', '>', 20);
//     filter.where('removed', false);
//     filter.callback(function(err, response) {
//         console.log(err, response);
//     });
// });
//https://github.com/sequelize/sequelize/
//https://github.com/totaljs/node-sqlagent

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
        // db.getUrlsList()
        //     .then((result) => {
        //         res.send(result);
        //     })
        //     .catch((error) => {
        //         res.send(error);
        //     });
        res.send();
    } else if (req.query.url) {
        let data = buildData(req.query);

        res.send();
        // db.insert(data)
        //     .then((result) => {
        //         res.send('added ' + result.$tag);
        //     })
        //     .catch((error) => {
        //         res.send(error);
        //     });
    } else {
        res.redirect('/add');
    }
});

app.post('/', (req, res) => {
    let data = buildData(req.body);

    sequelize.sync()
    .then(() => Link.create({
        tag: data.tag || generateTag(data),
        url: data.url,
        name: data.name,
        description: data.description,
        expire: data.expire,
        added: new Date()
    }))
    .then(link => {
        res.send(link.toJSON());
    });    

    // db.insert(data)
    //     .then((result) => {
    //         res.send('added ' + result.$tag);
    //     })
    //     .catch((error) => {
    //         res.send(error);
    //     });
});

app.get('/:tag', (req, res) => {
    // db.getUrl(req.params.tag)
    //     .then((result) => {
    //         console.log(result);
    //         if (!!req.query.view) {
    //             res.send(result);
    //         } else {
    //             res.redirect(result.url);
    //         }
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         res.send(error);
    //     });
    res.send();
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
        $tag: generateTag(data),
        $url: data.url,
        $name: data.name,
        $description: data.description,
        $expire: data.expire,
        $added: new Date()
    }
}

// db.init().then(() => {
//     const PORT = 8080;
//     const HOST = '0.0.0.0';
//     app.listen(PORT, HOST);
//     console.log(`Running on http://${HOST}:${PORT}`);
// });

const PORT = 8080;
const HOST = '0.0.0.0';
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);