"use strict";
const axios = require('axios');
const cheerio = require('cheerio'); // Lo mantenemos por si añades fuentes de scraping

// --- FUENTES AÑADIDAS AQUÍ ---
const sources = [
    {
        name: 'FutbolHoy.co (API)',
        type: 'api',
        // _embed incluye datos como la imagen destacada en la misma petición
        url: 'https://futbolhoy.co/wp-json/wp/v2/posts?_embed&per_page=10' 
    },
    {
        name: 'Futbolete.com (API)',
        type: 'api',
        url: 'https://futbolete.com/wp-json/wp/v2/posts?_embed&per_page=10'
    }
];

/**
 * Mapea los datos de un post de la API de WordPress a nuestro Content-Type "ArticuloExterno".
 * @param {object} post - El objeto del post de la API de WordPress.
 * @param {string} sourceName - El nombre de la fuente (ej. "Futbolete.com (API)").
 * @returns {object} - Un objeto listo para ser guardado en Strapi.
 */
const mapWordpressPost = (post, sourceName) => {
    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
    const cleanSourceName = sourceName.replace('(API)', '').trim();

    return {
        titulo: post.title.rendered,
        contenido: post.content.rendered,
        url_original: post.link,
        nombre_fuente: cleanSourceName,
        date_published: post.date, 
        url_imagen_cover: imageUrl,
        publishedAt: new Date(), // Publica el artículo en Strapi inmediatamente
    };
}

module.exports = {
  async triggerScrape(ctx) {
    console.log("Iniciando proceso de obtención de artículos...");
    let newArticlesCount = 0;

    for (const source of sources) {
        console.log(`Procesando fuente: ${source.name}`);
        try {
            if (source.type === 'api') {
                const response = await axios.get(source.url);
                const posts = response.data;

                for (const post of posts) {
                    // Verificamos si ya existe un artículo con la misma URL original para no duplicar
                    const existing = await strapi.service('api::articulo-externo.articulo-externo').find({
                        filters: { url_original: post.link }
                    });

                    if (existing.results.length === 0) {
                        // Pasamos el post y el nombre de la fuente a la función de mapeo
                        const mappedPost = mapWordpressPost(post, source.name);
                        
                        await strapi.entityService.create('api::articulo-externo.articulo-externo', {
                            data: mappedPost,
                        });
                        newArticlesCount++;
                        console.log(`-> Nuevo artículo de [${mappedPost.nombre_fuente}] guardado: ${mappedPost.titulo}`);
                    }
                }
            }
            // Aquí se mantiene la lógica de scraping por si se necesita en el futuro
        } catch (error) {
            // Manejo de errores mejorado para dar más detalles
            const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
            console.error(`Error procesando la fuente ${source.name}:`, errorMessage);
        }
    }
    return { message: `Proceso completado. Se agregaron ${newArticlesCount} artículos nuevos.` };
  }
};
