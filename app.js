/**
 * Unified application logic for:
 * 1. Switch PZU ↔ ID Calculator (Dark Anthracite Frosted Glass)
 * 2. Spread Calculator Aukera - BESS Minimum Spread (Light White Frosted Glass)
 */

// Initial defaults matching Excel Switch_PZU_ID_cazuri_independente.xlsx
const DEFAULT_BUY = {
  pzuPrice: 155,
  idClosePrice: 153,
  idNewPrice: 40,
  interval: '60m',
  quantityMw: 20
};

const DEFAULT_SELL = {
  pzuPrice: 200.69,
  idClosePrice: 350,
  idNewPrice: 425,
  interval: '15m',
  quantityMw: 5
};

// Initial defaults matching Spread_calculator_Aukera.xlsx
const DEFAULT_AUKERA = {
  pBuy: 165,
  targetMargin: 10,
  quantity: 130,
  rte: 85,
  lossCost: 14.33,
  ronRate: 5.3
};

const DEFAULT_ARBITRAGE = {
  qhBuy: 'Q52 (12:45)',
  qhSell: 'Q80 (20:00)',
  priceBuy: 97.53,
  priceSell: 289.91,
  qtyMw: 10
};

// Application State
const state = {
  activeApp: localStorage.getItem('pzu_active_app') || 'pzu', // 'pzu' | 'aukera' | 'id-arbitrage'
  theme: localStorage.getItem('active_theme') || 'dark', // 'dark' | 'light'
  isLuxury: localStorage.getItem('is_luxury') === 'true', // true | false
  mode: 'BUY',
  buyData: loadSavedData('pzu_calc_buy', DEFAULT_BUY),
  sellData: loadSavedData('pzu_calc_sell', DEFAULT_SELL),
  aukeraData: loadSavedData('aukera_calc_data', DEFAULT_AUKERA),
  arbitrageData: loadSavedData('id_arb_data', DEFAULT_ARBITRAGE),
  isPinned: true
};

function loadSavedData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : { ...fallback };
  } catch (e) {
    return { ...fallback };
  }
}

function saveData() {
  try {
    localStorage.setItem('pzu_active_app', state.activeApp);
    localStorage.setItem('active_theme', state.theme);
    localStorage.setItem('is_luxury', state.isLuxury);
    localStorage.setItem('pzu_calc_buy', JSON.stringify(state.buyData));
    localStorage.setItem('pzu_calc_sell', JSON.stringify(state.sellData));
    localStorage.setItem('aukera_calc_data', JSON.stringify(state.aukeraData));
    localStorage.setItem('id_arb_data', JSON.stringify(state.arbitrageData));
  } catch (e) {}
}

