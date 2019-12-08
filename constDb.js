'use strict';

const FILE = `./shortlink.db`;

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS shortlink (
    tag TEXT CONSTRAINT constraint_name PRIMARY KEY,
    url TEXT,
    name TEXT,
    description TEXT,
    expire DATE,
    added DATE
)`;

// const INSERT = 'insert into LINKS values (?, ?)';
const INSERT = `INSERT INTO shortlink VALUES ($tag, $url, $name, $description, $expire, $added)`;
const SELECT = `SELECT * FROM shortlink WHERE tag=$tag LIMIT 1`;
const SELECT_ALL = `SELECT * FROM shortlink`;

module.exports = {
    FILE,
    CREATE_TABLE,
    INSERT,
    SELECT,
    SELECT_ALL
};