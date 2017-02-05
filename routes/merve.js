'use strict';

const express = require('express');
const path = require('path');

/**
 * Merve main router
 * @param app Injected instantiated express server app
 * @returns {object} Express Router
 */
module.exports = function (app) {
  let router = express.Router();

  /**
   * Performs a simple update
   * @param response
   */
  let performUpdateIfNeeded = function (response) {
    // No Update needed
    if (!response.update) {
      return;
    }

    // update route
    let update = response.update;

    Object.keys(update).forEach(k => {
      // Look for route, and update responses
      let currentUrl = Object.keys(app.merver.definition.routes).find(r => r === k);
      let route = currentUrl ? app.merver.definition.routes[currentUrl] : undefined;
      if (route) {
        console.log('WRITING', route);
        app.merver.definition.routes[currentUrl] = update[k];
      }
    });
  };

  /**
   * Mocks the API based on current YAML
   * @param req
   * @param res
   */
  let merve = function (req, res) {
    // Simulate http
    setTimeout(() => {
      if (!app.merver.definition) {
        return res.status(400).json({
          code: app.constants.CODE_MISSING_ARGUMENT,
          message: 'You have not setup merver yet. Please POST /_setup or /_setup/file'
        });
      }

      // On request find matching route
      let currentUrl = Object.keys(app.merver.definition.routes).find(r => r === req.baseUrl);
      let route = currentUrl ? app.merver.definition.routes[currentUrl] : undefined;

      // On request find matching redirection
      let currentRedirection = Object.keys(app.merver.definition.redirections).find(r => r === req.baseUrl);
      let redirection = currentRedirection ? app.merver.definition.redirections[currentRedirection] : undefined;

      if (redirection) {
          let query = Object.keys(req.query).map(function(key)
              return key + '=' + req.query[key];
          }).join('&');

          if(redirection.redirect_to) {
              return res.redirect(redirection.redirect_to + '?' + query);
          } else {
              return res.status(400).send('Your definition is missing the redirect_to attribute');
          }
      }

      // send back if not found
      if (!route) {
        return res.status(404).json({
          code: app.constants.CODE_NOT_FOUND,
          message: `Merver could not find ${currentUrl} in your definition`,
          definition: app.merver.definition
        });
      } else {
        let item = route[req.method];
        // Handle multiple responses
        if (item.response) {
          performUpdateIfNeeded(item);
          return res.status(item.status || 200).json(item.response);
        } else if (item.responses) {
          let currentResponse;

          for (let i = 0; i < item.responses.length; i++) {
            currentResponse = item.responses[i];

            // Check for iterations or infinite items for response looping
            if (!currentResponse.infinite && currentResponse.used && (!currentResponse.times || currentResponse.times === currentResponse.used)) {
              // currentResponse = undefined; // reset
              continue;
            }

            // break if okay to use
            currentResponse.used = currentResponse.used || 0;
            currentResponse.used++;
            break;
          }

          // Route response is found
          if (currentResponse) {
            performUpdateIfNeeded(currentResponse);
            return res.status(currentResponse.status || 200).json(currentResponse.response);
          } else {

            // Could not find the response
            return res.status(404).json({
              code: app.constants.CODE_NOT_FOUND,
              message: `Merver could not find ${req.baseUrl} in your definition with enough data`,
              definition: app.merver.definition
            });
          }
        } else {
          // Bad definition
          return res.status(400).json({
            code: app.constants.CODE_MISSING_ARGUMENT,
            message: `Your definition is missing the response|responses attribute on ${req.baseUrl}`
          });
        }
      }
    }, process.env.MERVER_TIMEOUT || 1000);
  };

  // Cycle through methods and merve
  [
    'post',
    'get',
    'patch',
    'put',
    'delete',
    'options'
  ].forEach(k => router[k]('', merve));

  return router;
};
