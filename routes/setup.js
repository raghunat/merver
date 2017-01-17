'use strict';

const express = require('express');
const fs = require('fs');
const YAML = require('yamljs');
const utils = require('../utils');

/**
 * Setup express router
 * @param app inject app instance
 * @returns {object} Express Router
 */
module.exports = function(app) {
  let router = express.Router();

  /**
   * Load data to serve via POST Body
   */
  router.post('/', (req, res) => {
    if (!req.body.YAML) {
      return res.status(400).json({
        code: app.constants.CODE_MISSING_ARGUMENT,
        message: 'You are missing the YAML body key'
      })
    }
    try {
      // setup merver
      app.merver.rawYAML = req.body.YAML;
      app.merver.definition = YAML.parse(req.body.YAML);

      // Validate definition, will throw for an invalid definition
      utils.validateMerverDefinition(app.merver.definition);

      // Send back def
      return res.json({
        status: 'OK',
        merver: app.merver
      });
    } catch (err) {
      return res.status(400).json({
        code: app.constants.CODE_BAD_YAML,
        message: 'There was an error parsing your YAML',
        err: err.toString()
      });
    }
  });

  /**
   * Load Data to server via file
   */
  router.post('/file', (req, res) => {
    if (!req.body.path) {
      return res.status(400).json({
        code: app.constants.CODE_MISSING_ARGUMENT,
        message: 'You are missing the path body key'
      })
    }

    // read file from disc
    fs.readFile(req.body.path, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({
          code: app.constants.CODE_SERVER_ERROR,
          message: 'An error occurred trying to read your YAML file',
          err: err.toString()
        });
      }

      try {
        // setup merver
        app.merver.rawYAML = data;
        app.merver.definition = YAML.parse(data);

        // Send back def
        return res.json({
          status: 'OK',
          merver: app.merver
        });
      } catch (err) {
        return res.status(400).json({
          code: app.constants.CODE_BAD_YAML,
          message: 'There was an error parsing your YAML',
          err: err.toString()
        });
      }
    });
  });

  return router;
};