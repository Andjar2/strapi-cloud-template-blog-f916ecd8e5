'use strict';

/**
 * =================================================================
 * FUNCIÓN 1: GENERAR SLUG (CORREGIDA PARA ACENTOS Y CARACTERES ESPECIALES)
 * =================================================================
 */
const generateSlug = (event) => {
  const { data } = event.params;
  if (data.titulo) {
    console.log("-> Tarea 1: Generando slug a partir del título...");
    
    const normalizedTitle = data.titulo
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD') // Descompone los caracteres con tilde (ej: "é" -> "e" + "´")
      .replace(/[\u0300-\u036f]/g, ''); // Elimina los acentos y diacríticos

    data.slug = normalizedTitle
      .replace(/\s+/g, '-')       // Reemplaza espacios con -
      .replace(/[^\w\-]+/g, '')   // Elimina caracteres que no sean palabras, números o guiones
      .replace(/\-\-+/g, '-');    // Reemplaza múltiples guiones con uno solo
      
    console.log(`   Slug generado: ${data.slug}`);
  }
};

/**
 * =================================================================
 * FUNCIÓN 2: ASIGNAR CATEGORÍAS
 * =================================================================
 */
const assignCategoriesBasedOnContent = async (event) => {
    const { data } = event.params;
    console.log("-> Tarea 2: Asignando categorías...");
    const RELATION_FIELD_NAME = 'categories';

    if (data.titulo || data.contenido) {
        try {
            const categories = await strapi.entityService.findMany('api::category.category', {
                fields: ['id', 'name'],
            });

            if (!categories || categories.length === 0) {
                console.log("   ADVERTENCIA: No se encontraron categorías.");
                return;
            }

            const articleText = ((data.titulo || '') + ' ' + (data.contenido || '')).toLowerCase();
            const matchedCategoryIds = [];
            for (const category of categories) {
                // Normaliza también el nombre de la categoría para una comparación robusta
                const normalizedCategoryName = category.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (articleText.includes(normalizedCategoryName)) {
                    matchedCategoryIds.push(category.id);
                }
            }

            if (matchedCategoryIds.length > 0) {
                console.log(`   IDs de categorías encontradas: [${matchedCategoryIds.join(', ')}]`);
                data[RELATION_FIELD_NAME] = matchedCategoryIds;
            } else {
                console.log('   No se encontró ninguna coincidencia de categoría.');
            }
        } catch (e) {
            console.error("   ERROR CRÍTICO asignando categorías:", e);
        }
    }
};

/**
 * =================================================================
 * LIFECYCLE HOOKS PRINCIPALES
 * =================================================================
 */
module.exports = {
  async beforeCreate(event) {
    console.log('--- Hook "beforeCreate" activado ---');
    generateSlug(event);
    await assignCategoriesBasedOnContent(event);
    console.log('--- Hook "beforeCreate" finalizado ---');
  },

  async beforeUpdate(event) {
    console.log('--- Hook "beforeUpdate" activado ---');
    generateSlug(event);
    await assignCategoriesBasedOnContent(event);
    console.log('--- Hook "beforeUpdate" finalizado ---');
  },
};
