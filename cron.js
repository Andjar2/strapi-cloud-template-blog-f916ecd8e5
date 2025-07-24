"use strict";

module.exports = {
  /**
   * Tarea cron que se ejecuta cada hora.
   */
  '0 * * * *': async ({ strapi }) => {
    // Llama directamente a la lógica del controlador
    try {
        console.log("Ejecutando tarea cron de scraping...");
        await strapi.controller('api::articulos-externos.custom').triggerScrape({});
    } catch(err) {
        console.error("Error en la tarea cron de scraping:", err);
    }
  },
};
