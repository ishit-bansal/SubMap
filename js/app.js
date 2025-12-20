let subs = [];
let incomeState = { hourly: 0, daily: 0, weekly: 0, monthly: 0 };

const colors = [
  { id: "purple", bg: "#FAF5FF", accent: "#E9D5FF" },
  { id: "blue", bg: "#EFF6FF", accent: "#BFDBFE" },
  { id: "cyan", bg: "#ECFEFF", accent: "#A5F3FC" },
  { id: "green", bg: "#F0FDF4", accent: "#BBF7D0" },
  { id: "yellow", bg: "#FEFCE8", accent: "#FEF08A" },
  { id: "orange", bg: "#FFF7ED", accent: "#FED7AA" },
  { id: "pink", bg: "#FDF2F8", accent: "#FBCFE8" },
  { id: "rose", bg: "#FFF1F2", accent: "#FECDD3" },
  { id: "slate", bg: "#F8FAFC", accent: "#E2E8F0" },
  { id: "indigo", bg: "#EEF2FF", accent: "#C7D2FE" },
  { id: "teal", bg: "#F0FDFA", accent: "#99F6E4" },
  { id: "amber", bg: "#FFFBEB", accent: "#FDE68A" },
];

const randColor = () => colors[Math.floor(Math.random() * colors.length)];

function getColor(colorId) {
  const found = colors.find(c => c.id === colorId);
  return found ? found : randColor();
}

function formatMoney(amount, decimals = 2) {
  const dec = Math.abs(amount) >= 100 ? 0 : decimals;
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return "$" + safeAmount.toFixed(dec);
}

function formatShort(amount) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  if (safeAmount >= 1_000_000) return "$" + (safeAmount / 1_000_000).toFixed(1) + "M";
  if (safeAmount >= 10_000) return "$" + (safeAmount / 1_000).toFixed(0) + "k";
  if (safeAmount >= 500) return "$" + safeAmount.toFixed(0);
  return "$" + safeAmount.toFixed(2);
}

function toMonthly(sub) {
  let monthly = sub.price;
  if (sub.cycle === "Yearly") monthly = sub.price / 12;
  if (sub.cycle === "Weekly") monthly = sub.price * 4.33;
  return monthly;
}

function iconHtml(sub, className) {
  if (!sub.url) {
    return '<span class="iconify ' + className + ' text-slate-400 shrink-0" data-icon="ph:cube-bold"></span>';
  }

  const domain = sub.url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  const logoUrl = "https://img.logo.dev/" + domain + "?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png";
  return '<img src="' + logoUrl + '" class="' + className + ' object-contain rounded-lg shrink-0" crossorigin="anonymous">';
}

function getMonthlyTotal() {
  return subs.reduce((sum, sub) => sum + toMonthly(sub), 0);
}

