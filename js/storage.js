const STORAGE_KEY = "subviz_subscriptions";
const INCOME_KEY = "subviz_income";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) subs = JSON.parse(raw);
  } catch (err) {
    console.warn("failed to load saved data:", err);
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
    if (!raw) return { hourly: 0, daily: 0, weekly: 0, monthly: 0, lastType: null };
    const parsed = JSON.parse(raw);
    return {
      hourly: Number(parsed.hourly) || 0,
      daily: Number(parsed.daily) || 0,
      weekly: Number(parsed.weekly) || 0,
      monthly: Number(parsed.monthly) || 0,
      lastType: parsed.lastType || null
    };
  } catch (err) {
    console.warn("failed to load income data:", err);
    return { hourly: 0, daily: 0, weekly: 0, monthly: 0, lastType: null };
  }
}

function saveIncome(incomeState) {
  localStorage.setItem(INCOME_KEY, JSON.stringify(incomeState));
}
