'use strict';

const FILE = `./shortlink.db`;

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS shortlink (
    tag TEXT,
    url TEXT,
    expire DATE,
    added DATE
)`;

// const INSERT = 'insert into LINKS values (?, ?)';
const INSERT = `INSERT INTO shortlink VALUES ($tag, $url, $expire, $added)`;
const SELECT = `SELECT url FROM shortlink WHERE tag=$tag LIMIT 1`;

module.exports = {
    FILE,
    CREATE_TABLE,
    INSERT,
    SELECT
};