// Global DOM Elements
const calcWindow = document.getElementById('calcWindow');
const windowTitle = document.getElementById('windowTitle');
const appSwitcherButtons = document.querySelectorAll('#appSwitcher .app-tab-btn');
const pzuView = document.getElementById('pzuView');
const aukeraView = document.getElementById('aukeraView');
const idArbitrageView = document.getElementById('idArbitrageView');
const footerBrand = document.getElementById('footerBrand');
const footerHint = document.getElementById('footerHint');
const pinBtn = document.getElementById('pinBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const luxuryToggleBtn = document.getElementById('luxuryToggleBtn');

// PZU DOM Elements
const modeButtons = document.querySelectorAll('#modeSwitch .segment-btn');
const intervalButtons = document.querySelectorAll('#intervalSwitch .segment-btn');
const pzuLabel = document.getElementById('pzuLabel');
const idCloseLabel = document.getElementById('idCloseLabel');
const idNewLabel = document.getElementById('idNewLabel');
const pzuInput = document.getElementById('pzuPriceInput');
const idCloseInput = document.getElementById('idClosePriceInput');
const idNewInput = document.getElementById('idNewPriceInput');
const quantityInput = document.getElementById('quantityInput');
const gainCard = document.getElementById('gainCard');
const gainCaption = document.getElementById('gainCaption');
const gainStatusTag = document.getElementById('gainStatusTag');
const finalGainDisplay = document.getElementById('finalGainDisplay');
const effectivePriceDisplay = document.getElementById('effectivePriceDisplay');
const spreadDisplay = document.getElementById('spreadDisplay');
const benefitDisplay = document.getElementById('benefitDisplay');
const energyDisplay = document.getElementById('energyDisplay');
const copyViberBtn = document.getElementById('copyViberBtn');
const copyViberLabel = document.getElementById('copyViberLabel');

// Aukera DOM Elements
const aukeraPBuyInput = document.getElementById('aukeraPBuyInput');
const aukeraPBuyRonHint = document.getElementById('aukeraPBuyRonHint');
const aukeraMarginInput = document.getElementById('aukeraMarginInput');
const aukeraQtyInput = document.getElementById('aukeraQtyInput');
const aukeraRteInput = document.getElementById('aukeraRteInput');
const aukeraLossCostInput = document.getElementById('aukeraLossCostInput');

const aukeraHeroCard = document.getElementById('aukeraHeroCard');
const aukeraStatusTag = document.getElementById('aukeraStatusTag');
const aukeraPSellTargetDisplay = document.getElementById('aukeraPSellTargetDisplay');
const aukeraPSellMinDisplay = document.getElementById('aukeraPSellMinDisplay');
const aukeraSpreadMinDisplay = document.getElementById('aukeraSpreadMinDisplay');
const aukeraPSellRonDisplay = document.getElementById('aukeraPSellRonDisplay');

const aukeraNetProfitDisplay = document.getElementById('aukeraNetProfitDisplay');
const aukeraSpreadTargetSub = document.getElementById('aukeraSpreadTargetSub');
const aukeraDeliverableDisplay = document.getElementById('aukeraDeliverableDisplay');
const aukeraLossEnergySub = document.getElementById('aukeraLossEnergySub');

const aukeraTotalPurchaseCostDisplay = document.getElementById('aukeraTotalPurchaseCostDisplay');
const aukeraLossCostTotalDisplay = document.getElementById('aukeraLossCostTotalDisplay');
const aukeraTotalCostDisplay = document.getElementById('aukeraTotalCostDisplay');
const aukeraProfitHighlightDisplay = document.getElementById('aukeraProfitHighlightDisplay');

const aukeraShareViberBtn = document.getElementById('aukeraShareViberBtn');
const aukeraViberLabel = document.getElementById('aukeraViberLabel');

// Arbitrage & ML Recommendation DOM Elements
const arbQhBuyInput = document.getElementById('arbQhBuyInput');
const arbQhSellInput = document.getElementById('arbQhSellInput');
const arbPriceBuyInput = document.getElementById('arbPriceBuyInput');
const arbPriceSellInput = document.getElementById('arbPriceSellInput');
const arbQtyMwInput = document.getElementById('arbQtyMwInput');

const arbSpreadDisplay = document.getElementById('arbSpreadDisplay');
const arbEnergyInDisplay = document.getElementById('arbEnergyInDisplay');
const arbEnergyOutDisplay = document.getElementById('arbEnergyOutDisplay');
const arbProfitDisplay = document.getElementById('arbProfitDisplay');
const arbApplyMlBtn = document.getElementById('arbApplyMlBtn');
const arbRunPipelineBtn = document.getElementById('arbRunPipelineBtn');
const arbRunPipelineMainBtn = document.getElementById('arbRunPipelineMainBtn');
const arbRefreshIcon = document.getElementById('arbRefreshIcon');
const arbRefreshIconMain = document.getElementById('arbRefreshIconMain');
const arbRunBtnText = document.getElementById('arbRunBtnText');
const arbRunMainText = document.getElementById('arbRunMainText');

const arbRecBuyMarket = document.getElementById('arbRecBuyMarket');
const arbRecBuySlot = document.getElementById('arbRecBuySlot');
const arbRecBuyPrice = document.getElementById('arbRecBuyPrice');
const arbRecBuySaving = document.getElementById('arbRecBuySaving');

const arbRecSellMarket = document.getElementById('arbRecSellMarket');
const arbRecSellSlot = document.getElementById('arbRecSellSlot');
const arbRecSellPrice = document.getElementById('arbRecSellPrice');
const arbRecCycleSpread = document.getElementById('arbRecCycleSpread');
const arbDeliveryDate = document.getElementById('arbDeliveryDate');
const arbSlotsTableBody = document.getElementById('arbSlotsTableBody');

const valRamp = document.getElementById('valRamp');
const valInverter = document.getElementById('valInverter');

// Number formatting helpers
function formatCurrency(val) {
  const abs = Math.abs(val).toLocaleString('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  if (val > 0) return `+${abs}`;
  if (val < 0) return `-${abs}`;
  return '0,00';
}

function formatMwh(val) {
  return val.toLocaleString('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

function formatPlainNumber(val, decimals = 2) {
  return Number(val).toLocaleString('ro-RO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// ================= TOP-LEVEL MODULE SWITCHING =================
function applyTheme() {
  if (themeToggleBtn) {
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    if (state.theme === 'light') {
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
    } else {
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
    }
  }

  if (luxuryToggleBtn) {
    if (state.isLuxury) {
      luxuryToggleBtn.classList.add('active');
      calcWindow.dataset.theme = 'luxury';
    } else {
      luxuryToggleBtn.classList.remove('active');
      calcWindow.dataset.theme = state.theme === 'light' ? 'white' : 'anthracite';
    }
  }
}

function setApp(appName) {
  state.activeApp = appName;
  saveData();

  appSwitcherButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.app === appName);
  });

  applyTheme();

  if (appName === 'pzu') {
    pzuView.classList.add('active');
    aukeraView.classList.remove('active');
    idArbitrageView.classList.remove('active');
    windowTitle.textContent = 'Switch PZU ↔ ID';
    footerBrand.textContent = 'PowerPeak Trading • PZU ↔ ID';
    footerHint.textContent = 'Tab / Shift+Tab • Recalculare Live';
    recalculatePzu();
  } else if (appName === 'aukera') {
    pzuView.classList.remove('active');
    aukeraView.classList.add('active');
    idArbitrageView.classList.remove('active');
    windowTitle.textContent = 'Spread Calculator Aukera';
    footerBrand.textContent = 'PowerPeak Trading • Aukera BESS';
    footerHint.textContent = 'Spread Minim & Eficiență Ciclu';
    renderAukeraInputs();
    recalculateAukera();
  } else if (appName === 'id-arbitrage') {
    pzuView.classList.remove('active');
    aukeraView.classList.remove('active');
    idArbitrageView.classList.add('active');
    windowTitle.textContent = 'Arbitraj IDA ↔ PZU (BESS)';
    footerBrand.textContent = 'PowerPeak Trading • Arbitraj BESS';
    footerHint.textContent = 'Recomandare ML & Ciclu Secundar';
    loadMlRecommendation();
    renderArbitrageInputs();
    recalculateArbitrage();
  }
}

appSwitcherButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetApp = btn.dataset.app;
    if (state.activeApp !== targetApp) {
      setApp(targetApp);
    }
  });
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveData();
    applyTheme();
  });
}

if (luxuryToggleBtn) {
  luxuryToggleBtn.addEventListener('click', () => {
    state.isLuxury = !state.isLuxury;
    saveData();
    applyTheme();
  });
}

