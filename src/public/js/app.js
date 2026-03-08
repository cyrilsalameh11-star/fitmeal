/**
 * FitMeal — Frontend Application
 * Handles form submission, API calls, card rendering, swap, and shopping list.
 */

// ── DOM References ──────────────────────────────────────────────────────────
const form = document.getElementById('mealForm');
const submitBtn = document.getElementById('submitBtn');
const formError = document.getElementById('formError');
const resultsSection = document.getElementById('resultsSection');
const formCard = document.getElementById('formCard');
const mealsGrid = document.getElementById('mealsGrid');
const resultsMeta = document.getElementById('resultsMeta');
const searchAgainBtn = document.getElementById('searchAgainBtn');
const shopModal = document.getElementById('shopModal');
const shopModalBody = document.getElementById('shopModalBody');
const shopModalClose = document.getElementById('shopModalClose');
const skeletonTemplate = document.getElementById('skeletonTemplate');

// ── State ───────────────────────────────────────────────────────────────────
let currentMeals = [];      // Array of currently shown meal objects
let calorieTarget = 0;
let proteinTarget = 0;
let mealType = 'dinner';

// ── Helpers ─────────────────────────────────────────────────────────────────

function showError(msg) {
  formError.textContent = msg;
  formError.classList.remove('hidden');
}

function clearError() {
  formError.textContent = '';
  formError.classList.add('hidden');
}

function setLoading(on) {
  submitBtn.disabled = on;
  const icon = submitBtn.querySelector('.btn-icon');
  const text = submitBtn.querySelector('.btn-text');
  if (on) {
    icon.textContent = '↻';
    icon.style.animation = 'spin 1s linear infinite';
    icon.style.display = 'inline-block';
    text.textContent = 'Recherche en cours…';
  } else {
    icon.textContent = '→';
    icon.style.animation = '';
    text.textContent = 'Trouver mes repas';
  }
}

// ── Source badge helpers ────────────────────────────────────────────────────

const SOURCE_META = {
  restaurant: { label: '🍔 Restaurant', cls: 'source-restaurant' },
  supermarket: { label: '🏪 Supermarché', cls: 'source-supermarket' },
  usda:        { label: '🇺🇸 USDA', cls: 'source-usda' },
};

function getSourceMeta(source) {
  return SOURCE_META[source] || SOURCE_META.restaurant;
}

// ── Macro bar renderer ──────────────────────────────────────────────────────

/**
 * Returns width % relative to calorie total split across macros.
 */
function macroPercent(value, max) {
  if (!max) return 0;
  return Math.min(100, Math.round((value / max) * 100));
}

function renderMacroBar(label, value, unit, max, colorClass) {
  const pct = macroPercent(value, max);
  return `
    <div class="macro-bar-row">
      <span class="macro-bar-label">${label}</span>
      <div class="macro-bar-track" role="progressbar" aria-valuenow="${value}" aria-valuemax="${max}" aria-label="${label}">
        <div class="macro-bar-fill ${colorClass}" style="width: ${pct}%"></div>
      </div>
      <span class="macro-bar-pct">${value}${unit}</span>
    </div>
  `;
}

// ── Meal card template ──────────────────────────────────────────────────────

function renderMealCard(meal, index) {
  const sm = getSourceMeta(meal.source);
  const maxCal = Math.max(calorieTarget * 1.4, meal.calories);
  const maxProt = Math.max(proteinTarget * 1.4, meal.protein);
  const maxCarb = Math.max(80, meal.carbs);
  const maxFat  = Math.max(40, meal.fat);

  const hasShoppingList = meal.source !== 'restaurant' && meal.shoppingItems?.length > 0;

  const card = document.createElement('div');
  card.className = 'meal-card';
  card.dataset.mealId = meal.id;
  card.style.animationDelay = `${index * 0.08}s`;

  card.innerHTML = `
    <div class="card-header">
      <div class="card-title-block">
        <span class="card-source-badge ${sm.cls}">${sm.label}</span>
        <div class="card-name">${escapeHtml(meal.name)}</div>
        <div class="card-brand">${escapeHtml(meal.brand || '')}</div>
      </div>
      <button
        class="btn-swap"
        id="swap-${meal.id}"
        aria-label="Remplacer ce repas"
        title="Ne pas aimer ce repas"
      >🔄 Swap</button>
    </div>

    <div class="macro-chips">
      <div class="macro-chip cal">
        <span class="macro-value">${meal.calories}</span>
        <span class="macro-label">Calories</span>
      </div>
      <div class="macro-chip prot">
        <span class="macro-value">${meal.protein}g</span>
        <span class="macro-label">Protéines</span>
      </div>
      <div class="macro-chip carb">
        <span class="macro-value">${meal.carbs}g</span>
        <span class="macro-label">Glucides</span>
      </div>
      <div class="macro-chip fat">
        <span class="macro-value">${meal.fat}g</span>
        <span class="macro-label">Lipides</span>
      </div>
    </div>

    <div class="macro-bars">
      ${renderMacroBar('Calories', meal.calories, 'kcal', maxCal, 'cal')}
      ${renderMacroBar('Protéines', meal.protein, 'g', maxProt, 'prot')}
      ${renderMacroBar('Glucides', meal.carbs, 'g', maxCarb, 'carb')}
      ${renderMacroBar('Lipides', meal.fat, 'g', maxFat, 'fat')}
    </div>

    ${hasShoppingList ? `
    <div class="card-actions">
      <button class="btn-shop" id="shop-${meal.id}" aria-label="Voir la liste de courses">
        🛒 Liste de courses
      </button>
    </div>
    ` : ''}
  `;

  // Wire swap button
  card.querySelector(`#swap-${meal.id}`).addEventListener('click', () => swapMeal(meal.id, card));

  // Wire shopping list button
  if (hasShoppingList) {
    card.querySelector(`#shop-${meal.id}`).addEventListener('click', () => openShopModal(meal));
  }

  return card;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Skeleton loaders ────────────────────────────────────────────────────────

function showSkeletons() {
  mealsGrid.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const clone = skeletonTemplate.content.cloneNode(true);
    mealsGrid.appendChild(clone);
  }
}

