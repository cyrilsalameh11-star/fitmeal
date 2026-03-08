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
    const { calorieTarget, proteinTarget, mealType } = req.body;

    // Validation
    if (!calorieTarget || !proteinTarget || !mealType) {
      return res.status(400).json({ error: 'calorieTarget, proteinTarget, and mealType are required.' });
    }
    if (!['lunch', 'dinner', 'snack'].includes(mealType)) {
      return res.status(400).json({ error: 'mealType must be lunch, dinner, or snack.' });
    }
    const cal = Number(calorieTarget);
    const prot = Number(proteinTarget);
    if (isNaN(cal) || cal < 50 || cal > 3000) {
      return res.status(400).json({ error: 'calorieTarget must be between 50 and 3000.' });
    }
    if (isNaN(prot) || prot < 1 || prot > 300) {
      return res.status(400).json({ error: 'proteinTarget must be between 1 and 300g.' });
    }

    const meals = await getSuggestions({
      calorieTarget: cal,
      proteinTarget: prot,
      mealType,
      count: 3,
    });

    res.json({ meals });
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
    const { calorieTarget, proteinTarget, mealType, excludeIds = [] } = req.body;

    if (!calorieTarget || !proteinTarget || !mealType) {
      return res.status(400).json({ error: 'calorieTarget, proteinTarget, and mealType are required.' });
    }

    const meals = await getSuggestions({
      calorieTarget: Number(calorieTarget),
      proteinTarget: Number(proteinTarget),
      mealType,
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

module.exports = router;