// ================= PZU LOGIC =================
function recalculatePzu() {
  const currentData = state.mode === 'BUY' ? state.buyData : state.sellData;

  const result = calculateSwitch({
    mode: state.mode,
    pzuPrice: currentData.pzuPrice,
    idClosePrice: currentData.idClosePrice,
    idNewPrice: currentData.idNewPrice,
    interval: currentData.interval,
    quantityMw: currentData.quantityMw
  });

  // Hero Card update
  finalGainDisplay.textContent = Math.abs(result.finalGainEur).toLocaleString('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  finalGainDisplay.className = 'gain-number';
  if (result.finalGainEur > 0) {
    finalGainDisplay.classList.add('profit');
    gainStatusTag.textContent = 'PROFIT';
    gainStatusTag.className = 'gain-status-tag';
  } else if (result.finalGainEur < 0) {
    finalGainDisplay.classList.add('loss');
    gainStatusTag.textContent = 'PIERDERE';
    gainStatusTag.className = 'gain-status-tag loss';
  } else {
    gainStatusTag.textContent = 'BREAKEVEN';
    gainStatusTag.className = 'gain-status-tag';
  }

  const isBuy = state.mode === 'BUY';
  effectivePriceDisplay.innerHTML = `Preț efectiv ${isBuy ? 'BUY' : 'SELL'}: <strong>${result.effectivePrice.toFixed(2)} €/MWh</strong>`;

  // Secondary metrics
  const spreadPrefix = result.spreadClose > 0 ? '+' : '';
  spreadDisplay.innerHTML = `${spreadPrefix}${result.spreadClose.toFixed(2)} <small>€/MWh</small>`;

  const benefitPrefix = result.netBenefit > 0 ? '+' : '';
  benefitDisplay.innerHTML = `${benefitPrefix}${result.netBenefit.toFixed(2)} <small>€/MWh</small>`;
  benefitDisplay.className = `metric-val ${result.netBenefit >= 0 ? 'highlight' : ''}`;

  energyDisplay.textContent = `${formatMwh(result.energyMwh)} MWh`;

  saveData();
}

function renderMode() {
  const currentData = state.mode === 'BUY' ? state.buyData : state.sellData;

  modeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === state.mode);
  });

  if (state.mode === 'BUY') {
    pzuLabel.textContent = 'Preț BUY PZU';
    idCloseLabel.textContent = 'Preț SELL ID (închidere)';
    idNewLabel.textContent = 'Preț BUY ID nou';
    gainCaption.textContent = 'CÂȘTIG FINAL BUY';
  } else {
    pzuLabel.textContent = 'Preț SELL PZU';
    idCloseLabel.textContent = 'Preț BUY ID (închidere)';
    idNewLabel.textContent = 'Preț SELL ID nou';
    gainCaption.textContent = 'CÂȘTIG FINAL SELL';
  }

  pzuInput.value = currentData.pzuPrice;
  idCloseInput.value = currentData.idClosePrice;
  idNewInput.value = currentData.idNewPrice;
  quantityInput.value = currentData.quantityMw;

  intervalButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.interval === currentData.interval);
  });

  recalculatePzu();
}

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const nextMode = btn.dataset.mode;
    if (state.mode !== nextMode) {
      state.mode = nextMode;
      renderMode();
    }
  });
});

intervalButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const nextInterval = btn.dataset.interval;
    const currentData = state.mode === 'BUY' ? state.buyData : state.sellData;
    currentData.interval = nextInterval;
    intervalButtons.forEach(b => b.classList.toggle('active', b.dataset.interval === nextInterval));
    recalculatePzu();
  });
});

function onPzuInputChange() {
  const currentData = state.mode === 'BUY' ? state.buyData : state.sellData;
  currentData.pzuPrice = parseFloat(pzuInput.value) || 0;
  currentData.idClosePrice = parseFloat(idCloseInput.value) || 0;
  currentData.idNewPrice = parseFloat(idNewInput.value) || 0;
  currentData.quantityMw = parseFloat(quantityInput.value) || 0;
  recalculatePzu();
}

[pzuInput, idCloseInput, idNewInput, quantityInput].forEach(inp => {
  inp.addEventListener('input', onPzuInputChange);
  inp.addEventListener('focus', () => inp.select());
});

// ================= AUKERA LOGIC =================
function renderAukeraInputs() {
  aukeraPBuyInput.value = state.aukeraData.pBuy;
  aukeraMarginInput.value = state.aukeraData.targetMargin !== undefined ? state.aukeraData.targetMargin : 10;
  aukeraQtyInput.value = state.aukeraData.quantity;
  aukeraRteInput.value = state.aukeraData.rte;
  aukeraLossCostInput.value = state.aukeraData.lossCost;
}