// ── API Calls ───────────────────────────────────────────────────────────────

async function fetchSuggestions(cal, prot, type) {
  const res = await fetch('/api/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calorieTarget: cal, proteinTarget: prot, mealType: type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(err.error || 'Erreur lors de la requête');
  }
  return res.json();
}

async function fetchSwap(excludeIds) {
  const res = await fetch('/api/swap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      calorieTarget,
      proteinTarget,
      mealType,
      excludeIds,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Aucune alternative trouvée' }));
    throw new Error(err.error);
  }
  return res.json();
}

// ── Main flow ───────────────────────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const calInput = document.getElementById('calorieTarget');
  const protInput = document.getElementById('proteinTarget');
  const typeInput = document.querySelector('input[name="mealType"]:checked');

  // Validate
  const cal = Number(calInput.value);
  const prot = Number(protInput.value);
  const type = typeInput?.value || '';

  calInput.classList.remove('error');
  protInput.classList.remove('error');

  if (!cal || cal < 50 || cal > 3000) {
    calInput.classList.add('error');
    showError('Entrez un objectif calorique entre 50 et 3000 kcal.');
    return;
  }
  if (!prot || prot < 1 || prot > 300) {
    protInput.classList.add('error');
    showError('Entrez un objectif protéique entre 1 et 300 g.');
    return;
  }

  // Store state
  calorieTarget = cal;
  proteinTarget = prot;
  mealType = type;

  // Show results section with skeletons
  formCard.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  showSkeletons();
  setLoading(true);

  try {
    const data = await fetchSuggestions(cal, prot, type);
    currentMeals = data.meals || [];

    mealsGrid.innerHTML = '';

    if (!currentMeals.length) {
      mealsGrid.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding: 40px 0">
        Aucun repas trouvé. Essayez d'ajuster vos objectifs.
      </p>`;
    } else {
      currentMeals.forEach((meal, i) => {
        mealsGrid.appendChild(renderMealCard(meal, i));
      });
    }

    // Trigger bar animations after a frame
    requestAnimationFrame(() => {
      const fills = mealsGrid.querySelectorAll('.macro-bar-fill');
      fills.forEach((el) => {
        const width = el.style.width;
        el.style.width = '0%';
        requestAnimationFrame(() => { el.style.width = width; });
      });
    });

    const mealTypeLabel = { lunch: 'Déjeuner', dinner: 'Dîner', snack: 'Snack' };
    resultsMeta.textContent = `${mealTypeLabel[type] || type} — Objectif ${cal} kcal / ${prot}g de protéines`;

  } catch (err) {
    mealsGrid.innerHTML = '';
    resultsSection.classList.add('hidden');
    formCard.classList.remove('hidden');
    showError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
  } finally {
    setLoading(false);
  }
});

// ── Swap ────────────────────────────────────────────────────────────────────

async function swapMeal(mealId, cardEl) {
  const swapBtn = cardEl.querySelector(`#swap-${mealId}`);
  swapBtn.disabled = true;
  swapBtn.textContent = '⏳';

  try {
    const excludeIds = currentMeals.map((m) => m.id);
    const data = await fetchSwap(excludeIds);
    const newMeal = data.meal;

    // Replace in state
    const idx = currentMeals.findIndex((m) => m.id === mealId);
    if (idx !== -1) currentMeals[idx] = newMeal;

    // Replace DOM card with animation
    const newCard = renderMealCard(newMeal, idx);
    newCard.style.animation = 'fadeUp 0.3s ease both';
    cardEl.replaceWith(newCard);
  } catch (err) {
    swapBtn.disabled = false;
    swapBtn.textContent = '🔄 Swap';
    alert(err.message || 'Impossible de trouver une alternative.');
  }
}

// ── Shopping List Modal ─────────────────────────────────────────────────────

function openShopModal(meal) {
  const items = meal.shoppingItems || [meal.name];
  shopModalBody.innerHTML = items.map((item) => `
    <div class="shop-item">
      <span class="shop-item-icon">✓</span>
      <span>${escapeHtml(item)}</span>
    </div>
  `).join('');

  // Add store hint
  if (meal.store) {
    shopModalBody.innerHTML += `
      <div class="shop-item" style="margin-top:12px; color:var(--text-muted)">
        <span class="shop-item-icon">🏪</span>
        <span>Disponible chez ${escapeHtml(meal.store)}</span>
      </div>
    `;
  }

  shopModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeShopModal() {
  shopModal.classList.add('hidden');
  document.body.style.overflow = '';
}

shopModalClose.addEventListener('click', closeShopModal);
shopModal.addEventListener('click', (e) => {
  if (e.target === shopModal) closeShopModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeShopModal();
});

// ── Search Again ────────────────────────────────────────────────────────────

searchAgainBtn.addEventListener('click', () => {
  resultsSection.classList.add('hidden');
  formCard.classList.remove('hidden');
  currentMeals = [];
  mealsGrid.innerHTML = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
