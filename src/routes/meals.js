/**
 * Meal suggestion API routes
 */
const express = require('express');
const axios = require('axios');
const { getSuggestions } = require('../services/mealSuggester');

const router = express.Router();

/**
 * POST /api/suggestions
 * Body: { calorieTarget: number, proteinTarget: number, mealType: string }
 * Returns: { meals: MealSuggestion[] }
 */
router.post('/suggestions', async (req, res) => {
  try {
    const { calorieTarget, proteinTarget, mealType, country = 'France', dietary = [], brand = '' } = req.body;

    // Validation
    if (!calorieTarget || !mealType) {
      return res.status(400).json({ error: 'calorieTarget and mealType are required.' });
    }
    if (mealType !== 'dessert' && !proteinTarget) {
      return res.status(400).json({ error: 'proteinTarget is required for non-desserts.' });
    }
    if (!['lunch', 'dinner', 'snack', 'dessert'].includes(mealType)) {
      return res.status(400).json({ error: 'mealType invalid.' });
    }
    const cal = Number(calorieTarget);
    const prot = mealType === 'dessert' ? 0 : Number(proteinTarget);

    if (isNaN(cal) || cal < 50 || cal > 3000) {
      return res.status(400).json({ error: 'calorieTarget must be between 50 and 3000.' });
    }
    if (mealType !== 'dessert' && (isNaN(prot) || prot < 1 || prot > 300)) {
      return res.status(400).json({ error: 'proteinTarget must be between 1 and 300g.' });
    }

    const suggestions = await getSuggestions({
      calorieTarget: cal,
      proteinTarget: prot,
      mealType,
      country,
      dietary,
      brand,
    });

    res.json({ suggestions });
  } catch (err) {
    console.error('[/api/suggestions] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch meal suggestions. Please try again.' });
  }
});

/**
 * POST /api/swap
 * Body: { calorieTarget, proteinTarget, mealType, excludeIds: string[] }
 * Returns a single alternative meal
 */
router.post('/swap', async (req, res) => {
  try {
    const { calorieTarget, proteinTarget, mealType, excludeIds = [], country = 'France', dietary = [], brand = '' } = req.body;

    if (!calorieTarget || !mealType) {
      return res.status(400).json({ error: 'calorieTarget and mealType are required.' });
    }

    const meals = await getSuggestions({
      calorieTarget: Number(calorieTarget),
      proteinTarget: mealType === 'dessert' ? 0 : Number(proteinTarget),
      mealType,
      country,
      dietary,
      excludeIds: Array.isArray(excludeIds) ? excludeIds : [],
      count: 1,
    });

    if (!meals.length) {
      return res.status(404).json({ error: 'No alternative meals found. Try adjusting your targets.' });
    }

    res.json({ meal: meals[0] });
  } catch (err) {
    console.error('[/api/swap] Error:', err.message);
    res.status(500).json({ error: 'Failed to swap meal. Please try again.' });
  }
});

/**
 * GET /api/restaurants
 * Returns: { meals: array of all restaurant items }
 */
router.get('/restaurants', (req, res) => {
  try {
    const restaurantMeals = require('../data/restaurants');
    res.json({ meals: restaurantMeals });
  } catch (err) {
    console.error('[/api/restaurants] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch restaurant data.' });
  }
});

/**
 * GET /api/supermarkets
 * Returns: { meals: array of all curated supermarket items }
 */
router.get('/supermarkets', (req, res) => {
  try {
    const supermarketMeals = require('../data/supermarkets');
    res.json({ meals: supermarketMeals });
  } catch (err) {
    console.error('[/api/supermarkets] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch supermarket data.' });
  }
});

/**
 * GET /api/barcode/:code
 * Looks up a product by barcode using Open Food Facts.
 * Returns nutritional info in the same shape as analyze-food results.
 */
router.get('/barcode/:code', async (req, res) => {
  const { code } = req.params;
  if (!/^\d{8,14}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid barcode format.' });
  }
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      { timeout: 6000 }
    );
    const { status, product } = response.data;
    if (status !== 1 || !product) {
      return res.status(404).json({ error: 'Product not found. Try scanning again or enter manually.' });
    }
    const n = product.nutriments || {};
    const cal100  = Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0);
    const prot100 = Math.round(n.proteins_100g || n.proteins || 0);
    const carb100 = Math.round(n.carbohydrates_100g || n.carbohydrates || 0);
    const fat100  = Math.round(n.fat_100g || n.fat || 0);

    if (!cal100) {
      return res.status(404).json({ error: 'No nutritional data found for this product.' });
    }

    const name       = product.product_name || product.product_name_en || 'Unknown Product';
    const brandStr   = (product.brands || '').split(',')[0].trim();
    const servingQty = parseFloat(product.serving_quantity) || null;
    const packageQty = parseFloat(product.product_quantity) || null;

    // Per-serving nutrition (one unit / one portion)
    let perServing = null;
    if (servingQty && servingQty > 0 && (!packageQty || servingQty < packageQty)) {
      perServing = {
        calories: Math.round(cal100 * servingQty / 100),
        protein:  Math.round(prot100 * servingQty / 100),
        carbs:    Math.round(carb100 * servingQty / 100),
        fat:      Math.round(fat100  * servingQty / 100),
        label:    product.serving_size || `${servingQty}g`,
      };
    }

    // Per-package nutrition (whole bag/box)
    let perPackage = null;
    if (packageQty && packageQty > 0) {
      perPackage = {
        calories: Math.round(cal100 * packageQty / 100),
        protein:  Math.round(prot100 * packageQty / 100),
        carbs:    Math.round(carb100 * packageQty / 100),
        fat:      Math.round(fat100  * packageQty / 100),
        label:    product.quantity || `${packageQty}g`,
      };
    }

    // Default displayed values: per serving if available, else per 100g
    const defaultBase = perServing || { calories: cal100, protein: prot100, carbs: carb100, fat: fat100 };

    res.json({
      dish:        brandStr ? `${name} — ${brandStr}` : name,
      calories:    defaultBase.calories,
      protein:     defaultBase.protein,
      carbs:       defaultBase.carbs,
      fat:         defaultBase.fat,
      servingSize: perServing?.label || 'per 100g',
      confidence:  'high',
      items:       [],
      tip:         null,
      perServing,
      perPackage,
    });
  } catch (err) {
    console.error('[/api/barcode] Error:', err.message);
    res.status(500).json({ error: 'Failed to look up product. Please try again.' });
  }
});

// POST /api/progress/analyze — compare two progress photos with Gemini Vision
router.post('/progress/analyze', async (req, res) => {
  const { image1, image2 } = req.body;
  if (!image1 || !image2) return res.status(400).json({ error: 'Two images required.' });

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI analysis not configured.' });

  const toBase64 = d => d.split(',')[1];
  const toMime   = d => d.split(';')[0].split(':')[1] || 'image/jpeg';

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const resp = await axios.post(url, {
      contents: [{
        parts: [
          { inline_data: { mime_type: toMime(image1), data: toBase64(image1) } },
          { inline_data: { mime_type: toMime(image2), data: toBase64(image2) } },
          { text: `These are two fitness progress photos. The first is older, the second is more recent. Analyze the visible physical changes between them. Be specific, encouraging, and professional. Focus on body composition, posture, muscle definition, and overall transformation. Write 3–5 sentences. Ignore clothing and background.` }
        ]
      }],
      generationConfig: { maxOutputTokens: 320, temperature: 0.7 }
    });
    const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available.';
    res.json({ analysis: text });
  } catch (err) {
    console.error('[/api/progress/analyze]', err.response?.data || err.message);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

module.exports = router;