function recalculateAukera() {
  const data = state.aukeraData;
  const result = calculateAukeraSpread({
    pBuy: data.pBuy,
    targetMargin: data.targetMargin !== undefined ? data.targetMargin : 10,
    quantity: data.quantity,
    rte: data.rte,
    lossCost: data.lossCost,
    ronRate: data.ronRate || 5.3
  });

  // Hero Card: Preț Recomandat de Vânzare cu Profit
  aukeraPSellTargetDisplay.textContent = formatPlainNumber(result.pSellTarget, 2);
  aukeraPSellMinDisplay.textContent = `${formatPlainNumber(result.pSellMin, 2)} €/MWh`;
  const spreadMinPrefix = result.spreadMin > 0 ? '+' : '';
  aukeraSpreadMinDisplay.textContent = `${spreadMinPrefix}${formatPlainNumber(result.spreadMin, 2)} €`;
  aukeraPSellRonDisplay.textContent = `≈ ${formatPlainNumber(result.pSellTargetRon, 2)} RON/MWh (la curs ${data.ronRate.toFixed(2)})`;
  aukeraPBuyRonHint.textContent = `≈ ${formatPlainNumber(result.pBuyRon, 2)} RON/MWh (la curs ${data.ronRate.toFixed(2)})`;

  // Status Tag
  if (result.netProfitTotal > 0) {
    aukeraStatusTag.textContent = `PROFIT: +${formatPlainNumber(result.netProfitTotal, 2)} €`;
    aukeraStatusTag.className = 'gain-status-tag aukera-tag';
  } else if (result.netProfitTotal === 0) {
    aukeraStatusTag.textContent = 'BREAK-EVEN (0 €)';
    aukeraStatusTag.className = 'gain-status-tag aukera-tag';
  } else {
    aukeraStatusTag.textContent = `PIERDERE: -${formatPlainNumber(Math.abs(result.netProfitTotal), 2)} €`;
    aukeraStatusTag.className = 'gain-status-tag aukera-tag loss';
  }

  // Secondary metrics
  const profitPrefix = result.netProfitTotal > 0 ? '+' : (result.netProfitTotal < 0 ? '-' : '');
  aukeraNetProfitDisplay.innerHTML = `${profitPrefix}${formatPlainNumber(Math.abs(result.netProfitTotal), 2)} <small>€</small>`;
  const spreadTargetPrefix = result.spreadTarget > 0 ? '+' : '';
  aukeraSpreadTargetSub.textContent = `Spread vânzare: ${spreadTargetPrefix}${formatPlainNumber(result.spreadTarget, 2)} €/MWh`;

  aukeraDeliverableDisplay.innerHTML = `${formatPlainNumber(result.deliverableEnergy, 2)} <small>MWh</small>`;
  const lossPct = (100 - result.rtePercent).toFixed(0);
  aukeraLossEnergySub.textContent = `Pierdere: ${formatPlainNumber(result.energyLost, 2)} MWh (${lossPct}%)`;

  // Cost breakdown
  aukeraTotalPurchaseCostDisplay.textContent = `${formatPlainNumber(result.totalPurchaseCost, 2)} €`;
  aukeraLossCostTotalDisplay.textContent = `+${formatPlainNumber(result.lossCostTotal, 2)} €`;
  aukeraTotalCostDisplay.textContent = `${formatPlainNumber(result.totalCost, 2)} €`;
  aukeraProfitHighlightDisplay.textContent = `${profitPrefix}${formatPlainNumber(Math.abs(result.netProfitTotal), 2)} €`;

  saveData();
}

function onAukeraInputChange() {
  state.aukeraData.pBuy = parseFloat(aukeraPBuyInput.value) || 0;
  state.aukeraData.targetMargin = parseFloat(aukeraMarginInput.value) || 0;
  state.aukeraData.quantity = parseFloat(aukeraQtyInput.value) || 0;
  state.aukeraData.rte = parseFloat(aukeraRteInput.value) || 0;
  state.aukeraData.lossCost = parseFloat(aukeraLossCostInput.value) || 0;
  recalculateAukera();
}

[aukeraPBuyInput, aukeraMarginInput, aukeraQtyInput, aukeraRteInput, aukeraLossCostInput].forEach(inp => {
  inp.addEventListener('input', onAukeraInputChange);
  inp.addEventListener('focus', () => inp.select());
});

// ================= RESET ACTION REMOVED =================

// ================= PIN (ALWAYS ON TOP) =================
pinBtn.addEventListener('click', () => {
  state.isPinned = !state.isPinned;
  pinBtn.classList.toggle('active', state.isPinned);
  if (window.electronAPI && window.electronAPI.setAlwaysOnTop) {
    window.electronAPI.setAlwaysOnTop(state.isPinned);
  }
});

// ================= VIBER SHARE ACTIONS =================
function triggerViberFeedback(btnEl, labelEl, defaultLabelText) {
  btnEl.classList.add('copied');
  const prefixEl = btnEl.querySelector('.viber-prefix');
  if (prefixEl) prefixEl.textContent = '✓';
  if (labelEl) labelEl.textContent = 'Copiat! Dă Cmd+V în Viber';

  setTimeout(() => {
    btnEl.classList.remove('copied');
    if (prefixEl) prefixEl.textContent = 'Share on';
    if (labelEl) labelEl.textContent = defaultLabelText;
  }, 3500);
}