function renderList() {
  const listContainer = document.getElementById("sub-list-container");
  const emptyState = document.getElementById("empty-state");
  const clearBtn = document.getElementById("clear-btn");

  if (!listContainer || !emptyState) return;

  if (subs.length === 0) {
    listContainer.classList.add("hidden");
    emptyState.classList.remove("hidden");
    if (clearBtn) clearBtn.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  listContainer.classList.remove("hidden");
  if (clearBtn) clearBtn.classList.remove("hidden");

  let html = "";
  for (let i = 0; i < subs.length; i++) {
    const sub = subs[i];
    const color = getColor(sub.color);

    html += '<div class="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">';
    html += '<div class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onclick="editSub(\'' + sub.id + '\')">';
    html += '<div class="w-1 h-10 rounded-full shrink-0" style="background: linear-gradient(180deg, ' + color.bg + ' 0%, ' + color.accent + ' 100%);"></div>';
    html += iconHtml(sub, "w-10 h-10");
    html += '<div class="min-w-0">';
    html += '<div class="font-bold text-slate-900 truncate">' + sub.name + '</div>';
    html += '<div class="text-xs text-slate-500">' + formatMoney(sub.price) + ' / ' + sub.cycle + '</div>';
    html += '</div></div>';
    html += '<div class="flex items-center gap-1">';
    html += '<button onclick="editSub(\'' + sub.id + '\')" class="text-slate-300 hover:text-indigo-500 p-2"><span class="iconify" data-icon="ph:pencil-simple-bold"></span></button>';
    html += '<button onclick="removeSub(\'' + sub.id + '\')" class="text-slate-300 hover:text-red-500 p-2"><span class="iconify" data-icon="ph:trash-bold"></span></button>';
    html += '</div></div>';
  }

  html += '<button onclick="openModal()" class="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center gap-2">';
  html += '<span class="iconify w-5 h-5" data-icon="ph:plus-bold"></span> Add another</button>';

  listContainer.innerHTML = html;
}

function renderPresets() {
  const grid = document.getElementById("presets-grid");
  if (!grid) return;

  const popular = presets.filter(p => p.popular);

  let html = "";
  for (let i = 0; i < popular.length; i++) {
    const preset = popular[i];
    const presetIndex = presets.indexOf(preset);
    const logo = "https://img.logo.dev/" + preset.domain + "?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png";

    html += '<button onclick="openModalWithPreset(' + presetIndex + ')" ';
    html += 'class="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md active:scale-95 sm:p-3">';
    html += '<img src="' + logo + '" class="h-8 w-8 rounded-lg object-contain sm:h-10 sm:w-10" crossorigin="anonymous" alt="' + preset.name + '">';
    html += '<span class="text-[10px] font-semibold text-slate-600 truncate w-full text-center sm:text-xs">' + preset.name + '</span>';
    html += '</button>';
  }
  grid.innerHTML = html;
}

function removeSub(subId) {
  subs = subs.filter(s => s.id !== subId);
  save();
}

function clearAllSubs() {
  if (!confirm("Delete all subscriptions?")) return;
  subs = [];
  save();
}

function editSub(subId) {
  const sub = subs.find(s => s.id === subId);
  if (!sub) return;

  document.getElementById("entry-id").value = sub.id;
  document.getElementById("name").value = sub.name;
  document.getElementById("price").value = sub.price;
  document.getElementById("cycle").value = sub.cycle;
  document.getElementById("url").value = sub.url || "";

  updateFavicon(sub.url || "");
  pickColor(sub.color || randColor().id);

  document.getElementById("modal-title").innerText = "Edit Subscription";
  document.querySelector("#sub-form button[type='submit']").innerText = "Save Changes";

  showModal();
}

function initColorPicker() {
  const container = document.getElementById("color-selector");
  if (!container) return;
  let html = "";
  for (const color of colors) {
    html += '<div onclick="pickColor(\'' + color.id + '\')" ';
    html += 'class="color-option cursor-pointer rounded-lg h-10 border-2 border-transparent transition-all hover:scale-105" ';
    html += 'data-val="' + color.id + '" ';
    html += 'style="background:linear-gradient(135deg,' + color.bg + ' 0%,' + color.accent + ' 100%)"></div>';
  }
  container.innerHTML = html;
}

function pickColor(colorId) {
  document.getElementById("selected-color").value = colorId;

  const options = document.querySelectorAll(".color-option");
  for (const opt of options) {
    if (opt.dataset.val === colorId) {
      opt.classList.add("ring-2", "ring-indigo-500", "ring-offset-2");
    } else {
      opt.classList.remove("ring-2", "ring-indigo-500", "ring-offset-2");
    }
  }
}

let faviconDebounce = null;

function updateFavicon(urlInput) {
  clearTimeout(faviconDebounce);

  faviconDebounce = setTimeout(function() {
    const preview = document.getElementById("favicon-preview");

    if (!preview) return;

    if (!urlInput) {
      preview.innerHTML = '<span class="iconify text-slate-300 w-5 h-5" data-icon="ph:globe-simple"></span>';
      return;
    }

    const domain = urlInput.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

    if (domain.length > 3) {
      const logoUrl = "https://img.logo.dev/" + domain + "?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png";
      preview.innerHTML = '<img src="' + logoUrl + '" class="w-full h-full object-cover" crossorigin="anonymous">';
    }
  }, 400);
}

function handleFormSubmit(evt) {
  evt.preventDefault();

  const existingId = document.getElementById("entry-id").value;

  const subData = {
    id: existingId || Date.now().toString(),
    name: document.getElementById("name").value,
    price: parseFloat(document.getElementById("price").value) || 0,
    cycle: document.getElementById("cycle").value,
    url: document.getElementById("url").value,
    color: document.getElementById("selected-color").value || randColor().id,
    date: document.getElementById("date").value || ""
  };

  if (existingId) {
    const index = subs.findIndex(s => s.id === existingId);
    if (index !== -1) {
      subs[index] = subData;
    }
  } else {
    subs.push(subData);
  }

  save();
  hideModal();
}

function updateTotals(monthlyTotal) {
  const totalDisplay = document.getElementById("step-2-total");
  const yearlyDisplay = document.getElementById("step-2-yearly");
  const timeWorked = document.getElementById("time-worked");
  const timeSummary = document.getElementById("time-summary");

  if (totalDisplay) totalDisplay.innerText = formatMoney(monthlyTotal);
  if (yearlyDisplay) yearlyDisplay.innerText = formatMoney(monthlyTotal * 12, 0);

  const hourlyRate = getHourlyRate();
  const monthlyIncome = getMonthlyIncome();

  if (!hourlyRate || hourlyRate <= 0) {
    if (timeWorked) timeWorked.innerText = "Add your income to see work time.";
    if (timeSummary) timeSummary.innerText = "Add your income to see the time you work for these subscriptions.";
    return;
  }

  const totalHours = monthlyTotal / hourlyRate;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  const share = monthlyIncome > 0 ? Math.min(1000, (monthlyTotal / monthlyIncome) * 100) : null;

  if (timeWorked) {
    const minsLabel = minutes === 60 ? "" : minutes + "m";
    const adjustedHours = minutes === 60 ? hours + 1 : hours;
    timeWorked.innerText = `≈ ${adjustedHours}h${minsLabel ? " " + minsLabel : ""} of work / month` + (share ? ` (${share.toFixed(1)}% of income)` : "");
  }
  if (timeSummary) {
    timeSummary.innerText = monthlyIncome > 0
      ? `Based on about ${formatMoney(monthlyIncome, 0)} in monthly income.`
      : "Add your income to see the time you work for these subscriptions.";
  }
}

function renderTotals() {
  updateTotals(getMonthlyTotal());
}

function renderGrid() {
  const gridEl = document.getElementById("bento-grid");
  if (!gridEl) return;

  const monthlyTotal = getMonthlyTotal();

  if (subs.length === 0) {
    gridEl.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400">Add subscriptions to see the grid</div>';
    updateTotals(monthlyTotal);
    return;
  }

  const items = [];
  for (let i = 0; i < subs.length; i++) {
    const sub = subs[i];
    const monthlyCost = toMonthly(sub);
    items.push({
      id: sub.id,
      name: sub.name,
      url: sub.url,
      color: sub.color,
      price: sub.price,
      cycle: sub.cycle,
      cost: monthlyCost
    });
  }

  items.sort(function(a, b) { return b.cost - a.cost; });

  const bounds = gridEl.getBoundingClientRect();
  const gridWidth = bounds.width || 600;
  const gridHeight = bounds.height || 450;

  const treemapData = [];
  for (let i = 0; i < items.length; i++) {
    treemapData.push({
      id: items[i].id,
      name: items[i].name,
      url: items[i].url,
      color: items[i].color,
      price: items[i].price,
      cycle: items[i].cycle,
      cost: items[i].cost,
      val: items[i].cost,
      idx: i
    });
  }

  const treemap = new Treemap(gridWidth, gridHeight);
  const cells = treemap.layout(treemapData);

  let html = "";

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const percent = monthlyTotal > 0 ? (cell.cost / monthlyTotal) * 100 : 0;
    const colorPalette = getColor(cell.color);

    const minDim = Math.min(cell.w, cell.h);
    const clampedPct = Math.max(3, Math.min(60, percent));

    const padding = Math.round(Math.max(6, Math.min(minDim * 0.08, 16)) + (clampedPct / 60) * 8);
    const borderRadius = Math.round(Math.max(6, Math.min(minDim * 0.12, 20)) + (clampedPct / 60) * 6);

    const innerWidth = cell.w - padding * 2;
    const innerHeight = cell.h - padding * 2;

    const maxPriceFont = Math.min(Math.floor(innerWidth * 0.16), Math.floor(innerHeight * 0.28));
    const priceFont = Math.max(10, Math.min(12 + (clampedPct / 60) * 36, maxPriceFont, 48));
    const titleFont = Math.max(8, Math.min(9 + (clampedPct / 60) * 15, priceFont * 0.55, 24));
    const iconSize = Math.max(14, Math.min(18 + (clampedPct / 60) * 30, innerHeight * 0.3, innerWidth * 0.35, 48));

    const isMicro = minDim < 40 || (cell.w < 50 && cell.h < 50);
    const isTiny = minDim < 55 || (cell.w < 65 && cell.h < 65);
    const isSmall = minDim < 85 || cell.w < 95;

    let cellContent = "";
    const monthlyLabel = formatShort(toMonthly(cell));
    const yearlyLabel = formatShort(toMonthly(cell) * 12);

    if (isMicro) {
      const sz = Math.max(12, Math.min(iconSize, minDim * 0.5));
      cellContent = '<div class="flex items-center justify-center h-full w-full">' + iconHtml(cell, "w-[" + sz + "px] h-[" + sz + "px]") + '</div>';

    } else if (isTiny) {
      const sz = Math.max(14, Math.min(iconSize, minDim * 0.4));
      const ps = Math.max(9, Math.min(priceFont, 13, innerWidth * 0.16));
      cellContent = '<div class="flex flex-col items-center justify-center h-full w-full gap-1">';
      cellContent += iconHtml(cell, "w-[" + sz + "px] h-[" + sz + "px]");
      cellContent += '<div class="font-bold text-slate-900" style="font-size:' + ps + 'px">' + monthlyLabel + '</div>';
      cellContent += '</div>';

    } else if (isSmall) {
      const sz = Math.max(16, Math.min(iconSize, innerWidth * 0.35, innerHeight * 0.25));
      const ts = Math.max(8, Math.min(titleFont, 11, innerWidth * 0.12));
      const ps = Math.max(11, Math.min(priceFont, 18, innerWidth * 0.18));

      cellContent = '<div class="flex flex-col items-center justify-center h-full w-full gap-1 text-center">';
      cellContent += iconHtml(cell, "w-[" + sz + "px] h-[" + sz + "px]");
      cellContent += '<div class="min-w-0 w-full">';
      cellContent += '<div class="font-semibold text-slate-900 treemap-cell-name" style="font-size:' + ts + 'px">' + cell.name + '</div>';
      cellContent += '<div class="font-black text-slate-900" style="font-size:' + ps + 'px">' + monthlyLabel + '</div>';
      cellContent += '</div></div>';

    } else {
      const showPercentBadge = cell.w > 80 && cell.h > 70;
      const showYearlyEstimate = cell.h > 130 && cell.w > 110 && percent > 8;

      cellContent = '<div class="flex justify-between items-start">';
      cellContent += iconHtml(cell, "w-[" + iconSize + "px] h-[" + iconSize + "px]");
      if (showPercentBadge) {
        cellContent += '<span class="text-[10px] font-bold bg-white/70 px-2 py-1 rounded-full text-slate-700">' + Math.round(percent) + '%</span>';
      }
      cellContent += '</div>';
      cellContent += '<div class="mt-auto min-w-0">';
      cellContent += '<div class="font-bold text-slate-900 treemap-cell-name" style="font-size:' + titleFont + 'px">' + cell.name + '</div>';
      cellContent += '<div class="font-black text-slate-900 tracking-tight leading-none" style="font-size:' + priceFont + 'px">' + monthlyLabel + '/mo</div>';
      if (showYearlyEstimate) {
        cellContent += '<div class="text-xs font-medium text-slate-500 mt-1">~' + yearlyLabel + '/yr</div>';
      }
      cellContent += '</div>';
    }

    html += '<div class="treemap-cell" data-id="' + cell.id + '" style="left:' + cell.x + 'px;top:' + cell.y + 'px;width:' + cell.w + 'px;height:' + cell.h + 'px;border-radius:' + borderRadius + 'px">';
    html += '<div class="treemap-cell-inner" style="background:linear-gradient(135deg,' + colorPalette.bg + ' 0%,' + colorPalette.accent + ' 100%);padding:' + padding + 'px;border-radius:' + Math.max(4, borderRadius - 3) + 'px">';
    html += cellContent;
    html += '</div></div>';
  }

  gridEl.innerHTML = html;
  updateTotals(monthlyTotal);
}

