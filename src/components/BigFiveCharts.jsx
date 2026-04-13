import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function TrendChart({ series }) {
  if (!series?.data || series.data.length < 2) {
    return (
      <div className="chart-card">
        <h3>{series?.label || 'N/A'}</h3>
        <p className="na-message">Insufficient data</p>
      </div>
    );
  }

  const { label, data } = series;

  return (
    <div className="chart-card">
      <h3>{label}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={60} />
          <Tooltip />
          <Bar dataKey="value" name={label} fill="#4a7ab5" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function BigFiveCharts({ chartData }) {
  if (!chartData) return null;

  const charts = [
    chartData.sales,
    chartData.netIncome,
    chartData.roic,
    chartData.equity,
    chartData.debt,
  ].filter(Boolean);

  if (charts.length === 0) return null;

  return (
    <div className="card">
      <h2>Historical Trends</h2>
      <p className="card-subtitle">Annual values with trendline</p>
      <div className="charts-grid">
        {charts.map((series) => (
          <TrendChart key={series.label} series={series} />
        ))}
      </div>
    </div>
  );
}
