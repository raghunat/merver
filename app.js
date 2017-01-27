'use strict';

const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const md = require('marked');
const bodyParser = require('body-parser');

// Instantiate app
const app = express();

// Read Readme
const readme = md(fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8'));

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream('access.log', {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}))
app.use(morgan('dev'));

// for parsing application/json or application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Send Instructions
app.get('/', function(req, res) {
  res.send(
    `<div class="markdown-body">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.4.1/github-markdown.css" rel="stylesheet">
      ${readme}
    </div>`);
});

// Load Constants to pass through
app.constants = require(path.join(__dirname, 'constants'));

// setup "global" holder
app.merver = {
  rawYAML: undefined,
  definition: undefined
};

// load API routes
app.use('/_setup', require(path.join(__dirname, 'routes', 'setup'))(app));
app.get('/_merver', (req, res) => res.json(app.merver));
app.use('*', require(path.join(__dirname, 'routes', 'merve'))(app));

module.exports = app;
