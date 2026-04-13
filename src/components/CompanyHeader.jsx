export default function CompanyHeader({ profile }) {
  if (!profile) return null;

  return (
    <div className="company-header">
      {profile.logo && <img src={profile.logo} alt={profile.name} className="company-logo" />}
      <div>
        <h1>{profile.name} ({profile.ticker})</h1>
        <p className="company-meta">
          {profile.finnhubIndustry} &middot; {profile.exchange} &middot; Market Cap: $
          {(profile.marketCapitalization / 1000).toFixed(1)}B
        </p>
      </div>
    </div>
  );
}
