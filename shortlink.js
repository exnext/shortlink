'use strict';

// const fs = require('fs');
// const sqlite3 = require('sqlite3').verbose();
const express = require('express');

const constDb = require('./constDb');

const app = express();
app.use(express.json());
app.use(express.urlencoded());

const PORT = 8080;
const HOST = '0.0.0.0';


constDb.init().then(() => {
    app.listen(PORT, HOST);
    console.log(`Running on http://${HOST}:${PORT}`);    
});

// fs.closeSync(fs.openSync(constDb.FILE, 'w'));

// let db = new sqlite3.Database(constDb.FILE, sqlite3.OPEN_READWRITE, (error) => {
//     if (error) {
//         console.error(error.message);
//         return;
//     }

//     initDB();

//     app.listen(PORT, HOST);
//     console.log(`Running on http://${HOST}:${PORT}`);
// });

// function initDB() {
//     db.serialize(() => {
//         db.run(constDb.CREATE_TABLE);
//     });
// }

app.get('/', (req, res) => {
    if (req.query.url) {
        let data = buildData(req.query);

        constDb.insert(data)
        .then((result) => {
            res.send('added ' + result.$tag);
        })
        .catch((error) => {
            res.send(error);
        });
    } else if (req.query.list) {
        constDb.getUrlsList()
        .then((result) => {
            res.send(result);
        })
        .catch((error) => {
            res.send(error);
        });
        // let stmt = db.prepare(constDb.SELECT_ALL, (error) => {
        //     let rows = [];

        //     stmt.each((error, row) => {
        //         rows.push(row);
        //     }).finalize(() => {
        //         res.send(rows);
        //     });
        // });
    } else {
        res.send('parameter url is not found\n');
    }
});

app.post('/', (req, res) => {
    let data = buildData(req.body);

    constDb.insert(data)
    .then((result) => {
        res.send('added ' + result.$tag);
    })
    .catch((error) => {
        res.send(error);
    });
});

app.get('/:tag', (req, res) => {
    constDb.getUrl(req.params.tag)
    .then((result) => {
        res.send(result);
    })
    .catch((error) => {
        res.send(error);
    });
    // db.serialize(() => {
    //     let params = {
    //         $tag: req.params.tag
    //     }

    //     let stmt = db.prepare(constDb.SELECT, params, (error) => {
    //         let url = undefined;

    //         stmt.each((error, row) => {
    //             url = row.url;
    //         }).finalize(() => {
    //             if (url) {
    //                 res.redirect(url);
    //             } else {
    //                 res.send('tag is not supported');
    //             }
    //         });
    //     });
    // });
});

function generateTag(params, attempts = 10) {
    let allowUserTag = params.tag/* && your autythication conditions*/;
    let tag;

    if (allowUserTag) {
        tag = params.tag;
    }

    tag = tag || Math.random().toString(36).substring(2, 15);

    if (constDb.existTag(tag)) {
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

// function existTag(tag) {
//     return false;
// }

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

// function insert(data) {
//     return new Promise((resolve, reject) => {
//         try {
//             let stmt = db.prepare(constDb.INSERT, data, (error) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     stmt.run()
//                     .finalize(() => {
//                         resolve(data);
//                     });
//                 }
//             });
//         } catch (error) {
//             reject(error);
//         }
//     });
// }