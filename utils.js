'use strict';

module.exports = {

  /**
   * Check for Merver definition constructs
   * @param definition Object converted from YAML input
   */
  validateMerverDefinition: function(definition) {
    if (!definition) {
      throw new Error('No definition specified');
    }

    if (!definition.routes) {
      throw new Error('No routes specified');
    }

    Object.keys(definition.routes).forEach(key => {
      let route = definition.routes[key];
      Object.keys(route).forEach(m => {
        let method = route[m];
        console.log(method);
        if (!method.response && !method.responses) {
          throw new Error(`No response|responses found for ${key}`);
        }
      });
    });
  }
}
