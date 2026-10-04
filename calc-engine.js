/**
 * Core mathematical engine for Switch PZU ↔ ID calculations.
 * Exactly replicates the formulas from Switch_PZU_ID_cazuri_independente.xlsx
 */

function calculateSwitch({ mode, pzuPrice, idClosePrice, idNewPrice, interval, quantityMw }) {
  const pzu = parseFloat(pzuPrice) || 0;
  const idClose = parseFloat(idClosePrice) || 0;
  const idNew = parseFloat(idNewPrice) || 0;
  const qty = parseFloat(quantityMw) || 0;
  const factor = interval === '15m' ? 0.25 : 1.0;

  let spreadClose = 0;
  let netBenefit = 0;
  let effectivePrice = 0;

  if (mode === 'BUY') {
    // CUMPĂRARE PZU → ID
    // Spread închidere = Preț SELL ID / închidere - Preț BUY PZU
    spreadClose = idClose - pzu;
    // Beneficiu net switch = Preț SELL ID / închidere - Preț BUY ID nou
    netBenefit = idClose - idNew;
    // Preț efectiv BUY după switch = Preț BUY PZU - Preț SELL ID + Preț BUY ID nou
    effectivePrice = pzu - idClose + idNew;
  } else {
    // VÂNZARE PZU → ID
    // Spread închidere = Preț SELL PZU - Preț BUY ID / închidere
    spreadClose = pzu - idClose;
    // Beneficiu net switch = Preț SELL ID nou - Preț BUY ID / închidere
    netBenefit = idNew - idClose;
    // Preț efectiv SELL după switch = Preț SELL PZU - Preț BUY ID + Preț SELL ID nou
    effectivePrice = pzu - idClose + idNew;
  }

  const energyMwh = qty * factor;
  const finalGainEur = netBenefit * energyMwh;

  return {
    spreadClose: round2(spreadClose),
    netBenefit: round2(netBenefit),
    effectivePrice: round2(effectivePrice),
    energyMwh: round4(energyMwh),
    finalGainEur: round2(finalGainEur),
    isProfit: finalGainEur > 0,
    isLoss: finalGainEur < 0
  };
}

/**
 * Mathematical engine for Aukera BESS Minimum Spread Calculator.
 * Exactly replicates formulas from Spread_calculator_Aukera.xlsx
 */
function calculateAukeraSpread({ pBuy, quantity, rte, lossCost, targetMargin = 10, ronRate = 5.3 }) {
  const pBuyVal = parseFloat(pBuy) || 0;
  const qVal = parseFloat(quantity) || 0;
  // If user entered rte as e.g. 85, convert to 0.85; if entered as 0.85, keep it
  let rteVal = parseFloat(rte) || 0;
  if (rteVal > 1) {
    rteVal = rteVal / 100;
  }
  if (rteVal <= 0) rteVal = 0.85; // safeguard against div by zero

  const lossCostVal = parseFloat(lossCost) || 0;
  const marginVal = parseFloat(targetMargin) || 0;
  const rate = parseFloat(ronRate) || 5.3;

  const energyLost = qVal * (1 - rteVal);
  const deliverableEnergy = qVal * rteVal;
  const totalPurchaseCost = qVal * pBuyVal;
  const lossCostTotal = energyLost * lossCostVal;
  const totalCost = totalPurchaseCost + lossCostTotal;

  // P_sell_min = [P_buy + (1 - RTE) * C_loss] / RTE = totalCost / deliverableEnergy (Break-Even)
  const pSellMin = deliverableEnergy > 0 ? (totalCost / deliverableEnergy) : 0;
  const spreadMin = pSellMin - pBuyVal;

  // Target Selling Price with Profit Margin
  const pSellTarget = pSellMin + marginVal;
  const spreadTarget = pSellTarget - pBuyVal;
  const totalRevenue = deliverableEnergy * pSellTarget;
  const netProfitTotal = deliverableEnergy * marginVal;

  // Comparison without loss cost
  const pSellMinNoLoss = rteVal > 0 ? (pBuyVal / rteVal) : 0;
  const spreadMinNoLoss = pSellMinNoLoss - pBuyVal;

  // RON equivalents
  const pBuyRon = pBuyVal * rate;
  const pSellMinRon = pSellMin * rate;
  const pSellTargetRon = pSellTarget * rate;

  return {
    pBuy: round2(pBuyVal),
    targetMargin: round2(marginVal),
    energyLost: round4(energyLost),
    deliverableEnergy: round4(deliverableEnergy),
    totalPurchaseCost: round2(totalPurchaseCost),
    lossCostTotal: round2(lossCostTotal),
    totalCost: round2(totalCost),
    totalRevenue: round2(totalRevenue),
    netProfitTotal: round2(netProfitTotal),
    pSellMin: round2(pSellMin),
    spreadMin: round2(spreadMin),
    pSellTarget: round2(pSellTarget),
    spreadTarget: round2(spreadTarget),
    pSellMinNoLoss: round2(pSellMinNoLoss),
    spreadMinNoLoss: round2(spreadMinNoLoss),
    pBuyRon: round2(pBuyRon),
    pSellMinRon: round2(pSellMinRon),
    pSellTargetRon: round2(pSellTargetRon),
    rtePercent: round2(rteVal * 100)
  };
}

function round2(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

function round4(val) {
  return Math.round((val + Number.EPSILON) * 10000) / 10000;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateSwitch, calculateAukeraSpread, round2, round4 };
}
