'use strict';

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();

const constDb = require('./constDb');
 
const PORT = 8080;
const HOST = '0.0.0.0';

fs.closeSync(fs.openSync(constDb.FILE, 'w'));

let db = new sqlite3.Database(constDb.FILE, sqlite3.OPEN_READWRITE, (error) => {
    if (error) {
        console.error(error.message);
        return;
    }
 
    initDB();
 
    app.listen(PORT, HOST);
    console.log(`Running on http://${HOST}:${PORT}`);
});
 
function initDB() {
    db.serialize(() => {
        db.run(constDb.CREATE_TABLE);
    });
}
 
app.get('/', (req, res) => {
    if (req.query.url) {
        try {
            let params = {
                $tag: generateTag({}),
                $url: req.query.url,
                $name: null,
                $description: null,
                $expire: req.query.expire,
                $added: new Date()
            }       
    
            let stmt = db.prepare(constDb.INSERT, params, (error) => {
                stmt.run().finalize(() => {
                    res.send('added ' + params.$tag);
                });
            });  
        } catch (error) {
            res.send(error);
        }
    } else if (req.query.list) {
        let stmt = db.prepare(constDb.SELECT_ALL, (error) => {
            let rows = [];
            
            stmt.each((error, row) => {
                rows.push(row);
            }).finalize(() => {
                res.send(rows);
            });
        });
    } else {
        res.send('parameter url is not found\n');
    }
});

app.post('/', (req, res) => {

});

app.get('/:tag', (req, res) => {
    db.serialize(() => {
        let params = {
            $tag: req.params.tag
        }
 
        let stmt = db.prepare(constDb.SELECT, params, (error) => {
            let url = undefined;
            
            stmt.each((error, row) => {
                url = row.url;
            }).finalize(() => {
                if (url) {
                    res.redirect(url);
                } else {
                    res.send('tag is not supported');
                }
            });
        });
    });
});

function generateTag(params, attempts = 10) {
    let allowUserTag = params.tag/* && your autythication conditions*/;
    let tag;

    if (allowUserTag) {
        tag = params.tag;
    }

    tag = tag || Math.random().toString(36).substring(2, 15);

    if (existTag(tag)) {
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

function existTag(tag) {
    return false;
}