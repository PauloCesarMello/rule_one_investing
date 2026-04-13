export function compoundGrowthRate(startValue, endValue, years) {
  if (!startValue || startValue <= 0 || !endValue || endValue <= 0 || !years) return null;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

export function calculateGrowthRates(values) {
  if (!values || values.length < 2) return null;
  const clean = values.filter((v) => v != null && v > 0);
  if (clean.length < 2) return null;
  const years = clean.length - 1;
  return compoundGrowthRate(clean[0], clean[clean.length - 1], years);
}

export function extractAnnualValues(financialData, key, maxYears = 10) {
  if (!financialData?.data) return [];
  const reports = financialData.data
    .slice(0, maxYears + 1)
    .reverse();

  return reports.map((report) => {
    const rows = report.report?.ic || report.report?.bs || report.report?.cf || [];
    const item = rows.find((r) => r.concept === key);
    return item ? item.value : null;
  });
}

export function calculateROIC(netIncome, totalEquity, totalDebt) {
  if (!netIncome?.length || !totalEquity?.length) return null;
  const roicValues = [];
  const len = Math.min(netIncome.length, totalEquity.length);
  for (let i = 0; i < len; i++) {
    const equity = totalEquity[i] || 0;
    const debt = totalDebt?.[i] || 0;
    const investedCapital = equity + debt;
    if (investedCapital > 0 && netIncome[i] != null) {
      roicValues.push((netIncome[i] / investedCapital) * 100);
    }
  }
  if (roicValues.length < 2) return null;
  return compoundGrowthRate(roicValues[0], roicValues[roicValues.length - 1], roicValues.length - 1);
}

export function calculateStickerPrice(currentEPS, epsGrowthRate, defaultPE) {
  if (!currentEPS || currentEPS <= 0 || !epsGrowthRate) return null;

  const growthRate = Math.min(epsGrowthRate, 15) / 100;
  const futureEPS = currentEPS * Math.pow(1 + growthRate, 10);
  const futurePE = Math.min(epsGrowthRate * 2, defaultPE || 15);
  const futurePrice = futureEPS * futurePE;
  const minAcceptableReturn = 0.15;
  const stickerPrice = futurePrice / Math.pow(1 + minAcceptableReturn, 10);

  return {
    futureEPS: futureEPS.toFixed(2),
    futurePE: futurePE.toFixed(1),
    futurePrice: futurePrice.toFixed(2),
    stickerPrice: stickerPrice.toFixed(2),
    marginOfSafety: (stickerPrice / 2).toFixed(2),
  };
}

export function passFail(rate) {
  if (rate == null) return 'N/A';
  return rate >= 10 ? 'PASS' : 'FAIL';
}
