import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner, Badge } from '../components/ui';

// Dot-path get/set so one set of helpers can drive the whole nested config form.
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

const UNIT_FORMATS = [
  ['appOpen', 'App Open'],
  ['banner', 'Banner'],
  ['interstitial', 'Interstitial'],
  ['rewarded', 'Rewarded'],
  ['rewardedInterstitial', 'Rewarded Int.'],
  ['native', 'Native'],
];

export default function Ads() {
  const [cfg, setCfg] = useState(null);
  const [defaults, setDefaults] = useState(null);
  const [meta, setMeta] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const load = () =>
    api.get('/api/ads').then((r) => {
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
      const r = await api.put('/api/ads', { config: cfg });
      setCfg(r.config);
      setSavedMsg('Saved — the app picks this up on next launch / refresh.');
      load();
    } catch (e) {
      setSavedMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  function resetDefaults() {
    if (!confirm('Reset every ad setting back to defaults? (you still need to Save)')) return;
    setCfg(JSON.parse(JSON.stringify(defaults)));
    setSavedMsg('Reset to defaults — click Save to apply.');
  }

  if (!cfg) return <Spinner />;

  // --- small field components bound to the dot-path config ---
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
  const Num = ({ path, label, suffix }) => (
    <div className="field">
      <label>{label}{suffix ? ` (${suffix})` : ''}</label>
      <input
        className="input"
        type="number"
        value={getPath(cfg, path) ?? 0}
        onChange={(e) => set(path, e.target.value === '' ? 0 : Number(e.target.value))}
      />
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
  const Sel = ({ path, label, options }) => (
    <div className="field">
      <label>{label}</label>
      <select className="select" value={getPath(cfg, path)} onChange={(e) => set(path, e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Ads &amp; Monetization</h1>
      <p className="page-sub">
        Control every AdMob format from here — placement IDs, cooldowns and frequency caps.
        Changes apply when the app next fetches its config (cold start / pull-to-refresh).
      </p>

      <Card
        title="Master controls"
        sub={cfg.testMode ? 'TEST MODE — Google test ads are shown regardless of the IDs below.' : 'LIVE — real ad unit IDs are used.'}
        action={cfg.enabled ? <Badge color="green">Ads ON</Badge> : <Badge color="red">Ads OFF</Badge>}
      >
        <Toggle path="enabled" label="Enable ads" desc="Master kill-switch. Off = no ads anywhere in the app." />
        <Toggle path="testMode" label="Test mode" desc="Use Google's official test ad units. Keep ON until your AdMob account & real IDs are live — showing real ads to yourself can get the account flagged." />
        <Toggle path="global.respectRemoveAds" label="Respect “Remove Ads” purchase" desc="Premium users see no ads." />
        <Toggle path="global.useUmpConsent" label="GDPR consent (Google UMP)" desc="Show Google's consent form to EEA/UK users before ads init. REQUIRED by Google for EEA traffic; consented users get personalized (higher-eCPM) ads. Configure the message in AdMob → Privacy & messaging." />
        <Toggle path="global.nonPersonalizedOnly" label="Non-personalized ads only" desc="Force NPA on every request (much lower eCPM). Leave OFF — UMP consent above handles EU properly." />
        <div className="fields-grid" style={{ marginTop: 14 }}>
          <Sel path="global.maxAdContentRating" label="Max ad content rating" options={['G', 'PG', 'T', 'MA']} />
        </div>
      </Card>

      <Card title="AdMob App IDs" sub="From AdMob → App settings. Injected into the native build.">
        <div className="row">
          <Txt path="appId.android" label="Android App ID" placeholder="ca-app-pub-XXXXXXXX~XXXXXXXX" />
          <Txt path="appId.ios" label="iOS App ID" placeholder="ca-app-pub-XXXXXXXX~XXXXXXXX" />
        </div>
      </Card>

      <Card title="Ad unit IDs (real)" sub="Used when Test mode is OFF. Paste the unit IDs from your AdMob console.">
        <div className="unit-grid">
          <div className="uhead">Format</div>
          <div className="uhead">Android</div>
          <div className="uhead">iOS</div>
          {UNIT_FORMATS.map(([key, label]) => (
            <React.Fragment key={key}>
              <div className="uname">{label}</div>
              <input className="input" placeholder="ca-app-pub-…/…" value={getPath(cfg, `units.${key}.android`) ?? ''} onChange={(e) => set(`units.${key}.android`, e.target.value)} />
              <input className="input" placeholder="ca-app-pub-…/…" value={getPath(cfg, `units.${key}.ios`) ?? ''} onChange={(e) => set(`units.${key}.ios`, e.target.value)} />
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card title="Global frequency governor" sub="Applies across every full-screen ad — the main lever between revenue and retention.">
        <div className="fields-grid">
          <Num path="global.minSecondsBetweenInterstitials" label="Min gap between full-screen ads" suffix="sec" />
          <Num path="global.sessionStartGraceSeconds" label="Grace period after launch" suffix="sec" />
          <Num path="global.maxFullscreenPerSession" label="Max full-screen ads / session" />
        </div>
      </Card>

      <Card title="App Open ads" sub="Highest-value 'free' surface — shows on launch and when returning to the app." action={cfg.appOpen.enabled ? <Badge color="green">On</Badge> : <Badge color="gray">Off</Badge>}>
        <Toggle path="appOpen.enabled" label="Enable App Open ads" />
        <Toggle path="appOpen.showOnColdStart" label="Show on cold start" desc="When the app is launched fresh." />
        <Toggle path="appOpen.showOnResume" label="Show on resume" desc="When the user returns after backgrounding the app." />
        <Toggle path="appOpen.resumeFallbackInterstitial" label="Interstitial fallback on resume" desc="If no App Open ad is loaded when the user returns, show a ready interstitial instead — the return moment is never wasted." />
        <div className="fields-grid" style={{ marginTop: 14 }}>
          <Num path="appOpen.minSecondsBetween" label="Min gap between App Open ads" suffix="sec" />
          <Num path="appOpen.coldStartDelayMs" label="Cold-start delay" suffix="ms" />
          <Num path="appOpen.coldStartTimeoutMs" label="Splash waits for the launch ad up to" suffix="ms" />
          <Num path="appOpen.expireHours" label="Ad expires after" suffix="hrs" />
        </div>
      </Card>

      <Card title="Interstitials" sub="Full-screen ads at natural breakpoints." action={cfg.interstitial.enabled ? <Badge color="green">On</Badge> : <Badge color="gray">Off</Badge>}>
        <Toggle path="interstitial.enabled" label="Enable interstitials" />
        <Toggle path="interstitial.onModImport" label="After EVERY mod download (fixed)" desc="One interstitial always closes the download loop — this trigger bypasses the cooldowns so every single download ends with an ad." />
        <Toggle path="interstitial.onAppLaunch" label="On app launch" desc="Usually leave OFF if App Open ads are on (avoid double ads at start)." />
        <Toggle path="interstitial.afterAppOpen" label="Interstitial AFTER the launch App Open ad" desc="Every cold start: App Open ad → home feed appears → one interstitial after a short delay. ⚠️ Two full-screen ads around launch is aggressive — if AdMob ever flags the app for 'ads before content', turn this off first." />
        <div className="fields-grid" style={{ marginTop: 14 }}>
          <Num path="interstitial.onDetailOpenEvery" label="Every Nth mod-detail visit, shown on EXIT (0=off)" />
          <Num path="interstitial.onCategorySwitchEvery" label="Every Nth category switch (0=off)" />
          <Num path="interstitial.onTabSwitchEvery" label="Every Nth bottom-tab switch (0=off)" />
          <Num path="interstitial.onRefreshEvery" label="Every Nth pull-to-refresh (0=off)" />
          <Num path="interstitial.afterAppOpenDelayMs" label="Delay before the after-launch interstitial" suffix="ms" />
          <Num path="interstitial.cooldownSeconds" label="Per-trigger cooldown" suffix="sec" />
        </div>
      </Card>

      <Card title="Rewarded ads" sub="Highest eCPM format, watchable unlimited times. Core loop: every download = watch one rewarded ad to unlock it → download → one interstitial." action={cfg.rewarded.enabled ? <Badge color="green">On</Badge> : <Badge color="gray">Off</Badge>}>
        <Toggle path="rewarded.enabled" label="Enable rewarded ads" />
        <Toggle path="rewarded.requireForDownload" label="Rewarded ad unlocks every download" desc="'Watch one short ad and your download starts.' Fails open when no ad is loaded (offline/no-fill) so downloads never break." />
        <Toggle path="rewarded.offerOnHome" label="'🎁 Ad-free' pill on the Home screen" desc="Repeatable — users can watch as many rewarded ads as they want." />
        <Toggle path="rewarded.offerInSettings" label="Rewarded section on the Settings screen" />
        <div className="fields-grid" style={{ marginTop: 14 }}>
          <Num path="rewarded.unlockMinutes" label="Ad-free reward" suffix="min" />
        </div>
      </Card>

      <Card title="Banner ads" sub="Anchored at the bottom of each screen (always visible)." action={cfg.banner.enabled ? <Badge color="green">On</Badge> : <Badge color="gray">Off</Badge>}>
        <Toggle path="banner.enabled" label="Enable banners" />
        <Toggle path="banner.home" label="Show on Home screen" />
        <Toggle path="banner.collapsibleHome" label="Collapsible banner on Home" desc="Expands once then collapses to a normal banner — pays a large multiple of standard banner eCPM. Google recommends limiting collapsible to one main surface, so it applies to Home only." />
        <Toggle path="banner.detail" label="Show on Mod Detail screen (anchored, always visible)" />
        <Toggle path="banner.search" label="Show on Search screen" />
        <Toggle path="banner.favorites" label="Show on Favorites screen" />
        <div className="fields-grid" style={{ marginTop: 14 }}>
          <Sel path="banner.size" label="Banner size" options={['ANCHORED_ADAPTIVE', 'BANNER', 'LARGE_BANNER', 'MEDIUM_RECTANGLE']} />
        </div>
      </Card>

      <Card title="In-feed MREC ads" sub="300×250 rectangles woven into the mod list. First one lands ABOVE THE FOLD (after 1 row) so it's seen without scrolling. Paste a dedicated MREC ad unit into the 'Native' row above for separate eCPM reporting." action={cfg.native.enabled ? <Badge color="green">On</Badge> : <Badge color="gray">Off</Badge>}>
        <Toggle path="native.enabled" label="Enable in-feed / MREC ads" />
        <Toggle path="native.inFeed" label="Inject into the mod feed" />
        <Toggle path="native.onDetail" label="MREC at the end of the detail screen" />
        <div className="fields-grid" style={{ marginTop: 14 }}>
          <Num path="native.firstAfterItems" label="First ad after N mods (2 = above the fold)" />
          <Num path="native.everyNItems" label="Then every N mod cards" />
          <Num path="native.maxPerScreen" label="Max in-feed ads per screen" />
        </div>
      </Card>

      <div className="save-bar">
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        <button className="btn btn-ghost" onClick={resetDefaults} disabled={saving}>Reset to defaults</button>
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
