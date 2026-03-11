/**
 * Meal suggestion API routes
 */
const express = require('express');
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

module.exports = router;
