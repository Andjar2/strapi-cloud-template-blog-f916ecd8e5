// path: ./config/plugins.js

module.exports = ({ env }) => ({
  // Configuración del plugin de SEO (si lo tienes)
  seo: {
    enabled: true,
  },

  // ---

  // Configuración del plugin strapi-cache
  'strapi-cache': {
    enabled: true,
    config: {
      // **CORRECCIÓN AQUÍ: 'provider' debe ser una cadena**
      provider: 'memory', // O 'redis' si quieres usar Redis

      // **Y si el proveedor es 'redis', las opciones van a este nivel**
      // options: {
      //   host: env('REDIS_HOST', '127.0.0.1'),
      //   port: env('REDIS_PORT', 6379),
      //   password: env('REDIS_PASSWORD', null),
      //   db: env('REDIS_DB', 0),
      // },

      strategy: {
        contentType: {
          // Ejemplo: si tienes un Content Type que quieres que se cachee más tiempo o menos
          'api::article.article': {
             maxAge: 120000, // 2 minutos, sobrescribe la regla global si el endpoint es /api/articles
           },
        },
        routes: [
          {
            path: '/api/*',
            methods: ['GET'],
            maxAge: 600000, // 10 minutos
          },
          {
            path: '/graphql',
            methods: ['POST'],
            maxAge: 600000, // 10 minutos para GraphQL
          },
        ],
      },
      debug: env('STRAPI_CACHE_DEBUG', false),
    },
  },
});