import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner, Badge } from '../components/ui';

// Dot-path helpers (same pattern as the Ads page).
function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
  const keys = path.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

// Mirror of the server-side comparison so the preview below matches real behavior.
function parseVersion(v) {
  if (typeof v !== 'string') return null;
  const cleaned = v.trim().replace(/^v/i, '').split(/[-+]/)[0];
  if (!/^\d+(\.\d+)*$/.test(cleaned)) return null;
  return cleaned.split('.').map(Number);
}
function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return null;
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

export default function AppVersion() {
  const [cfg, setCfg] = useState(null);
  const [defaults, setDefaults] = useState(null);
  const [meta, setMeta] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [testVersion, setTestVersion] = useState('1.0.0');

  const load = () =>
    api.get('/api/app-version').then((r) => {
      setCfg(r.config);
      setDefaults(r.defaults);
      setMeta({ updatedBy: r.updatedBy, updatedAt: r.updatedAt });
    });
  useEffect(() => {
    load();
  }, []);

  const set = (path, value) => setCfg((c) => setPath(c, path, value));

  async function save() {
    setSaving(true);
    setSavedMsg('');
    try {
      const r = await api.put('/api/app-version', { config: cfg });
      setCfg(r.config);
      setSavedMsg('Saved — apps pick this up on next launch / resume.');
      load();
    } catch (e) {
      setSavedMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  function resetDefaults() {
    if (!confirm('Reset all version settings back to defaults? (you still need to Save)')) return;
    setCfg(JSON.parse(JSON.stringify(defaults)));
    setSavedMsg('Reset to defaults — click Save to apply.');
  }

  if (!cfg) return <Spinner />;

  const Toggle = ({ path, label, desc }) => (
    <div className="toggle-row">
      <div>
        <div className="t-label">{label}</div>
        {desc && <div className="t-desc">{desc}</div>}
      </div>
      <label className="switch">
        <input type="checkbox" checked={!!getPath(cfg, path)} onChange={(e) => set(path, e.target.checked)} />
        <span className="slider" />
      </label>
    </div>
  );
  const Txt = ({ path, label, placeholder }) => (
    <div className="field">
      <label>{label}</label>
      <input
        className="input"
        value={getPath(cfg, path) ?? ''}
        placeholder={placeholder}
        onChange={(e) => set(path, e.target.value)}
      />
    </div>
  );

  // Live preview of what an app reporting `testVersion` would experience with the
  // config as currently edited (before/after save — it reflects the form values).
  const belowMin = compareVersions(testVersion, cfg.minSupportedVersion);
  const belowLatest = compareVersions(testVersion, cfg.latestVersion);
  let previewText;
  let previewColor;
  if (!cfg.enabled) {
    previewText = 'Version checks are disabled — the app opens normally.';
    previewColor = 'gray';
  } else if (belowMin === null || belowLatest === null) {
    previewText = 'Invalid version format — the app fails open (opens normally).';
    previewColor = 'gray';
  } else if (belowMin < 0) {
    previewText = 'FORCE UPDATE — blocking screen, user cannot enter the app.';
    previewColor = 'red';
  } else if (belowLatest < 0 && cfg.optional.enabled) {
    previewText = 'Optional update — dismissible prompt (max once/day), app usable.';
    previewColor = 'green';
  } else {
    previewText = 'Up to date — the app opens normally.';
    previewColor = 'green';
  }

  const versionsInvalid =
    parseVersion(cfg.latestVersion) === null || parseVersion(cfg.minSupportedVersion) === null;
  const minAboveLatest =
    !versionsInvalid && compareVersions(cfg.minSupportedVersion, cfg.latestVersion) === 1;

  return (
    <div>
      <h1 className="page-title">App Version &amp; Force Update</h1>
      <p className="page-sub">
        Control which app versions must update. Apps below the minimum supported version are blocked
        behind an "Update Required" screen; apps below the latest version get a dismissible prompt.
        Changes apply when the app next launches or returns to the foreground.
      </p>

      <Card
        title="Master control"
        action={cfg.enabled ? <Badge color="green">Checks ON</Badge> : <Badge color="red">Checks OFF</Badge>}
      >
        <Toggle
          path="enabled"
          label="Enable version checks"
          desc="Off = no update prompts or blocks for anyone, regardless of the versions below."
        />
      </Card>

      <Card
        title="Versions"
        sub='Use the same version as app.json / the store release, e.g. "1.1.0". Force update = installed version BELOW the minimum.'
      >
        <div className="row">
          <Txt path="latestVersion" label="Latest version (on the store)" placeholder="1.1.0" />
          <Txt path="minSupportedVersion" label="Minimum supported version" placeholder="1.0.0" />
        </div>
        {versionsInvalid && (
          <p style={{ color: '#e05555', fontSize: '0.85rem', marginTop: 10 }}>
            ⚠ One of the versions is not a valid version number (use digits and dots, e.g. 1.2.0).
          </p>
        )}
        {minAboveLatest && (
          <p style={{ color: '#e05555', fontSize: '0.85rem', marginTop: 10 }}>
            ⚠ Minimum supported version is greater than the latest version — this would force-update
            everyone, including users on the newest release. Saving is blocked.
          </p>
        )}
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: 10 }}>
          Example: latest 1.1.0 + minimum 1.0.0 → users on 1.0.0 get an optional prompt. Set minimum
          to 1.1.0 to force everyone below it to update.
        </p>
      </Card>

      <Card title="Store URLs" sub="Where the Update button sends the user.">
        <div className="row">
          <Txt
            path="storeUrl.android"
            label="Android (Play Store)"
            placeholder="https://play.google.com/store/apps/details?id=..."
          />
          <Txt path="storeUrl.ios" label="iOS (App Store)" placeholder="https://apps.apple.com/app/id..." />
        </div>
      </Card>

      <Card title="Force update screen" sub="Blocking screen for versions below the minimum. The user cannot skip it.">
        <div className="row">
          <Txt path="force.title" label="Title" />
          <Txt path="force.buttonText" label="Button text" />
        </div>
        <Txt path="force.message" label="Message" />
      </Card>

      <Card
        title="Optional update prompt"
        sub="Dismissible prompt for versions between minimum and latest. Shown at most once per day."
        action={cfg.optional.enabled ? <Badge color="green">On</Badge> : <Badge color="gray">Off</Badge>}
      >
        <Toggle path="optional.enabled" label="Enable optional update prompts" />
        <div className="row" style={{ marginTop: 14 }}>
          <Txt path="optional.title" label="Title" />
          <Txt path="optional.buttonText" label="Update button text" />
          <Txt path="optional.laterText" label="Dismiss button text" />
        </div>
        <Txt path="optional.message" label="Message" />
      </Card>

      <Card title="Preview / test a version" sub="What would an app with this installed version see (with the values above)?">
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field">
            <label>Installed app version</label>
            <input className="input" value={testVersion} onChange={(e) => setTestVersion(e.target.value)} />
          </div>
          <div style={{ paddingBottom: 6 }}>
            <Badge color={previewColor}>{previewText}</Badge>
          </div>
        </div>
      </Card>

      <div className="save-bar">
        <button className="btn" onClick={save} disabled={saving || minAboveLatest || versionsInvalid}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button className="btn btn-ghost" onClick={resetDefaults} disabled={saving}>
          Reset to defaults
        </button>
        {savedMsg && <span className="muted" style={{ fontSize: '0.85rem' }}>{savedMsg}</span>}
        {meta.updatedAt && (
          <span className="muted" style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>
            Last saved {new Date(meta.updatedAt).toLocaleString()} {meta.updatedBy ? `by ${meta.updatedBy}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}
