'use strict';

const url = require('url');


const config = (() => {
    const fs = require('fs');
    const fileName = './config.json';
    let fileJSON = {};

    if (fs.existsSync(fileName)) {
        const file = fs.readFileSync(fileName);
        fileJSON = JSON.parse(file);
    }

    return Object.assign({
        port: 8080,
        address: 'localhost',
        database: './shortlink.db',

    }, fileJSON);
})();


const recaptcha = (() => {
    if (config.recaptcha && config.recaptcha.secretKey) {
        const Recaptcha = require('recaptcha-verify');
        
        const rv = new Recaptcha({
            secret: config.recaptcha.secretKey,
            verbose: false
        });

        function check(token) {
            return new Promise((resolve, reject) => {
                rv.checkResponse(token, function (error, response) {
                    if (error) {
                        reject({
                            status: 400,
                            message: error.toString()
                        });

                        return;
                    }
        
                    if (response.success) {
                        resolve();
                    } else {
                        reject({
                            status: 401,
                            message: 'Client is not a human'
                        });
                    }
                });
            });
        }

        return {
            check
        }
    } else {
        return null;
    }
})();


const { sequelize, Link, Op } = (() => {
    const { Sequelize, Model, DataTypes } = require('sequelize');
    const sequelize = new Sequelize('sqlite:' + config.database, {
        logging: false
    });

    class Link extends Model { }

    Link.init({
        tag: DataTypes.STRING,
        url: DataTypes.STRING
    }, { sequelize, modelName: 'link' });

    sequelize.sync();

    return { sequelize, Link, Op: Sequelize.Op }
})();


const app = (() => {
    const express = require('express');
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded());

    app.get(/^\/((shortlink.(db|js))|config.json).*$/, (req, res) => {
        let address = req.protocol + '://' + req.headers.host + '/add?status=401';
        res.redirect(address);
    });
    
    app.use(express.static(__dirname + '/'));

    return app;
})();


app.get('/', (req, res) => {
    res.redirect('/add');
});

app.post('/', (req, res) => {
    function insert() {
        let data = {
            tag: generateTag(),
            url: req.body.url
        };
        
        sequelize.sync()
            .then(() => Link.create(data))
            .then(link => {
                res.send(link);
            });
    }

    if (recaptcha && req.body.recaptchaToken) {
        recaptcha.check(req.body.recaptchaToken)
            .then(() => {
                insert();
            })
            .catch((error) => {
                res.status(error.status).send(error.message);
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

app.get('/:tag', (req, res, next) => {
    if (/^(add|favicon.ico).*$/.test(req.params.tag)) {
        next();
    } else {
        Link.findOne({ where: { tag: req.params.tag } })
        .then((link) => {
            if (link) {
                if (req.query.view) {
                    res.send(link);
                } else {
                    let u = url.parse(link.url);

                    let address = u.protocol
                        ? link.url
                        : '//' + link.url;

                    res.redirect(address);
                }
            } else {
                let address = req.protocol + '://' + req.headers.host + '/add?status=404';
                res.redirect(address);
            }
        });
    }
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

app.listen(config.port, config.address);
console.log(`Running on http://${config.address}:${config.port}`);