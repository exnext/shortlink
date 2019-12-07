'use strict';

const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();

const constDb = require('./constDb');
 
const PORT = 8080;
const HOST = '0.0.0.0';
 
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
    db.serialize(function() {
        db.run(constDb.CREATE_TABLE);
     
        // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        // for (var i = 0; i < 10; i++) {
        //     stmt.run("Ipsum " + i);
        // }
        // stmt.finalize();
     
        // db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
        //     console.log(row.id + ": " + row.info);
        // });where TAG=${req.params.tag}
    });
}
 
app.get('/', (req, res) => {
    if (req.query.url) {
        let params = {
            $tag: generateTag(req.query),
            $url: req.query.url,
            $expire: null,
            $added: new Date()
        }       

        let stmt = db.prepare(constDb.INSERT, params, function(error) {
            stmt.run();
            stmt.finalize();
            // db.save();
        });   

        //var stmt = db.prepare(INSERT);
        //stmt.run(req.query.tag, req.query.url);
        // stmt.run(req.query.url);
        // stmt.finalize();
        res.send('Dodano ' + params.$tag);
    } else {
        res.send('Brak parametru url\n');
    }
});

app.get('/:tag', (req, res) => {
    db.serialize(function() {
        // db.each(`select URL from LINKS where TAG='${req.params.tag}' limit 1`, function(error, row) {
        //     res.send(row.URL);
        // });
        let params = {
            $tag: req.params.tag
        }
 
        let stmt = db.prepare(constDb.SELECT, params, function(error) {
            let url = '';
            stmt.each(function(error, row) {
                url = row.URL;
            });
 
            stmt.finalize();
            // res.send(url);
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