function handleIncomeChange(type, value) {
  incomeState[type] = parseFloat(value) || 0;
  saveIncome(incomeState);
  syncIncomeInputs();
}

function resetIncomeInputs() {
  incomeState = { hourly: 0, daily: 0, weekly: 0, monthly: 0 };
  syncIncomeInputs();
  saveIncome(incomeState);
}

function syncIncomeInputs() {
  const hourlyInput = document.getElementById("income-hourly");
  const dailyInput = document.getElementById("income-daily");
  const weeklyInput = document.getElementById("income-weekly");
  const monthlyInput = document.getElementById("income-monthly");

  if (hourlyInput) hourlyInput.value = incomeState.hourly || "";
  if (dailyInput) dailyInput.value = incomeState.daily || "";
  if (weeklyInput) weeklyInput.value = incomeState.weekly || "";
  if (monthlyInput) monthlyInput.value = incomeState.monthly || "";
}

function getHourlyRate() {
  if (incomeState.hourly > 0) return incomeState.hourly;
  if (incomeState.daily > 0) return incomeState.daily / 8;
  if (incomeState.weekly > 0) return incomeState.weekly / 40;
  if (incomeState.monthly > 0) return incomeState.monthly / (4.33 * 40);
  return 0;
}

function getMonthlyIncome() {
  if (incomeState.monthly > 0) return incomeState.monthly;
  if (incomeState.weekly > 0) return incomeState.weekly * 4.33;
  if (incomeState.daily > 0) return incomeState.daily * 22;
  if (incomeState.hourly > 0) return incomeState.hourly * (40 * 4.33);
  return 0;
}

document.addEventListener("DOMContentLoaded", function() {
  incomeState = loadIncome();
  syncIncomeInputs();
  load();
  initColorPicker();
  renderPresets();
  renderList();
  renderGrid();
  renderTotals();
  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
});
