const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub API error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function getQuote(symbol) {
  return fetchJson(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
}

export async function getCompanyProfile(symbol) {
  return fetchJson(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`);
}

export async function getBasicFinancials(symbol) {
  return fetchJson(`${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`);
}

export async function getFinancials(symbol, statement, freq = 'annual') {
  return fetchJson(
    `${BASE_URL}/stock/financials-reported?symbol=${symbol}&statement=${statement}&freq=${freq}&token=${API_KEY}`
  );
}
