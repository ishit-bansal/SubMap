/**
 * Storage module for SubMap
 */

const STORAGE_KEY = 'submap_subs';
const INCOME_KEY = 'submap_income';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) subs = JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load subscriptions:', err);
    subs = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  renderList();
  renderGrid();
  renderTotals();
}

function loadIncome() {
  try {
    const raw = localStorage.getItem(INCOME_KEY);
    if (!raw) return { amount: 0, unit: 'hourly' };
    const parsed = JSON.parse(raw);
    return {
      amount: Number(parsed.amount) || 0,
      unit: parsed.unit || 'hourly'
    };
  } catch (err) {
    console.warn('Failed to load income:', err);
    return { amount: 0, unit: 'hourly' };
  }
}

function saveIncome(state) {
  localStorage.setItem(INCOME_KEY, JSON.stringify(state));
}
