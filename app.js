/**
 *  Name: Hanyang Yu
 * Date: May 16, 2023
 * Section: CSE 154 AF
 */

'use strict';
const express = require('express');
const multer = require("multer");
const fs = require("fs").promises;
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(multer().none());
app.use(express.json());
const ERROR_CODE = 400;
const PORT_NUM = 8000;

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
      filename: "yipper.db",
      driver: sqlite3.Database
  });

  return db;
}

app.get('/yipper/yips', async(req, res) => {
  try {
    let db = await getDBConnection();
    let sql = req.query.search;
    let query;
    if(sql) {
      query = `SELECT id FROM yips WHERE yip LIKE '%${req.query.search}%' ORDER BY id`;
    } else {
      query = `SELECT id, name, yip, hashtag, likes, date FROM yips ORDER BY DATETIME(date) DESC`;
    }
    let result = await db.all(query);
    res.type('json').json(result);
  } catch (err) {
    res.status(500).send('An error occurred on the server. Try again later.');
  }
});

app.get('/yipper/user/:user', async(req, res) => {
  try {
    let db = await getDBConnection();
    let query = `SELECT name, yip, hashtag, date FROM yips WHERE name = ? ORDER BY DATETIME(date) DESC`;

    let result = await db.all(query);
    if (result.length == 0) {
      res.status(404).send('User does not exist.');
    } else {
      res.type('json').json(result);
    }
  } catch (err) {
    res.status(500).send('An error occurred on the server. Try again later.');
  }
});

app.post('/yipper/likes', async(req, res) => {
  try {
    let db = await getDBConnection();
    let sql = req.query.search
      ? `SELECT id FROM yips WHERE yip LIKE '%${req.query.search}%' ORDER BY id`
      : `SELECT id, name, yip, hashtag, likes, date FROM yips ORDER BY DATETIME(date) DESC`;

    db.all = util.promisify(db.all);
    const rows = await db.all(sql, []);
    res.json({yips: rows});
  } catch (err) {
    res.status(500).send('An error occurred on the server. Try again later.');
  }
});

app.post('/yipper/new', async(req, res) => {
  try {
    if (!req.body.name || !req.body.full) {
      res.status(400).send('Missing one or more of the required params.');
      return;
    }
    let db = await getDBConnection();
    let [yip, hashtag] = req.body.full.split(' #');
    let sql = `INSERT INTO yips (name, yip, hashtag, likes, date) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)`;

    db.run = util.promisify(db.run);
    await db.run(sql, [req.body.name, yip, hashtag]);

    db.get = util.promisify(db.get);
    const row = await db.get(`SELECT * FROM yips WHERE id = ?`, db.lastID);
    res.json(row);
  } catch (err) {
    res.status(500).send('An error occurred on the server. Try again later.');
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);
