'use strict';

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const FILE = `./shortlink.db`;

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS shortlink (
    tag TEXT CONSTRAINT constraint_name PRIMARY KEY,
    url TEXT,
    name TEXT,
    description TEXT,
    expire DATE,
    added DATE
)`;

const INSERT = `INSERT INTO shortlink VALUES ($tag, $url, $name, $description, $expire, $added)`;
const SELECT = `SELECT * FROM shortlink WHERE tag=$tag LIMIT 1`;
const SELECT_ALL = `SELECT * FROM shortlink`;

fs.closeSync(fs.openSync(FILE, 'a'));

let db;

function init() {
    return new Promise((resolve, reject) => {
        try {
            db = new sqlite3.Database(FILE, sqlite3.OPEN_READWRITE, (error) => {
                if (error) {
                    reject(error);
                } {
                    db.serialize(() => {
                        db.run(CREATE_TABLE);
                        resolve();
                    });
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function insert(data) {
    return new Promise((resolve, reject) => {
        try {
            let stmt = db.prepare(INSERT, data, (error) => {
                if (error) {
                    reject(error);
                } else {
                    stmt.run()
                        .finalize(() => {
                            resolve(data);
                        });
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getUrl(tag) {
    return new Promise((resolve, reject) => {
        try {
            db.serialize(() => {
                let params = {
                    $tag: tag
                }
    
                let stmt = db.prepare(SELECT, params, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        let url = undefined;
    
                        stmt.each((error, row) => {
                            if (error) {
                                reject(error);
                            } else {
                                url = row;
                            }
                        }).finalize(() => {
                            if (url) {
                                resolve(url);
                            } else {
                                reject('tag is not supported');
                            }
                        });
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getUrlsList() {
    return new Promise((resolve, reject) => {
        try {
            let stmt = db.prepare(SELECT_ALL, (error) => {
                if (error) {
                    reject(error);
                } else {
                    let rows = [];

                    stmt.each((error, row) => {
                        rows.push(row);
                    }).finalize(() => {
                        resolve(rows);
                    });
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function existTag(tag) {
    return false;
}

module.exports = {
    init,
    insert,
    getUrl,
    getUrlsList,
    existTag
}