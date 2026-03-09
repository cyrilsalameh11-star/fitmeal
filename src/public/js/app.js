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

// Identity DOM
const identityOverlay = document.getElementById('identityOverlay');
const identityForm = document.getElementById('identityForm');
const userNameInput = document.getElementById('userNameInput');
const identityError = document.getElementById('identityError');
const mainApp = document.getElementById('mainApp');

// ── State ───────────────────────────────────────────────────────────────────
let currentMeals = [];      // Array of currently shown meal objects
let calorieTarget = 0;
let proteinTarget = 0;
let mealType = 'dinner';
let countrySelect = 'France';
let dietarySelect = 'none';

// ── Initialization ──────────────────────────────────────────────────────────
async function init() {
  const savedName = localStorage.getItem('fitmeal_user');
  if (savedName) {
    showApp(savedName);
  } else {
    // Just fetch count for the overlay if needed, but we'll do it in showApp
    refreshStats();
  }
}

async function refreshStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    document.getElementById('userCount').textContent = data.count.toLocaleString();
  } catch (err) {
    console.error('Failed to fetch user stats');
    document.getElementById('userCount').textContent = '0';
  }
}

function showApp(name) {
  identityOverlay.classList.add('hidden');
  mainApp.classList.remove('hidden');
  refreshStats();
  console.log(`Welcome back, ${name}`);
}

identityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = userNameInput.value.trim();
  if (name.length < 2) return;

  identityError.classList.add('hidden');
  const btn = document.getElementById('identitySubmitBtn');
  btn.disabled = true;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem('fitmeal_user', name);
      showApp(name);
    } else {
      identityError.textContent = data.error || 'Login failed';
      identityError.classList.remove('hidden');
    }
  } catch (err) {
    identityError.textContent = 'Server connection failed';
    identityError.classList.remove('hidden');
  } finally {
    btn.disabled = false;
  }
});

init();

// ── Dynamic UI ──────────────────────────────────────────────────────────────
document.querySelectorAll('input[name="mealType"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const protGroup = document.getElementById('proteinGroup');
    if (e.target.value === 'dessert') {
      protGroup.classList.add('hidden');
    } else {
      protGroup.classList.remove('hidden');
    }
  });
});

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
    text.textContent = 'Searching...';
  } else {
    icon.textContent = '→';
    icon.style.animation = '';
    text.textContent = 'Find my meals';
  }
}

// ── Source badge helpers ────────────────────────────────────────────────────

const SOURCE_META = {
  restaurant: { label: '🍔 Restaurant', cls: 'source-restaurant' },
  supermarket: { label: '🏪 Supermarket', cls: 'source-supermarket' },
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
        aria-label="Replace this meal"
        title="Don't like this meal?"
      >🔄 Swap</button>
    </div>

    <div class="macro-visuals">
      <div class="macro-viz cal">
        <div class="viz-ring" style="--pct: ${macroPercent(meal.calories, calorieTarget)}%">
          <span class="viz-value">${meal.calories}</span>
        </div>
        <span class="viz-label">kcal</span>
      </div>
      <div class="macro-viz prot">
        <div class="viz-ring" style="--pct: ${macroPercent(meal.protein, proteinTarget)}%">
          <span class="viz-value">${meal.protein}g</span>
        </div>
        <span class="viz-label">Protein</span>
      </div>
      <div class="macro-viz carb">
        <div class="viz-ring" style="--pct: ${macroPercent(meal.carbs, 100)}%">
          <span class="viz-value">${meal.carbs}g</span>
        </div>
        <span class="viz-label">Carbs</span>
      </div>
      <div class="macro-viz fat">
        <div class="viz-ring" style="--pct: ${macroPercent(meal.fat, 50)}%">
          <span class="viz-value">${meal.fat}g</span>
        </div>
        <span class="viz-label">Fat</span>
      </div>
    </div>

    <div class="macro-bars-mini">
       <div class="mini-bar-track"><div class="mini-bar-fill cal" style="width: ${macroPercent(meal.calories, calorieTarget)}%"></div></div>
       <div class="mini-bar-track"><div class="mini-bar-fill prot" style="width: ${macroPercent(meal.protein, proteinTarget)}%"></div></div>
       <div class="mini-bar-track"><div class="mini-bar-fill carb" style="width: ${macroPercent(meal.carbs, 100)}%"></div></div>
       <div class="mini-bar-track"><div class="mini-bar-fill fat" style="width: ${macroPercent(meal.fat, 50)}%"></div></div>
    </div>

    ${hasShoppingList ? `
    <div class="card-actions">
      <button class="btn-shop" id="shop-${meal.id}" aria-label="View shopping list">
        🛒 Shopping List
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
  for (let i = 0; i < 4; i++) {
    const clone = skeletonTemplate.content.cloneNode(true);
    mealsGrid.appendChild(clone);
  }
}

// ── API Calls ───────────────────────────────────────────────────────────────

async function fetchSuggestions(cal, prot, type, country, dietary) {
  const res = await fetch('/api/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      calorieTarget: cal, 
      proteinTarget: prot, 
      mealType: type,
      country,
      dietary
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(err.error || 'Request failed');
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
      country: countrySelect,
      dietary: dietarySelect,
      excludeIds,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'No alternatives found' }));
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
  const countryInput = document.getElementById('countrySelect');
  const dietaryInput = document.getElementById('dietarySelect');

  // Validate
  const cal = Number(calInput.value);
  const prot = Number(protInput.value);
  const type = typeInput?.value || '';
  const country = countryInput.value;
  const dietary = dietaryInput.value;

  calInput.classList.remove('error');
  protInput.classList.remove('error');

  if (!cal || cal < 50 || cal > 3000) {
    calInput.classList.add('error');
    showError('Enter a calorie goal between 50 and 3000 kcal.');
    return;
  }
  
  if (type !== 'dessert' && (!prot || prot < 1 || prot > 300)) {
    protInput.classList.add('error');
    showError('Enter a protein goal between 1 and 300 g.');
    return;
  }

  // Store state
  calorieTarget = cal;
  proteinTarget = prot;
  mealType = type;
  countrySelect = country;
  dietarySelect = dietary;

  // Show results section with skeletons
  formCard.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  showSkeletons();
  setLoading(true);

  try {
    const data = await fetchSuggestions(cal, prot, type, country, dietary);
    currentMeals = data.meals || [];

    mealsGrid.innerHTML = '';

    if (!currentMeals.length) {
      mealsGrid.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding: 40px 0">
        No meals found. Try adjusting your goals.
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

    const mealTypeLabel = { lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack', dessert: 'Dessert' };
    resultsMeta.textContent = `${mealTypeLabel[type] || type} — Goal: ${cal} kcal / ${prot}g protein`;

  } catch (err) {
    mealsGrid.innerHTML = '';
    resultsSection.classList.add('hidden');
    formCard.classList.remove('hidden');
    showError(err.message || 'An error occurred. Please try again.');
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
    alert(err.message || 'Could not find an alternative.');
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
        <span>Available at ${escapeHtml(meal.store)}</span>
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
