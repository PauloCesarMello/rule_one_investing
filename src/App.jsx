import { useState } from 'react';
import SearchBar from './components/SearchBar';
import CompanyHeader from './components/CompanyHeader';
import BigFiveTable from './components/BigFiveTable';
import BigFiveCharts from './components/BigFiveCharts';
import StickerPrice from './components/StickerPrice';
import About from './components/About';
import { getQuote, getCompanyProfile, getBasicFinancials, getFinancials } from './services/finnhub';
import { calculateStickerPrice } from './utils/calculations';
import './App.css';

export default function App() {
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSearch(symbol) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const [quote, profile, metrics, cashFlowData, incomeData, balanceData] = await Promise.all([
        getQuote(symbol),
        getCompanyProfile(symbol),
        getBasicFinancials(symbol),
        getFinancials(symbol, 'cf'),
        getFinancials(symbol, 'ic'),
        getFinancials(symbol, 'bs'),
      ]);

      if (!profile || !profile.name) {
        throw new Error(`No data found for ticker "${symbol}". Check the symbol and try again.`);
      }

      const m = metrics.metric || {};
      const series = metrics.series?.annual || {};

      const roicGrowth = computeGrowthFromSeries(series.roic || series.roa, 10);
      const salesGrowth = computeGrowthFromSeries(series.salesPerShare, 10)
        ?? computeGrowthFromMetric(m, 'revenueGrowth5Y', m.revenueGrowthTTMYoy);
      const epsGrowth = computeGrowthFromSeries(series.eps, 10)
        ?? computeGrowthFromMetric(m, 'epsGrowth5Y', m.epsGrowthTTMYoy);
      const equityGrowth = computeGrowthFromSeries(series.bookValue, 10);
      const ocfGrowth = computeOCFGrowth(cashFlowData, 10);

      const currentEPS = m.epsBasicExclExtraItemsTTM || m.epsInclExtraItemsTTM || m.epsTTM || null;
      const historicalGrowth = epsGrowth ?? 10;
      const peRatio = m.peTTM || m.peBasicExclExtraTTM || 15;
      const pricing = calculateStickerPrice(currentEPS, historicalGrowth, peRatio);

      setResult({
        profile,
        currentPrice: quote.c,
        bigFive: {
          roic: roicGrowth,
          sales: salesGrowth,
          eps: epsGrowth,
          equity: equityGrowth,
          ocf: ocfGrowth,
        },
        chartData: alignChartYears({
          sales: extractFromStatements(incomeData, 'ic', /^us-gaap_Revenue/i, 'Sales ($M)', 10),
          netIncome: extractFromStatements(incomeData, 'ic', /NetIncomeLoss$/i, 'Net Income ($M)', 10),
          roic: formatSeries(series.roic || series.roa, 'ROIC (%)', 10, true),
          equity: extractFromStatements(balanceData, 'bs', /(?<![a-z])StockholdersEquity$/i, 'Total Equity ($M)', 10),
          debt: extractFromStatements(balanceData, 'bs', /LongTermDebtAndCapitalLeaseObligations$/i, 'Long Term Debt ($M)', 10),
        }),
        pricing,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Rule #1 Investing</h1>
        <p>Stock Analyzer</p>
        <nav className="app-nav">
          <button
            className={`nav-link ${page === 'home' ? 'nav-active' : ''}`}
            onClick={() => setPage('home')}
          >
            Analyzer
          </button>
          <button
            className={`nav-link ${page === 'about' ? 'nav-active' : ''}`}
            onClick={() => setPage('about')}
          >
            About
          </button>
        </nav>
      </header>

      <main>
        {page === 'about' ? (
          <About />
        ) : (
          <>
            <SearchBar onSearch={handleSearch} loading={loading} />

            {error && <div className="error-message">{error}</div>}

            {result && (
              <div className="results">
                <CompanyHeader profile={result.profile} />
                <BigFiveTable bigFive={result.bigFive} />
                <BigFiveCharts chartData={result.chartData} />
                <StickerPrice
                  pricing={result.pricing}
                  currentPrice={result.currentPrice}
                  companyName={result.profile?.name}
                />
              </div>
            )}

            {!result && !loading && !error && (
              <div className="welcome">
                <h2>How It Works</h2>
                <p>
                  Enter a stock ticker symbol above to analyze a company using Phil Town's
                  Rule #1 investing methodology. We'll calculate the Big Five growth rates
                  and determine if the stock is trading below its Margin of Safety price.
                </p>
                <div className="welcome-metrics">
                  <div><strong>ROIC</strong> — Return on Invested Capital</div>
                  <div><strong>Sales</strong> — Revenue Growth</div>
                  <div><strong>EPS</strong> — Earnings Per Share Growth</div>
                  <div><strong>Equity</strong> — Book Value Per Share Growth</div>
                  <div><strong>OCF</strong> — Operating Cash Flow Growth</div>
                </div>
                <p className="welcome-note">Each metric should show at least 10% annual growth over 10 years.</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer>
        <p>Data provided by Finnhub. Not financial advice.</p>
      </footer>
    </div>
  );
}

function computeGrowthFromSeries(seriesData, years) {
  if (!seriesData || seriesData.length < 2) return null;
  const sorted = [...seriesData].sort((a, b) => (a.period || '').localeCompare(b.period || ''));
  const values = sorted.map((d) => d.v).filter((v) => v != null && v > 0);
  if (values.length < 2) return null;
  const n = Math.min(values.length - 1, years);
  const start = values[values.length - 1 - n];
  const end = values[values.length - 1];
  if (start <= 0 || end <= 0) return null;
  return (Math.pow(end / start, 1 / n) - 1) * 100;
}

function alignChartYears(chartData) {
  const allSeries = Object.values(chartData).filter(Boolean);
  if (allSeries.length === 0) return chartData;

  // Find the common set of years that exist in ALL charts
  const yearSets = allSeries.map((s) => new Set(s.data.map((d) => d.year)));
  const commonYears = [...yearSets[0]]
    .filter((y) => yearSets.every((set) => set.has(y)))
    .sort();

  // If strict intersection is too small, fall back to trimming to the shortest length
  if (commonYears.length < 2) {
    const minLen = Math.min(...allSeries.map((s) => s.data.length));
    const aligned = {};
    for (const [key, series] of Object.entries(chartData)) {
      if (!series) { aligned[key] = null; continue; }
      aligned[key] = { ...series, data: series.data.slice(-minLen) };
    }
    return aligned;
  }

  const aligned = {};
  for (const [key, series] of Object.entries(chartData)) {
    if (!series) { aligned[key] = null; continue; }
    aligned[key] = {
      ...series,
      data: series.data.filter((d) => commonYears.includes(d.year)),
    };
  }
  return aligned;
}

function formatSeries(seriesData, label, maxYears, isPercent = false) {
  if (!seriesData || seriesData.length < 2) return null;
  const sorted = [...seriesData].sort((a, b) => (a.period || '').localeCompare(b.period || ''));
  const recent = sorted.slice(-Math.min(sorted.length, maxYears + 1));
  return {
    label,
    data: recent.map((d) => ({
      year: d.period?.substring(0, 4) || '',
      value: isPercent ? +(d.v * 100).toFixed(2) : +d.v?.toFixed(2),
    })),
  };
}

function extractFromStatements(financialData, statementKey, conceptPattern, label, maxYears) {
  if (!financialData?.data) return null;
  const seen = new Set();
  const byYear = financialData.data
    .map((report) => {
      const rows = report.report?.[statementKey] || [];
      const item = rows.find((r) => conceptPattern.test(r.concept));
      if (item?.value == null) return null;
      return { year: String(report.year), value: +(item.value / 1e6).toFixed(0) };
    })
    .filter((d) => {
      if (!d || seen.has(d.year)) return false;
      seen.add(d.year);
      return true;
    })
    .sort((a, b) => a.year.localeCompare(b.year));
  const recent = byYear.slice(-Math.min(byYear.length, maxYears + 1));
  if (recent.length < 2) return null;
  return { label, data: recent };
}

function computeGrowthFromMetric(metrics, fiveYearKey, ttmYoy) {
  if (metrics[fiveYearKey] != null) return metrics[fiveYearKey];
  if (ttmYoy != null) return ttmYoy;
  return null;
}

function computeOCFGrowth(cashFlowData, years) {
  if (!cashFlowData?.data || cashFlowData.data.length < 2) return null;

  const ocfByYear = cashFlowData.data
    .map((report) => {
      const rows = report.report?.cf || [];
      const operatingCF = rows.find((r) =>
        r.concept.match(/NetCashProvidedByUsedInOperatingActivities$/i)
      );
      if (operatingCF?.value == null) return null;
      return { year: report.year, ocf: operatingCF.value };
    })
    .filter((d) => d != null)
    .sort((a, b) => a.year - b.year);

  const positive = ocfByYear.filter((d) => d.ocf > 0);
  if (positive.length < 2) return null;

  const n = Math.min(positive.length - 1, years);
  const start = positive[positive.length - 1 - n].ocf;
  const end = positive[positive.length - 1].ocf;
  if (start <= 0 || end <= 0) return null;
  return (Math.pow(end / start, 1 / n) - 1) * 100;
}
