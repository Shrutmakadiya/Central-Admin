import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { api } from '../api';
import { Card, KpiCard, Spinner } from '../components/ui';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const DONUT_COLORS = ['#cb0c9f', '#1d8cf8', '#17c1e8', '#ff9f43', '#f5365c', '#2dce89', '#8965e0'];

export default function Dashboard() {
  const nav = useNavigate();
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [topMods, setTopMods] = useState([]);
  const [catClicks, setCatClicks] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/api/analytics/summary'),
      api.get('/api/analytics/timeseries?days=14'),
      api.get('/api/analytics/countries'),
      api.get('/api/analytics/top-mods?sortBy=downloads&limit=5'),
      api.get('/api/analytics/category-clicks'),
    ]).then(([s, ts, co, tm, cc]) => {
      setSummary(s);
      setSeries(ts);
      setCountries(co);
      setTopMods(tm);
      setCatClicks(cc.slice(0, 6));
    });
  }, []);

  if (!summary) return <Spinner />;

  const lineData = {
    labels: series.map((p) => p.day.slice(5)),
    datasets: [
      {
        label: 'Impressions', data: series.map((p) => p.impressions),
        borderColor: '#1d8cf8', backgroundColor: 'rgba(29,140,248,.12)', fill: true, tension: 0.4,
      },
      {
        label: 'Downloads', data: series.map((p) => p.downloads),
        borderColor: '#cb0c9f', backgroundColor: 'rgba(203,12,159,.12)', fill: true, tension: 0.4,
      },
    ],
  };

  const donut = (labels, values) => ({
    labels,
    datasets: [{ data: values, backgroundColor: DONUT_COLORS, borderWidth: 0 }],
  });

  const donutOpts = { plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } };

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Analytics overview for the selected app — last 14 days</p>

      <div className="kpi-grid">
        <KpiCard label="Impressions" value={summary.impressions.toLocaleString()} icon="👁️" color="#1d8cf8" onClick={() => nav('/analysis')} />
        <KpiCard label="Downloads" value={summary.downloads.toLocaleString()} icon="⬇️" color="#cb0c9f" onClick={() => nav('/analysis')} />
        <KpiCard label="Conversion" value={`${summary.conversion}%`} icon="🎯" color="#2dce89" onClick={() => nav('/analysis')} />
        <KpiCard label="Category Clicks" value={summary.categoryClicks.toLocaleString()} icon="🖱️" color="#ff9f43" onClick={() => nav('/category-clicks')} />
        <KpiCard label="Searches" value={summary.searches.toLocaleString()} icon="🔍" color="#17c1e8" onClick={() => nav('/keywords')} />
      </div>

      <div className="grid-2">
        <Card title="Impressions vs Downloads" sub="Daily trend">
          <Line data={lineData} options={{ plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} height={120} />
        </Card>
        <Card title="Top 5 Countries" sub="By total events">
          {countries.length ? (
            <Doughnut data={donut(countries.slice(0, 5).map((c) => c.country), countries.slice(0, 5).map((c) => c.count))} options={donutOpts} />
          ) : (
            <div className="muted">No data</div>
          )}
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Top 5 Mods by Downloads">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Mod</th><th>Category</th><th>Downloads</th><th>Conversion</th></tr>
              </thead>
              <tbody>
                {topMods.map((m) => (
                  <tr key={m.id}>
                    <td><span className="rank-pill">{m.rank}</span></td>
                    <td>{m.title}</td>
                    <td className="muted">{m.category || '—'}</td>
                    <td>{m.downloads.toLocaleString()}</td>
                    <td>{m.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Category Clicks" sub="Share of taps">
          {catClicks.length ? (
            <Doughnut data={donut(catClicks.map((c) => c.name), catClicks.map((c) => c.clicks))} options={donutOpts} />
          ) : (
            <div className="muted">No data</div>
          )}
        </Card>
      </div>
    </div>
  );
}
