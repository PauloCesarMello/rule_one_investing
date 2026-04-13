import { passFail } from '../utils/calculations';

function formatRate(rate) {
  if (rate == null) return 'N/A';
  return `${rate.toFixed(1)}%`;
}

export default function BigFiveTable({ bigFive }) {
  const metrics = [
    { label: 'ROIC Growth', value: bigFive.roic },
    { label: 'Sales (Revenue) Growth', value: bigFive.sales },
    { label: 'EPS Growth', value: bigFive.eps },
    { label: 'Equity (BVPS) Growth', value: bigFive.equity },
    { label: 'Operating Cash Flow Growth', value: bigFive.ocf },
  ];

  const allPass = metrics.every((m) => m.value != null && m.value >= 10);

  return (
    <div className="card">
      <h2>Big Five Numbers</h2>
      <p className="card-subtitle">Minimum 10% annual growth required</p>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Growth Rate</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => {
            const result = passFail(m.value);
            return (
              <tr key={m.label}>
                <td>{m.label}</td>
                <td>{formatRate(m.value)}</td>
                <td>
                  <span className={`badge ${result === 'PASS' ? 'badge-pass' : result === 'FAIL' ? 'badge-fail' : 'badge-na'}`}>
                    {result}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={`overall ${allPass ? 'overall-pass' : 'overall-fail'}`}>
        {allPass ? 'All Big Five metrics pass — this is a Rule #1 candidate!' : 'Not all metrics pass the 10% threshold.'}
      </div>
    </div>
  );
}
