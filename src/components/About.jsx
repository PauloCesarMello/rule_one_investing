export default function About() {
  return (
    <div className="about">
      <div className="card">
        <h2>About Rule #1 Investing Analyzer</h2>
        <p>
          This tool analyzes stocks using Phil Town's Rule #1 investing methodology.
          It evaluates companies based on the "Big Five" growth metrics and calculates
          a Sticker Price to determine if a stock is trading at a discount.
        </p>
      </div>

      <div className="card">
        <h2>The Big Five Growth Rates</h2>
        <p className="card-subtitle">
          Each metric must show at least 10% compound annual growth over 10 years
        </p>

        <div className="about-metric">
          <h3>1. ROIC (Return on Invested Capital)</h3>
          <p>
            Measures how effectively a company turns its invested capital into profits.
          </p>
          <div className="about-formula">
            <strong>ROIC</strong> = Net Income / (Total Equity + Total Debt)
          </div>
          <p>
            We pull annual ROIC values from Finnhub's metric series and compute the
            compound annual growth rate (CAGR) over up to 10 years. If ROIC data is
            unavailable, Return on Assets (ROA) is used as a fallback.
          </p>
        </div>

        <div className="about-metric">
          <h3>2. Sales (Revenue) Growth</h3>
          <p>
            Tracks how fast a company is growing its top-line revenue.
          </p>
          <p>
            We compute the CAGR of sales per share from Finnhub's annual metric
            series over up to 10 years. If series data is unavailable, the
            pre-calculated 5-year revenue growth rate or TTM year-over-year growth
            is used as a fallback.
          </p>
        </div>

        <div className="about-metric">
          <h3>3. EPS (Earnings Per Share) Growth</h3>
          <p>
            Measures growth in the company's profit allocated to each outstanding share.
          </p>
          <p>
            We compute the CAGR of EPS from Finnhub's annual metric series over up
            to 10 years. If series data is unavailable, the pre-calculated 5-year
            EPS growth rate or TTM year-over-year growth is used as a fallback.
            This historical EPS growth rate is also used for the Sticker Price
            calculation.
          </p>
        </div>

        <div className="about-metric">
          <h3>4. Equity (Book Value Per Share) Growth</h3>
          <p>
            Tracks how the company's net asset value per share is growing over time.
            Consistent equity growth indicates the company is reinvesting profits
            effectively.
          </p>
          <p>
            We pull annual book value per share from Finnhub's metric series and
            compute the CAGR over up to 10 years.
          </p>
        </div>

        <div className="about-metric">
          <h3>5. Operating Cash Flow Growth</h3>
          <p>
            Measures growth in the cash a company generates from its core business
            operations.
          </p>
          <p>
            We fetch annual cash flow statements from Finnhub's reported financials
            and extract net operating cash flow
            (NetCashProvidedByUsedInOperatingActivities) for each year. The CAGR is
            then computed over up to 10 years of positive values.
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Growth Rate Calculation (CAGR)</h2>
        <p>
          All growth rates are calculated as Compound Annual Growth Rates:
        </p>
        <div className="about-formula">
          <strong>CAGR</strong> = (End Value / Start Value)<sup>1/n</sup> - 1
        </div>
        <p>
          Where <em>n</em> is the number of years between the start and end values
          (up to 10 years). Only positive values are included in the calculation.
        </p>
      </div>

      <div className="card">
        <h2>Sticker Price Calculation</h2>
        <p className="card-subtitle">
          Determines the maximum price you should pay for a stock
        </p>

        <div className="about-steps">
          <div className="about-step">
            <h3>Step 1: Estimate Future EPS</h3>
            <p>
              Project current EPS forward 10 years using the EPS growth rate (capped at 15%).
            </p>
            <div className="about-formula">
              <strong>Future EPS</strong> = Current EPS x (1 + Growth Rate)<sup>10</sup>
            </div>
          </div>

          <div className="about-step">
            <h3>Step 2: Estimate Future PE Ratio</h3>
            <p>
              The future PE is estimated as 2x the EPS growth rate, or the historical
              PE ratio, whichever is lower. This is conservative — it avoids
              overpaying by using the more modest valuation.
            </p>
            <div className="about-formula">
              <strong>Future PE</strong> = min(EPS Growth Rate x 2, Historical PE)
            </div>
          </div>

          <div className="about-step">
            <h3>Step 3: Calculate Future Price</h3>
            <div className="about-formula">
              <strong>Future Price</strong> = Future EPS x Future PE
            </div>
          </div>

          <div className="about-step">
            <h3>Step 4: Calculate Sticker Price</h3>
            <p>
              Discount the future price back to today using a 15% minimum acceptable
              rate of return (MARR).
            </p>
            <div className="about-formula">
              <strong>Sticker Price</strong> = Future Price / (1 + 0.15)<sup>10</sup>
            </div>
          </div>

          <div className="about-step">
            <h3>Step 5: Margin of Safety Price</h3>
            <p>
              Apply a 50% margin of safety to protect against errors in estimation.
            </p>
            <div className="about-formula">
              <strong>MOS Price</strong> = Sticker Price / 2
            </div>
            <p>
              If the current stock price is below the MOS price, the stock may be a
              good buy. If it's above, wait for a better price.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Data Source</h2>
        <p>
          All financial data is provided by the <strong>Finnhub API</strong>, including
          stock quotes, company profiles, key financial metrics, and SEC-reported
          financial statements. Data availability varies by company and may not cover
          the full 10-year period for all metrics.
        </p>
      </div>

      <div className="card">
        <h2>Disclaimer</h2>
        <p>
          This tool is for educational and informational purposes only. It is not
          financial advice. Always do your own research and consult a qualified
          financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  );
}
