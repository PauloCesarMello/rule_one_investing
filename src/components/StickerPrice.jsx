export default function StickerPrice({ pricing, currentPrice, companyName }) {
  if (!pricing) {
    return (
      <div className="card">
        <h2>Sticker Price</h2>
        <p className="na-message">Insufficient data to calculate sticker price.</p>
      </div>
    );
  }

  const mosPrice = parseFloat(pricing.marginOfSafety);
  const price = parseFloat(currentPrice);
  const isBuyable = price > 0 && price <= mosPrice;

  return (
    <div className="card">
      <h2>Sticker Price Analysis</h2>
      {companyName && <p className="card-subtitle">{companyName}</p>}

      <div className="pricing-grid">
        <div className="pricing-item">
          <span className="pricing-label">Current Price</span>
          <span className="pricing-value">${price.toFixed(2)}</span>
        </div>
        <div className="pricing-item">
          <span className="pricing-label">Future EPS (10yr)</span>
          <span className="pricing-value">${pricing.futureEPS}</span>
        </div>
        <div className="pricing-item">
          <span className="pricing-label">Future PE Ratio</span>
          <span className="pricing-value">{pricing.futurePE}x</span>
        </div>
        <div className="pricing-item">
          <span className="pricing-label">Future Price (10yr)</span>
          <span className="pricing-value">${pricing.futurePrice}</span>
        </div>
        <div className="pricing-item highlight">
          <span className="pricing-label">Sticker Price</span>
          <span className="pricing-value">${pricing.stickerPrice}</span>
        </div>
        <div className="pricing-item highlight-mos">
          <span className="pricing-label">Margin of Safety (50%)</span>
          <span className="pricing-value">${pricing.marginOfSafety}</span>
        </div>
      </div>

      <div className={`verdict ${isBuyable ? 'verdict-buy' : 'verdict-wait'}`}>
        {isBuyable
          ? `At $${price.toFixed(2)}, this stock is BELOW the MOS price of $${pricing.marginOfSafety} — consider buying!`
          : `At $${price.toFixed(2)}, this stock is ABOVE the MOS price of $${pricing.marginOfSafety} — wait for a better price.`}
      </div>
    </div>
  );
}
