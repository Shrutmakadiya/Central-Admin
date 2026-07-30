import React, { useState } from 'react';
import { Card } from '../components/ui';

// The PUBLIC base where the legal pages are served (the backend). This is the URL you give to
// Google Play / AdMob. In production set VITE_API_BASE to your backend origin; otherwise we
// default to the deployed Vercel backend.
const PUBLIC_BASE = (import.meta.env.VITE_API_BASE || 'https://horror-mods-backend.vercel.app').replace(/\/$/, '');
// For the in-dashboard preview, use a relative path in dev so Vite proxies it to the local backend.
const PREVIEW_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

function UrlRow({ label, path }) {
  const publicUrl = `${PUBLIC_BASE}${path}`;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this URL:', publicUrl);
    }
  };
  return (
    <div className="field">
      <label>{label}</label>
      <div className="row" style={{ alignItems: 'center' }}>
        <input className="input" readOnly value={publicUrl} onFocus={(e) => e.target.select()} style={{ flex: 3 }} />
        <button type="button" className="btn" onClick={copy} style={{ flex: 'none' }}>{copied ? 'Copied ✓' : 'Copy'}</button>
        <a className="btn btn-ghost" href={publicUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 'none', textAlign: 'center' }}>Open ↗</a>
      </div>
    </div>
  );
}

export default function Legal() {
  return (
    <div>
      <h1 className="page-title">Legal &amp; Privacy</h1>
      <p className="page-sub">
        Public, login-free pages for the app stores. Paste the Privacy Policy URL into Google Play Console and AdMob.
      </p>

      <Card title="Public URLs" sub="No login required — these open for anyone. Hosted by the backend.">
        <UrlRow label="Privacy Policy (required by Google Play & AdMob)" path="/privacy" />
        <UrlRow label="Terms of Service / EULA" path="/terms" />
        <p className="muted" style={{ fontSize: '0.86rem', marginTop: 4 }}>
          Google Play: <strong>Play Console → App content → Privacy policy</strong> → paste the Privacy Policy URL.
          AdMob: <strong>App settings → Privacy policy URL</strong>. The URL must stay publicly reachable, so keep
          the backend deployed.
        </p>
      </Card>

      <Card title="Before you publish" sub="Edit backend/src/legal/policy.js (LEGAL_CONFIG) then redeploy the backend.">
        <ul style={{ margin: '4px 0 0 18px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          <li>Set a real <strong>contact email</strong> you monitor (required by Google &amp; AdMob).</li>
          <li>Set the <strong>developer/legal name</strong> and <strong>governing-law country</strong>.</li>
          <li>Confirm the <strong>effective date</strong>.</li>
          <li>Have a qualified attorney review the wording for your jurisdiction — this is a strong template, not legal advice.</li>
        </ul>
      </Card>

      <Card title="Privacy Policy preview">
        <iframe
          title="Privacy Policy preview"
          src={`${PREVIEW_BASE}/privacy`}
          style={{ width: '100%', height: 620, border: '1px solid var(--border)', borderRadius: 12, background: '#fff' }}
        />
        <p className="muted" style={{ fontSize: '0.82rem', marginTop: 8 }}>
          Preview loads from the backend. If it’s blank locally, make sure the backend is running on the proxied port.
        </p>
      </Card>
    </div>
  );
}
