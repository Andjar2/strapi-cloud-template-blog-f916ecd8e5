module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articulos-externos/trigger-scrape',
      handler: 'custom.triggerScrape',
      config: {
        policies: [],
        auth: false, // Opcional: poner a `true` si quieres que sea una ruta protegida
      },
    },
  ],
};
