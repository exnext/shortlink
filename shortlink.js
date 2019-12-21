'use strict';

const url = require('url');
const fs = require('fs');
const express = require('express');
const { Sequelize, Model, DataTypes } = require('sequelize');
const Recaptcha = require('recaptcha-verify');

const config = {
    port: 8080,
    address: 'localhost'
};


if (fs.existsSync('./config.json')) {
    const configFile = fs.readFileSync('./config.json');
    Object.assign(config, JSON.parse(configFile));
}


let recaptcha;
if (config.recaptcha && config.recaptcha.secretKey) {
    recaptcha = new Recaptcha({
        secret: config.recaptcha.secretKey,
        verbose: true
    });
}


const sequelize = new Sequelize('sqlite::memory:');
// const sequelize = new Sequelize('sqlite:./shortlink.db');

class Link extends Model {}
Link.init({
  tag: DataTypes.STRING,
  url: DataTypes.STRING
}, { sequelize, modelName: 'link' });


const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.get(/^\/(shortlink|config.json).*$/, (req, res) => {
    res.send('funny :)');
});
app.use(express.static(__dirname + '/'));

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
    function insert() {
        sequelize.sync()
        .then(() => Link.create(data))
        .then(link => {
            res.send(link);
        });
    }

    let data = buildData(req.body);

    if (recaptcha && req.body.recaptchaToken) {
        recaptcha.checkResponse(req.body.recaptchaToken, function(error, response){
            if(error){
                res.status(400).render('400', {
                    message: error.toString()
                });
                return;
            }

            if(response.success){
                insert();
            }else{
                res.status(401).render('401', {
                    message: 'Client is not a human'
                });
            }
        });
    } else {
        insert();
    }
});

app.get('/config', (req, res) => {
    res.send({
        recaptcha: {
            siteKey: config.recaptcha && config.recaptcha.siteKey
        }
    });
})

app.get('/:tag', (req, res) => {
    Link.findOne({ where: { tag: req.params.tag } })
    .then((link) => {
        if (req.query.view) {
            res.send(link);
        } else {
            let u = url.parse(link.url);

            let address = u.protocol
                ? link.url
                : '//' + link.url;

            res.redirect(address);
        }
    });
});

function generateTag(attempts = 10) {
    let tag = Math.random().toString(36).substring(2, 15);

    if (existTag(tag)) {
        if (attempts) {
            tag = generateTag(attempts--);
        } else {
            throw 'Internal error, please try again';
        }
    }

    return tag;
}

function existTag(tag) {
    let result = false;
    
    Link.findOne({ where: { tag } })
    .then((link) => {
        result = true;
    });

    return result;
}

function buildData(data) {
    return {
        tag: generateTag(),
        url: data.url
    }
}

let address = config.address || 'localhost';
app.listen(config.port, address);
console.log(`Running on http://${address}:${config.port}`);