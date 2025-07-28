// ruta: src/api/articulos-externo/content-types/articulos-externo/lifecycles.js

module.exports = {
  async beforeCreate(event) {
    console.log('--- Hook "beforeCreate" de ArticuloExterno activado ---');
    await assignCategoriesBasedOnContent(event);
  },

  async beforeUpdate(event) {
    console.log('--- Hook "beforeUpdate" de ArticuloExterno activado ---');
    await assignCategoriesBasedOnContent(event);
  },
};

/**
 * Función auxiliar para escanear el contenido y asignar múltiples categorías.
 * @param {object} event - El evento del ciclo de vida.
 */
const assignCategoriesBasedOnContent = async (event) => {
  const { data } = event.params;
  console.log('PASO 1: Datos iniciales que llegan al hook:', JSON.stringify(data, null, 2));

  // ¡IMPORTANTE! Revisa si el nombre de tu campo de relación es 'categories'. Si no, cámbialo aquí.
  const RELATION_FIELD_NAME = 'categories';

  if (data.titulo || data.contenido) {
    try {
      const categories = await strapi.entityService.findMany('api::category.category', {
        fields: ['id', 'name'],
      });

      if (!categories || categories.length === 0) {
        console.log("ADVERTENCIA: No se encontraron categorías en la base de datos.");
        return;
      }
      console.log('PASO 2: Se encontraron las siguientes categorías:', categories.map(c => c.name));

      const articleText = ((data.titulo || '') + ' ' + (data.contenido || '')).toLowerCase();
      console.log('PASO 3: Analizando el texto del artículo (primeros 150 caracteres):', articleText.substring(0, 150));

      const matchedCategoryIds = [];
      for (const category of categories) {
        if (articleText.includes(category.name.toLowerCase())) {
          matchedCategoryIds.push(category.id);
          console.log(`-> Coincidencia encontrada: '${category.name}' (ID: ${category.id})`);
        }
      }

      if (matchedCategoryIds.length > 0) {
        console.log(`PASO 4: IDs de categorías encontradas: [${matchedCategoryIds.join(', ')}]`);
        
        // Asignamos el array de IDs al campo correcto.
        data[RELATION_FIELD_NAME] = matchedCategoryIds;

      } else {
        console.log('PASO 4: No se encontró ninguna coincidencia de categoría en el texto.');
      }
      
      console.log('PASO 5: Datos finales que se enviarán para guardar:', JSON.stringify(data, null, 2));

    } catch (e) {
      console.error("ERROR CRÍTICO en el lifecycle hook:", e);
    }
  }
};