// 1. PZU Viber Share
if (copyViberBtn) {
  copyViberBtn.addEventListener('click', async () => {
    if (window.electronAPI && window.electronAPI.shareViberScreenshot) {
      try {
        triggerViberFeedback(copyViberBtn, copyViberLabel, 'Viber');
        await window.electronAPI.shareViberScreenshot();
        return;
      } catch (err) {
        console.error('Error sharing PZU screenshot to Viber:', err);
      }
    }

    // Browser text fallback
    const currentData = state.mode === 'BUY' ? state.buyData : state.sellData;
    const result = calculateSwitch({
      mode: state.mode,
      pzuPrice: currentData.pzuPrice,
      idClosePrice: currentData.idClosePrice,
      idNewPrice: currentData.idNewPrice,
      interval: currentData.interval,
      quantityMw: currentData.quantityMw
    });

    const isBuy = state.mode === 'BUY';
    const intervalLabel = currentData.interval === '60m' ? 'Ora (60 min)' : 'Sfert (15 min)';
    const gainPrefix = result.finalGainEur > 0 ? '+' : (result.finalGainEur < 0 ? '-' : '');
    const spreadPrefix = result.spreadClose > 0 ? '+' : '';
    const benefitPrefix = result.netBenefit > 0 ? '+' : '';

    const text = [
      `⚡ SWITCH PZU ↔ ID [${isBuy ? 'CUMPĂRARE' : 'VÂNZARE'}]`,
      isBuy ? `• Preț BUY PZU: ${currentData.pzuPrice.toFixed(2)} €/MWh` : `• Preț SELL PZU: ${currentData.pzuPrice.toFixed(2)} €/MWh`,
      isBuy ? `• Preț SELL ID (închidere): ${currentData.idClosePrice.toFixed(2)} €/MWh` : `• Preț BUY ID (închidere): ${currentData.idClosePrice.toFixed(2)} €/MWh`,
      isBuy ? `• Preț BUY ID nou: ${currentData.idNewPrice.toFixed(2)} €/MWh` : `• Preț SELL ID nou: ${currentData.idNewPrice.toFixed(2)} €/MWh`,
      `• Spread închidere: ${spreadPrefix}${result.spreadClose.toFixed(2)} €/MWh`,
      `• Beneficiu net switch: ${benefitPrefix}${result.netBenefit.toFixed(2)} €/MWh`,
      `• Preț efectiv ${isBuy ? 'BUY' : 'SELL'}: ${result.effectivePrice.toFixed(2)} €/MWh`,
      `• Interval: ${intervalLabel} | Volum: ${currentData.quantityMw} MW (${result.energyMwh} MWh)`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 CÂȘTIG FINAL: ${gainPrefix}${Math.abs(result.finalGainEur).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    ].join('\n');

    copyToClipboardFallback(text);
    triggerViberFeedback(copyViberBtn, copyViberLabel, 'Viber');
  });
}

// 2. Aukera Viber Share
if (aukeraShareViberBtn) {
  aukeraShareViberBtn.addEventListener('click', async () => {
    if (window.electronAPI && window.electronAPI.shareViberScreenshot) {
      try {
        triggerViberFeedback(aukeraShareViberBtn, aukeraViberLabel, 'Viber');
        await window.electronAPI.shareViberScreenshot();
        return;
      } catch (err) {
        console.error('Error sharing Aukera screenshot to Viber:', err);
      }
    }

    // Browser text fallback
    const data = state.aukeraData;
    const result = calculateAukeraSpread({
      pBuy: data.pBuy,
      targetMargin: data.targetMargin !== undefined ? data.targetMargin : 10,
      quantity: data.quantity,
      rte: data.rte,
      lossCost: data.lossCost,
      ronRate: data.ronRate || 5.3
    });

    const profitPrefix = result.netProfitTotal >= 0 ? '+' : '-';
    const spreadTargetPrefix = result.spreadTarget >= 0 ? '+' : '';
    const text = [
      `🔋 AUKERA BESS • SPREAD & PREȚ RECOMANDAT VÂNZARE`,
      `• Preț Cumpărare (P_buy): ${result.pBuy.toFixed(2)} €/MWh (${result.pBuyRon.toFixed(2)} RON)`,
      `• Marjă Profit Dorită: +${result.targetMargin.toFixed(2)} €/MWh`,
      `• Cantitate: ${data.quantity} MWh | Eficiență (RTE): ${result.rtePercent}%`,
      `• Cost Pierderi: ${data.lossCost.toFixed(2)} €/MWh`,
      `• Energie Livrabilă: ${result.deliverableEnergy.toFixed(2)} MWh (Pierdere: ${result.energyLost.toFixed(2)} MWh)`,
      `• Cheltuială Totală Ciclu: ${formatPlainNumber(result.totalCost, 2)} €`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🎯 PRAG BREAK-EVEN: ${result.pSellMin.toFixed(2)} €/MWh (Spread min: +${result.spreadMin.toFixed(2)} €)`,
      `💎 PREȚ RECOMANDAT VÂNZARE: ${result.pSellTarget.toFixed(2)} €/MWh (${formatPlainNumber(result.pSellTargetRon, 2)} RON/MWh)`,
      `💰 PROFIT NET ESTIMAT: ${profitPrefix}${formatPlainNumber(Math.abs(result.netProfitTotal), 2)} € (Spread total: ${spreadTargetPrefix}${result.spreadTarget.toFixed(2)} €/MWh)`
    ].join('\n');

    copyToClipboardFallback(text);
    triggerViberFeedback(aukeraShareViberBtn, aukeraViberLabel, 'Viber');
  });
}

function copyToClipboardFallback(str) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).catch(() => domFallbackCopy(str));
  } else {
    domFallbackCopy(str);
  }
}

function domFallbackCopy(str) {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

// Window controls (Traffic lights for Electron)
const closeDot = document.querySelector('.dot.close');
const minDot = document.querySelector('.dot.minimize');

if (closeDot) {
  closeDot.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.closeWindow) {
      window.electronAPI.closeWindow();
    } else {
      window.close();
    }
  });
}

if (minDot) {
  minDot.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  });
}

// ================= INITIAL INITIALIZATION =================
renderMode();
renderAukeraInputs();
recalculateAukera();
setApp(state.activeApp || 'pzu');

// ================= UPDATE NOTIFICATIONS & WHAT'S NEW =================
const CURRENT_VERSION = 'v1.3';
const refreshAppBtn = document.getElementById('refreshAppBtn');
const whatsNewModal = document.getElementById('whatsNewModal');
const closeModalBtn = document.getElementById('closeModalBtn');

if (refreshAppBtn) {
  refreshAppBtn.addEventListener('click', () => {
    window.location.reload();
  });
}

function checkWhatsNew() {
  const savedVersion = localStorage.getItem('app_version');
  if (savedVersion !== CURRENT_VERSION) {
    if (whatsNewModal) {
      whatsNewModal.classList.add('show');
    }
    localStorage.setItem('app_version', CURRENT_VERSION);
  }
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    whatsNewModal.classList.remove('show');
  });
}

// Show What's New if updated (slight delay for better UX)
setTimeout(checkWhatsNew, 600);

// ================= ARBITRAGE ID & ML LOGIC =================
let currentMlData = null;

async function loadMlRecommendation() {
  try {
    let data = null;
    try {
      const res = await fetch('./ida_recommendation_latest.json');
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {
      console.warn('Fetch fallback:', e);
    }
    
    // Fallback implicit
    if (!data) {
      data = {
        delivery_date: "2026-10-07",
        summary: {
          battery_cycle2_best_buy_market: "IDA2",
          battery_cycle2_best_sell_market: "PZU"
        },
        bess_cycle2_recommendations: {
          charge_slots: [
            { qh: 52, time: "12:45", price_pzu: 103.93, est_ida2: 97.53, best_buy_market: "IDA2", buy_saving_eur: 6.4 },
            { qh: 60, time: "14:45", price_pzu: 103.05, est_ida2: 101.64, best_buy_market: "IDA2", buy_saving_eur: 1.41 },
            { qh: 61, time: "15:00", price_pzu: 106.67, est_ida2: 103.66, best_buy_market: "IDA2", buy_saving_eur: 3.01 },
            { qh: 59, time: "14:30", price_pzu: 112.75, est_ida2: 108.68, best_buy_market: "IDA2", buy_saving_eur: 4.07 }
          ],
          discharge_slots: [
            { qh: 86, time: "21:15", price_pzu: 289.91, est_ida1: 280.76, best_sell_market: "PZU", sell_gain_eur: 0.0 },
            { qh: 84, time: "20:45", price_pzu: 284.66, est_ida1: 277.78, best_sell_market: "PZU", sell_gain_eur: 0.0 },
            { qh: 75, time: "18:30", price_pzu: 276.38, est_ida1: 266.26, best_sell_market: "PZU", sell_gain_eur: 0.0 },
            { qh: 87, time: "21:30", price_pzu: 274.1, est_ida1: 268.1, best_sell_market: "PZU", sell_gain_eur: 0.0 }
          ]
        }
      };
    }

    currentMlData = data;
    renderMlRecommendation(data);
  } catch (err) {
    console.error('Eroare loadMlRecommendation:', err);
  }
}

function renderMlRecommendation(data) {
  if (!arbDeliveryDate) return;
  if (data.delivery_date) {
    arbDeliveryDate.textContent = `Livrare: ${data.delivery_date}`;
  }

  const chargeSlots = data.bess_cycle2_recommendations?.charge_slots || [];
  const dischargeSlots = data.bess_cycle2_recommendations?.discharge_slots || [];

  const topBuy = chargeSlots[0] || { qh: 52, time: "12:45", price_pzu: 103.93, est_ida2: 97.53, best_buy_market: "IDA2", buy_saving_eur: 6.4 };
  const topSell = dischargeSlots[0] || { qh: 86, time: "21:15", price_pzu: 289.91, best_sell_market: "PZU" };

  if (arbRecBuyMarket) arbRecBuyMarket.textContent = topBuy.best_buy_market || 'IDA2';
  if (arbRecBuySlot) arbRecBuySlot.textContent = `${topBuy.time} (Q${topBuy.qh})`;
  const pBuyEst = topBuy.est_ida2 || topBuy.est_ida1 || topBuy.price_pzu;
  if (arbRecBuyPrice) arbRecBuyPrice.textContent = `Est: ${pBuyEst.toFixed(2)} € (PZU: ${topBuy.price_pzu.toFixed(2)} €)`;
  if (arbRecBuySaving) arbRecBuySaving.textContent = `Economie: +${(topBuy.buy_saving_eur || 0).toFixed(2)} €/MWh`;

  if (arbRecSellMarket) arbRecSellMarket.textContent = topSell.best_sell_market || 'PZU';
  if (arbRecSellSlot) arbRecSellSlot.textContent = `${topSell.time} (Q${topSell.qh})`;
  if (arbRecSellPrice) arbRecSellPrice.textContent = `Vârf: ${topSell.price_pzu.toFixed(2)} €/MWh`;
  
  const spreadEst = topSell.price_pzu - pBuyEst;
  if (arbRecCycleSpread) arbRecCycleSpread.textContent = `Spread BESS: +${spreadEst.toFixed(2)} €`;

  // Populate Table
  if (arbSlotsTableBody) {
    let rowsHtml = '';
    chargeSlots.slice(0, 4).forEach(s => {
      const bestPrice = s.est_ida2 || s.est_ida1 || s.price_pzu;
      rowsHtml += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer;" onclick="selectArbitrageSlot('BUY', '${s.time}', ${s.qh}, ${bestPrice})">
          <td style="padding: 5px;"><span style="color: #34d399; font-weight: 700;">BUY</span></td>
          <td style="padding: 5px; color: #fff;">${s.time} (Q${s.qh})</td>
          <td style="padding: 5px; color: var(--text-dim);">${s.price_pzu.toFixed(2)} €</td>
          <td style="padding: 5px;"><span style="background: rgba(16,185,129,0.2); color: #34d399; padding: 1px 4px; border-radius: 3px; font-weight: 700;">${s.best_buy_market} ${bestPrice.toFixed(2)} €</span></td>
          <td style="padding: 5px; text-align: right; color: #34d399; font-weight: 700;">+${(s.buy_saving_eur || 0).toFixed(2)} €</td>
        </tr>
      `;
    });
    dischargeSlots.slice(0, 4).forEach(s => {
      const bestPrice = s.price_pzu;
      rowsHtml += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer;" onclick="selectArbitrageSlot('SELL', '${s.time}', ${s.qh}, ${bestPrice})">
          <td style="padding: 5px;"><span style="color: #38bdf8; font-weight: 700;">SELL</span></td>
          <td style="padding: 5px; color: #fff;">${s.time} (Q${s.qh})</td>
          <td style="padding: 5px; color: var(--text-dim);">${s.price_pzu.toFixed(2)} €</td>
          <td style="padding: 5px;"><span style="background: rgba(56,189,248,0.2); color: #38bdf8; padding: 1px 4px; border-radius: 3px; font-weight: 700;">${s.best_sell_market} ${bestPrice.toFixed(2)} €</span></td>
          <td style="padding: 5px; text-align: right; color: #38bdf8; font-weight: 700;">Vârf</td>
        </tr>
      `;
    });
    arbSlotsTableBody.innerHTML = rowsHtml;
  }
}

window.selectArbitrageSlot = function(type, time, qh, price) {
  if (type === 'BUY') {
    state.arbitrageData.qhBuy = `Q${qh} (${time})`;
    state.arbitrageData.priceBuy = price;
  } else {
    state.arbitrageData.qhSell = `Q${qh} (${time})`;
    state.arbitrageData.priceSell = price;
  }
  saveData();
  renderArbitrageInputs();
  recalculateArbitrage();
};

function renderArbitrageInputs() {
  if (!arbQhBuyInput) return;
  const d = state.arbitrageData;
  arbQhBuyInput.value = d.qhBuy || '';
  arbQhSellInput.value = d.qhSell || '';
  arbPriceBuyInput.value = d.priceBuy || '';
  arbPriceSellInput.value = d.priceSell || '';
  arbQtyMwInput.value = d.qtyMw || '';
}

function updateArbitrageData() {
  if (!arbQhBuyInput) return;
  state.arbitrageData.qhBuy = arbQhBuyInput.value;
  state.arbitrageData.qhSell = arbQhSellInput.value;
  state.arbitrageData.priceBuy = parseFloat(arbPriceBuyInput.value) || 0;
  state.arbitrageData.priceSell = parseFloat(arbPriceSellInput.value) || 0;
  state.arbitrageData.qtyMw = parseFloat(arbQtyMwInput.value) || 0;
  saveData();
  recalculateArbitrage();
}

function recalculateArbitrage() {
  if (!arbSpreadDisplay) return;
  const d = state.arbitrageData;
  if (typeof calculateArbitrageID !== 'function') return;

  const result = calculateArbitrageID(d);

  arbSpreadDisplay.textContent = formatCurrency(result.spread) + ' / MWh';
  arbEnergyInDisplay.textContent = formatMwh(result.energyIn) + ' MWh';
  arbEnergyOutDisplay.textContent = formatMwh(result.energyOut) + ' MWh';
  
  if (result.isProfit) {
    arbProfitDisplay.className = 'text-profit';
    arbProfitDisplay.style.color = '#34d399';
    arbProfitDisplay.textContent = formatCurrency(result.profitEur);
  } else if (result.isLoss) {
    arbProfitDisplay.className = 'text-loss';
    arbProfitDisplay.style.color = '#f87171';
    arbProfitDisplay.textContent = formatCurrency(result.profitEur);
  } else {
    arbProfitDisplay.className = '';
    arbProfitDisplay.style.color = '#fff';
    arbProfitDisplay.textContent = '0,00 €';
  }
}

// Bind arbitrage inputs
[arbQhBuyInput, arbQhSellInput, arbPriceBuyInput, arbPriceSellInput, arbQtyMwInput].forEach(inp => {
  if (inp) inp.addEventListener('input', updateArbitrageData);
});

if (arbApplyMlBtn) {
  arbApplyMlBtn.addEventListener('click', () => {
    if (!currentMlData) return;
    const topBuy = currentMlData.bess_cycle2_recommendations?.charge_slots?.[0];
    const topSell = currentMlData.bess_cycle2_recommendations?.discharge_slots?.[0];
    if (topBuy) {
      state.arbitrageData.qhBuy = `Q${topBuy.qh} (${topBuy.time})`;
      state.arbitrageData.priceBuy = topBuy.est_ida2 || topBuy.est_ida1 || topBuy.price_pzu;
    }
    if (topSell) {
      state.arbitrageData.qhSell = `Q${topSell.qh} (${topSell.time})`;
      state.arbitrageData.priceSell = topSell.price_pzu;
    }
    saveData();
    renderArbitrageInputs();
    recalculateArbitrage();
  });
}

async function triggerPipelineRun() {
  if (arbRefreshIcon) arbRefreshIcon.classList.add('spin-active');
  if (arbRefreshIconMain) arbRefreshIconMain.classList.add('spin-active');
  if (arbRunBtnText) arbRunBtnText.textContent = 'Rulează...';
  if (arbRunMainText) arbRunMainText.textContent = 'Se rulează...';

  try {
    // 1. Daca ruleaza in Electron nativ
    if (window.electronAPI && typeof window.electronAPI.runIdaPipeline === 'function') {
      await window.electronAPI.runIdaPipeline();
    }
    // 2. Reincarca recomandarea cu cache-busting
    await loadMlRecommendation();

    // 3. Feedback vizual
    const toast = document.getElementById('successUpdateToast');
    if (toast) {
      toast.textContent = '✅ Analiză Arbitraj IDA actualizată cu succes!';
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3500);
    }
  } catch (err) {
    console.error('Eroare triggerPipelineRun:', err);
  } finally {
    if (arbRefreshIcon) arbRefreshIcon.classList.remove('spin-active');
    if (arbRefreshIconMain) arbRefreshIconMain.classList.remove('spin-active');
    if (arbRunBtnText) arbRunBtnText.textContent = 'Rulează';
    if (arbRunMainText) arbRunMainText.textContent = 'Actualizează IDA';
  }
}

if (arbRunPipelineBtn) arbRunPipelineBtn.addEventListener('click', triggerPipelineRun);
if (arbRunPipelineMainBtn) arbRunPipelineMainBtn.addEventListener('click', triggerPipelineRun);

// Old arbitrage inputs and BRM scanner logic removed

// ================= TRANSELECTRICA SYSTEM STATE LOGIC =================
const sysCurrentQh = document.getElementById('sysCurrentQh');
const sysImbalance = document.getElementById('sysImbalance');
const sysStatus = document.getElementById('sysStatus');
const sysMarginalDeficit = document.getElementById('sysMarginalDeficit');
const sysMarginalSurplus = document.getElementById('sysMarginalSurplus');
const sysRecommendationText = document.getElementById('sysRecommendationText');
const sysRecommendationBox = document.getElementById('sysRecommendationBox');
const sysVolUp = document.getElementById('sysVolUp');
const sysVolDown = document.getElementById('sysVolDown');

function updateTranselectricaState(data) {
  if(!sysCurrentQh) return;
  sysCurrentQh.textContent = `Sfert Curent: ${data.qh}`;
  
  if(sysVolUp) sysVolUp.textContent = data.volUp !== "N/A" ? `${data.volUp} MW` : "N/A";
  if(sysVolDown) sysVolDown.textContent = data.volDown !== "N/A" ? `${data.volDown} MW` : "N/A";

  if (data.imbalanceMw === "N/A") {
      sysImbalance.textContent = `În așteptare...`;
      sysStatus.textContent = 'DATE INDISPONIBILE';
      sysStatus.style.color = 'var(--text-dim)';
      sysImbalance.style.color = 'var(--text-dim)';
      sysMarginalDeficit.textContent = '- €/MWh';
      sysMarginalSurplus.textContent = '- €/MWh';
      sysRecommendationBox.style.background = 'rgba(255,255,255,0.05)';
      sysRecommendationBox.style.borderLeftColor = 'var(--text-dim)';
      sysRecommendationText.textContent = 'Transelectrica încă nu a publicat datele pentru acest sfert de oră.';
      return;
  }
  
  const isSurplus = data.imbalanceMw > 0;
  
  sysImbalance.textContent = `${data.imbalanceMw > 0 ? '+' : ''}${data.imbalanceMw} MW`;
  
  if(isSurplus) {
      sysStatus.textContent = 'EXCEDENT (Surplus)';
      sysStatus.style.color = '#10b981'; // Green
      sysImbalance.style.color = '#10b981';
      
      sysRecommendationBox.style.background = 'rgba(16, 185, 129, 0.1)';
      sysRecommendationBox.style.borderLeftColor = '#10b981';
      sysRecommendationText.textContent = 'Prețurile ID vor tinde să SCADĂ. Așteaptă pentru Buy sau Vinde acum dacă ai preț bun.';
  } else {
      sysStatus.textContent = 'DEFICIT';
      sysStatus.style.color = 'var(--text-loss)'; // Red
      sysImbalance.style.color = 'var(--text-loss)';
      
      sysRecommendationBox.style.background = 'rgba(239, 68, 68, 0.1)';
      sysRecommendationBox.style.borderLeftColor = 'var(--text-loss)';
      sysRecommendationText.textContent = 'Prețurile ID vor tinde să CREASCĂ. Cumpără acum sau Așteaptă pentru a vinde mai scump.';
  }

  sysMarginalDeficit.textContent = data.priceDeficit === "N/A" ? "N/A" : `${data.priceDeficit.toFixed(2)} €/MWh`;
  sysMarginalSurplus.textContent = data.priceSurplus === "N/A" ? "N/A" : `${data.priceSurplus.toFixed(2)} €/MWh`;
}

// Procesare date live de la Vercel API (care face fetch la Transelectrica)
async function fetchLiveTranselectrica() {
  if (state.activeApp !== 'id-arbitrage') return;
  
  try {
    // Folosim linkul absolut către Vercel, astfel încât să meargă și din aplicația Desktop (Electron) locală
    const res = await fetch('https://pptcalc.vercel.app/api/transelectrica');
    if (!res.ok) throw new Error('API fetch failed');
    const data = await res.json();
    
    if (!data.itemList || data.itemList.length === 0) return;
    
    // Găsim sfertul de oră curent (cel mai recent raportat, sau bazat pe timestamp)
    // Pentru siguranță, luăm ultimul element din listă care conține date
    // Sortăm descrescător după "from" ca să fim siguri că primul e cel mai recent
    const sorted = data.itemList.sort((a, b) => new Date(b.timeInterval.from) - new Date(a.timeInterval.from));
    
    // 1. Căutăm sfertul care se suprapune cu ORA EXACTĂ a PC-ului
    const now = new Date();
    let currentQh = sorted.find(item => {
      const from = new Date(item.timeInterval.from);
      const to = new Date(item.timeInterval.to);
      return now >= from && now < to;
    });
    
    // Fallback: Dacă ceasul PC-ului e dereglat sau Transelectrica nu a scos încă lista
    if (!currentQh) {
      currentQh = sorted[0];
    }
    
    if (currentQh) {
      const qhNum = currentQh.ISP || 1; // 1-96
      const hr = currentQh.hour || 1; // 1-24
      const displayQh = `H${hr.toString().padStart(2, '0')} Q${(qhNum % 4) === 0 ? 4 : (qhNum % 4)}`;

      // Prețurile Marginale pot veni din aFRR_Up/Down (Marginal Prices Overview) 
      // sau fallback pe estimatedPrice (dacă aFRR nu e încă publicat pentru sfertul respectiv)
      const deficitPrice = currentQh.aFRR_Up !== null ? currentQh.aFRR_Up : (currentQh.estimatedPricePositiveImbalance || 0);
      const surplusPrice = currentQh.aFRR_Down !== null ? currentQh.aFRR_Down : (currentQh.estimatedPriceNegativeImbalance || 0);
      
      const rawImbalance = currentQh.estimatedSystemImbalance;
      const parsedImbalance = (rawImbalance === "N/A" || rawImbalance === null) ? "N/A" : parseFloat(rawImbalance);

      updateTranselectricaState({
          qh: displayQh,
          imbalanceMw: parsedImbalance,
          priceDeficit: deficitPrice === "N/A" ? "N/A" : parseFloat(deficitPrice),
          priceSurplus: surplusPrice === "N/A" ? "N/A" : parseFloat(surplusPrice),
          volUp: currentQh.sumQup !== null ? currentQh.sumQup : "N/A",
          volDown: currentQh.sumQdn !== null ? currentQh.sumQdn : "N/A"
      });
    }
  } catch (error) {
    console.error("Failed to load Transelectrica live data:", error);
  }
}

// Actualizare o dată la minut
setInterval(fetchLiveTranselectrica, 60000); 

// Inițializare la pornire tab
setTimeout(fetchLiveTranselectrica, 1000);

// Popup temporar pentru confirmare update (Vercel)
setTimeout(() => {
    const toast = document.getElementById('successUpdateToast');
    if(toast) {
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }
}, 1500);

