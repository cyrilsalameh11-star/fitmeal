/**
 * Curated hardcoded list of popular supermarket ready-meals for France, Spain, and Lebanon.
 * Values per serving/package as labeled.
 * Sources: product labels, Open Food Facts, brand websites (Mercadona, Spinneys).
 * source: "supermarket"
 */
const supermarketMeals = [

  // ═══════════════════════════════════════════════════════════════════════════
  // FRANCE (Carrefour & Monoprix)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'fr-crf-salade-poulet', name: 'Salade Poulet Crudités', brand: 'Carrefour', type: ['lunch', 'snack'], calories: 350, protein: 28, carbs: 18, fat: 18, source: 'supermarket', country: 'France', shoppingItems: ['Salade Poulet Crudités — Carrefour'] },
  { id: 'fr-crf-lasagnes', name: 'Lasagnes Bolognaise', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 430, protein: 24, carbs: 36, fat: 22, source: 'supermarket', country: 'France', shoppingItems: ['Lasagnes Bolognaise — Carrefour'] },
  { id: 'fr-mnp-bowl-saumon', name: 'Bowl Saumon Riz Complet', brand: 'Monoprix Bien Manger', type: ['lunch', 'dinner'], calories: 420, protein: 28, carbs: 42, fat: 16, source: 'supermarket', country: 'France', shoppingItems: ['Bowl Saumon Riz Complet — Monoprix'] },
  { id: 'fr-mnp-skyr-nature', name: 'Skyr Nature 0% (150g)', brand: 'Monoprix', type: ['snack'], calories: 90, protein: 14, carbs: 8, fat: 0, source: 'supermarket', country: 'France', shoppingItems: ['Skyr Nature — Monoprix'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPAIN (Mercadona "Listo para Comer")
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'es-mer-lentejas', name: 'Lentejas con Verduras (Listo para comer)', brand: 'Mercadona', type: ['lunch', 'dinner'], calories: 380, protein: 22, carbs: 48, fat: 12, source: 'supermarket', country: 'Spain', shoppingItems: ['Lentejas con Verduras 400g — Mercadona'] },
  { id: 'es-mer-pollo-curry', name: 'Pollo al Curry con Arroz', brand: 'Mercadona', type: ['lunch', 'dinner'], calories: 450, protein: 28, carbs: 55, fat: 14, source: 'supermarket', country: 'Spain', shoppingItems: ['Pollo al Curry con Arroz — Mercadona'] },
  { id: 'es-mer-salmon-verduras', name: 'Salmón con Verduras al Vapor', brand: 'Mercadona', type: ['lunch', 'dinner'], calories: 350, protein: 30, carbs: 12, fat: 20, source: 'supermarket', country: 'Spain', shoppingItems: ['Salmón con Verduras — Mercadona'] },
  { id: 'es-mer-gazpacho', name: 'Gazpacho Tradicional (500ml)', brand: 'Mercadona', type: ['lunch', 'snack'], calories: 220, protein: 5, carbs: 18, fat: 14, source: 'supermarket', country: 'Spain', shoppingItems: ['Gazpacho Tradicional 500ml — Mercadona'] },
  { id: 'es-mer-paella', name: 'Paella de Marisco (Ración)', brand: 'Mercadona', type: ['lunch', 'dinner'], calories: 420, protein: 18, carbs: 65, fat: 12, source: 'supermarket', country: 'Spain', shoppingItems: ['Paella de Marisco — Mercadona'] },
  { id: 'es-mer-tortilla', name: 'Tortilla de Patata con Cebolla', brand: 'Mercadona', type: ['lunch', 'snack'], calories: 510, protein: 14, carbs: 32, fat: 36, source: 'supermarket', country: 'Spain', shoppingItems: ['Tortilla de Patata — Mercadona'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEBANON (Spinneys Ready-to-Eat)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'lb-spi-grilled-chicken', name: 'Grilled Chicken Breast (Ready to eat)', brand: 'Spinneys', type: ['lunch', 'dinner'], calories: 330, protein: 52, carbs: 0, fat: 12, source: 'supermarket', country: 'Lebanon', shoppingItems: ['Spinneys Grilled Chicken Breast'] },
  { id: 'lb-spi-hummus-bowl', name: 'Hummus & Tahini Bowl (Large)', brand: 'Spinneys', type: ['lunch', 'snack'], calories: 420, protein: 18, carbs: 38, fat: 24, source: 'supermarket', country: 'Lebanon', shoppingItems: ['Spinneys Hummus Bowl'] },
  { id: 'lb-spi-quinoa-salad', name: 'Quinoa & Pomegranate Salad', brand: 'Spinneys', type: ['lunch', 'snack'], calories: 350, protein: 12, carbs: 45, fat: 14, source: 'supermarket', country: 'Lebanon', shoppingItems: ['Spinneys Quinoa Salad'] },
  { id: 'lb-spi-beef-shawarma', name: 'Beef Shawarma Ready Meal', brand: 'Spinneys', type: ['lunch', 'dinner'], calories: 520, protein: 38, carbs: 42, fat: 22, source: 'supermarket', country: 'Lebanon', shoppingItems: ['Spinneys Beef Shawarma Platter'] },
  { id: 'lb-spi-lentil-soup', name: 'Lebanese Lentil Soup (Shorbat Adas)', brand: 'Spinneys', type: ['lunch', 'snack'], calories: 210, protein: 11, carbs: 32, fat: 6, source: 'supermarket', country: 'Lebanon', shoppingItems: ['Spinneys Lentil Soup'] },

];

module.exports = supermarketMeals;
