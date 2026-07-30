import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, KpiCard, Spinner, Empty } from '../components/ui';

// "User" here = unique device. The app generates a permanent device_id per install and
// sends it with every event, so a device counts as active on any day it opened the app.
// A reinstall gets a fresh device_id and therefore counts as a new user.
export default function Audience() {
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [gran, setGran] = useState('day');
  const [days, setDays] = useState(30);

  useEffect(() => { api.get('/api/analytics/audience-summary').then(setSummary); }, []);
  useEffect(() => { api.get('/api/analytics/ratings').then(setRatings).catch(() => {}); }, []);
  useEffect(() => {
    setRows(null);
    api.get(`/api/analytics/audience?granularity=${gran}&days=${days}`).then(setRows);
  }, [gran, days]);

  if (!summary) return <Spinner />;
  const max = rows ? Math.max(1, ...rows.map((r) => r.active)) : 1;

  return (
    <div>
      <h1 className="page-title">App Users</h1>
      <p className="page-sub">
        Unique devices using the app — how many come each day, how many are brand new and how
        many came back. Days follow Indian time (IST).
      </p>

      <div className="kpi-grid">
        <KpiCard label="Genuine Today ✅" value={(summary.genuineToday ?? 0).toLocaleString()} icon="🛡️" color="#2dce89" />
        <KpiCard label="All Devices Today" value={summary.today.toLocaleString()} icon="📱" color="#1d8cf8" />
        <KpiCard label="New Today" value={summary.newToday.toLocaleString()} icon="✨" color="#17c1e8" />
        <KpiCard label="Returning Today" value={summary.returningToday.toLocaleString()} icon="🔁" color="#ff9f43" />
      </div>
      <p className="page-sub" style={{ marginTop: 4 }}>
        <strong>Genuine ✅</strong> = devices that sent the authenticated app-open signal (only real
        app builds v1.2+ can send it — scripts and bots can't). "All devices" counts every device
        that produced any event, including possible bot traffic and older app versions.
      </p>
      <div className="kpi-grid">
        <KpiCard label="Downloaded Today" value={summary.downloadersToday.toLocaleString()} icon="⬇️" color="#cb0c9f" />
        <KpiCard label="Yesterday" value={summary.yesterday.toLocaleString()} icon="🌙" color="#8392ab" />
        <KpiCard label="Last 7 Days" value={summary.last7.toLocaleString()} icon="🗓️" color="#17c1e8" />
        <KpiCard label="Last 30 Days" value={summary.last30.toLocaleString()} icon="📆" color="#5e72e4" />
        <KpiCard label="All-Time Devices" value={summary.total.toLocaleString()} icon="🌍" color="#344767" />
      </div>

      <Card
        title={gran === 'day' ? 'Users per day' : 'Users per week'}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="select" value={gran} onChange={(e) => setGran(e.target.value)}>
              <option value="day">Day wise</option>
              <option value="week">Week wise</option>
            </select>
            <select className="select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 180 days</option>
            </select>
          </div>
        }
      >
        {!rows ? (
          <Spinner />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{gran === 'day' ? 'Date' : 'Week starting'}</th>
                  <th>Genuine ✅</th>
                  <th>All devices</th>
                  <th>New</th>
                  <th>Returning</th>
                  <th>Downloaded a mod</th>
                  <th style={{ width: '24%' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.period}>
                    <td>{r.period}</td>
                    <td><strong style={{ color: '#2dce89' }}>{(r.genuine ?? 0).toLocaleString()}</strong></td>
                    <td>{r.active.toLocaleString()}</td>
                    <td style={{ color: '#2dce89' }}>{r.new.toLocaleString()}</td>
                    <td style={{ color: '#ff9f43' }}>{r.returning.toLocaleString()}</td>
                    <td>{r.downloaders.toLocaleString()}</td>
                    <td>
                      <div style={{ background: '#eef0f3', borderRadius: 6, height: 8 }}>
                        <div style={{ width: `${(r.active / max) * 100}%`, background: 'var(--accent-pink)', height: 8, borderRadius: 6 }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <Empty>No user activity yet — data appears as soon as devices open the app.</Empty>}
          </div>
        )}
      </Card>

      {ratings && (
        <Card
          title="⭐ In-app ratings"
          sub="Every star given in the app's one-time rating dialog. Users who gave 4-5 stars were sent onward to the Play Store to leave a public review."
          action={<span style={{ fontWeight: 800 }}>{ratings.average} ★ avg · {ratings.total} ratings</span>}
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Stars</th><th>Count</th><th style={{ width: '40%' }}></th></tr>
              </thead>
              <tbody>
                {ratings.distribution.map((d) => {
                  const max = Math.max(1, ...ratings.distribution.map((x) => x.count));
                  return (
                    <tr key={d.stars}>
                      <td>{'⭐'.repeat(d.stars)}</td>
                      <td>{d.count.toLocaleString()}</td>
                      <td>
                        <div style={{ background: '#eef0f3', borderRadius: 6, height: 8 }}>
                          <div style={{ width: `${(d.count / max) * 100}%`, background: d.stars >= 4 ? '#2dce89' : d.stars === 3 ? '#ff9f43' : '#f5365c', height: 8, borderRadius: 6 }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!ratings.total && <Empty>No ratings yet — the dialog ships with app v1.2.</Empty>}
          </div>
        </Card>
      )}
    </div>
  );
}
