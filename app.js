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

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(multer().none());
app.use(express.json());
const ERROR_CODE = 400;
const SERVER_ERROR_CODE = 500;
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

// GET endpoint for retrieving all yips or yips that match a search query
app.get('/yipper/yips', async(req, res) => {
  try {
    let db = await getDBConnection();
    let query;
    if(req.query.search) {
      query = `SELECT id FROM yips WHERE yip LIKE '%${req.query.search}%' ORDER BY id`;
    } else {
      query = `SELECT id, name, yip, hashtag, likes, date FROM yips ORDER BY DATETIME(date) DESC`;
    }
    let result = await db.all(query);
    res.type('json').json(result);
  } catch (err) {
    res.status(SERVER_ERROR_CODE).send('An error occurred on the server. Try again later.');
  }
});

// GET endpoint for retrieving yips from a specific user
app.get('/yipper/user/:user', async(req, res) => {
  try {
    let user = req.params.user;
    let db = await getDBConnection();
    let query = `SELECT name, yip, hashtag, date
    FROM yips WHERE name = '${user}' ORDER BY DATETIME(date) DESC`;
    let result = await db.all(query);
    if (result.length == 0) {
      res.status(ERROR_CODE).send('User does not exist.');
    } else {
      res.type('json').json(result);
    }
  } catch (err) {
    res.status(SERVER_ERROR_CODE).send('An error occurred on the server. Try again later.');
  }
});

// POST endpoint for liking a yip
app.post('/yipper/likes', async(req, res) => {
  try {
    if (!req.body.id) {
      res.status(ERROR_CODE).send('Missing id.');
      return;
    }
    let id = req.body.id;
    let db = await getDBConnection();
    console.log("Before running SQL");
    let sql = `UPDATE yips SET likes = likes + 1 WHERE id = ?`;
    await db.run(sql, [id]);
    let row = await db.get(`SELECT * FROM yips WHERE id = ?`, id);
    res.type('text').send(String(row.likes));
    console.log(row);
  } catch (err) {
    res.status(SERVER_ERROR_CODE).send('An error occurred on the server. Try again later.');
  }
});

// POST endpoint for creating a new yip
app.post('/yipper/new', async(req, res) => {
  try {
    if (!req.body.name || !req.body.full) {
      res.status(ERROR_CODE).send('Missing one or more of the required params.');
      return;
    }
    let db = await getDBConnection();
    let [yip, hashtag] = req.body.full.split(' #');
    let sql = `INSERT INTO yips (name, yip, hashtag, likes, date) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)`;
    let results = await db.run(sql, [req.body.name, yip, hashtag]);
    let id = results.lastID;
    let row = await db.get(`SELECT * FROM yips WHERE id = ?`, id);
    res.type('json').json(row);
  } catch (err) {
    res.status(SERVER_ERROR_CODE).send('An error occurred on the server. Try again later.');
  }
});

// Serves static files from the public directory
app.use(express.static('public'));
const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);
