import React, { useState } from 'react';
import { fmtD, lbToKg, kgToLb } from '../utils';
import { THEMES, THEME_ORDER } from '../constants';
import CollapsibleSection from '../components/CollapsibleSection';
import PlateCircle from '../components/PlateCircle';
import QRTransfer, { QRImportReceiver } from '../components/QRTransfer';
import { ISun, IMoon, IX } from '../icons';
import { sendOTP, verifyOTP } from '../cloud';

// ─── Section header ──────────────────────────────────────────────────────────
function SectionLabel({ label }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.09em', color: 'var(--c-sub)', marginBottom: 10, marginTop: 4, paddingLeft: 2 }}>
      {label}
    </div>
  );
}

// ─── Row: label + right content ──────────────────────────────────────────────
function SettingRow({ label, sub, children, c }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', gap: 14 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: c.sub, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

// ─── Segmented control ────────────────────────────────────────────────────────
function SegControl({ options, value, onChange, c }) {
  return (
    <div style={{ display: 'flex', background: c.card2, borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          style={{
            border: 'none', borderRadius: 8, padding: '6px 12px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            background: value === opt.value ? c.accent : 'transparent',
            color: value === opt.value ? '#fff' : c.sub,
            transition: 'background 0.15s, color 0.15s',
            minHeight: 32,
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, c, style }) {
  return (
    <div style={{ background: c.card, border: '1px solid ' + c.border, borderRadius: 18, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function Divider({ c }) {
  return <div style={{ height: 1, background: c.border, marginLeft: 16 }} />;
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general',   label: 'General'   },
  { id: 'equipment', label: 'Equipment' },
  { id: 'data',      label: 'Data'      },
];

function TabBar({ active, onChange, c }) {
  return (
    <div style={{
      display: 'flex', background: c.card2, borderRadius: 14, padding: 4, gap: 3,
      marginBottom: 20, border: '1px solid ' + c.border,
    }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            flex: 1, border: 'none', borderRadius: 10,
            padding: '9px 4px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            background: active === t.id ? c.accent : 'transparent',
            color: active === t.id ? '#fff' : c.sub,
            transition: 'background 0.18s, color 0.18s',
            minHeight: 40,
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage({
  c, dark, onSetDark, colorTheme, onSetColorTheme, unit, onSetUnit, bwUnit, onSetBwUnit,
  gymPlates, onSetGymPlates,
  reminderDays, onSetReminderDays,
  streakDays, onSetStreakDays,
  hist, customPlans, bwLog, customExercises,
  onBackup, onShare, onImport, lastSnapshot, onListSnapshots, onRestoreSnapshot,
  cloudUser, lastCloudBackup, onCloudBackup, onCloudRestore, onCloudSignOut, onDeleteCloudAccount,
  updateAvail, onUpdate, onStartTour,
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [showQR, setShowQR] = useState(false);
  const [showQRImport, setShowQRImport] = useState(false);

  // ── Cloud auth state ──────────────────────────────────────────────────────
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudOTP, setCloudOTP] = useState('');
  const [cloudStep, setCloudStep] = useState('email'); // 'email' | 'otp'
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudMsg, setCloudMsg] = useState(null); // { text, ok }
  const [cloudBackingUp, setCloudBackingUp] = useState(false);
  const [cloudRestoring, setCloudRestoring] = useState(false);

  const handleSendOTP = async () => {
    if (!cloudEmail.trim()) return;
    if (cloudEmail.includes('+')) {
      setCloudMsg({ text: 'Email aliases with + are not supported. Use your plain email address (e.g. you@gmail.com).', ok: false });
      return;
    }
    setCloudLoading(true); setCloudMsg(null);
    const { error } = await sendOTP(cloudEmail);
    setCloudLoading(false);
    if (error) { setCloudMsg({ text: error, ok: false }); return; }
    setCloudStep('otp');
    setCloudMsg({ text: 'Code sent — check your email.', ok: true });
  };

  const handleVerifyOTP = async () => {
    if (!cloudOTP.trim()) return;
    setCloudLoading(true); setCloudMsg(null);
    const { error } = await verifyOTP(cloudEmail, cloudOTP);
    setCloudLoading(false);
    if (error) { setCloudMsg({ text: error, ok: false }); return; }
    setCloudOTP(''); setCloudStep('email');
    setCloudMsg({ text: 'Signed in successfully!', ok: true });
  };

  const handleCloudBackup = async () => {
    setCloudBackingUp(true); setCloudMsg(null);
    const { error } = await onCloudBackup();
    setCloudBackingUp(false);
    setCloudMsg(error ? { text: error, ok: false } : { text: 'Backup saved to cloud ✓', ok: true });
    setTimeout(() => setCloudMsg(null), 4000);
  };

  const handleCloudRestore = async () => {
    setCloudRestoring(true); setCloudMsg(null);
    const { error } = await onCloudRestore();
    setCloudRestoring(false);
    setCloudMsg(error ? { text: error, ok: false } : { text: 'Data restored from cloud ✓', ok: true });
    setTimeout(() => setCloudMsg(null), 4000);
  };

  const [snapshots, setSnapshots] = useState(null);
  const [snapRestoring, setSnapRestoring] = useState(null);
  const [snapDone, setSnapDone] = useState(null);
  const [plateInput, setPlateInput] = useState('');

  const effectiveBwUnit = bwUnit || unit;

  const loadSnapshots = async () => {
    if (!onListSnapshots) return;
    setSnapshots('loading');
    const list = await onListSnapshots();
    setSnapshots(list || []);
  };

  const confirmRestore = (item) => {
    if (onRestoreSnapshot) onRestoreSnapshot(item.snap);
    setSnapRestoring(null);
    setSnapDone('Restored ' + item.count + ' workouts from ' + fmtD(item.date));
    setTimeout(() => setSnapDone(null), 4000);
  };

  const themeOptions = [
    { value: true, label: 'Dark' },
    { value: 'oled', label: 'OLED' },
    { value: 'auto', label: 'Auto' },
    { value: false, label: 'Light' },
  ];

  return (
    <div style={{ padding: '12px 16px 40px' }}>

      {/* ── Tab bar ── */}
      <TabBar active={activeTab} onChange={setActiveTab} c={c} />

      {/* ════════════════════ GENERAL TAB ════════════════════ */}
      {activeTab === 'general' && (
        <>
          {/* Appearance */}
          <SectionLabel label="APPEARANCE" />
          <Card c={c} style={{ marginBottom: 20 }}>
            <SettingRow label="Mode" sub={dark === 'auto' ? 'Follows system' : dark === 'oled' ? 'True black' : dark ? 'Dark' : 'Light'} c={c}>
              <SegControl options={themeOptions} value={dark} onChange={onSetDark} c={c} />
            </SettingRow>
          </Card>

          {/* Color Theme */}
          <SectionLabel label="COLOR THEME" />
          {dark === false && (
            <div style={{ background: c.card, border: '1px solid ' + c.border, borderRadius: 14, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: c.sub }}>
              Themes apply in Dark / OLED / Auto mode. Switch mode above to preview them.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
            {THEME_ORDER.map(key => {
              const t = THEMES[key];
              if (!t) return null;
              const active = (colorTheme || 'midnight') === key;
              return (
                <button key={key} onClick={() => onSetColorTheme(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: active ? t.as : c.card,
                    border: '2px solid ' + (active ? t.accent : c.border),
                    borderRadius: 16, padding: '12px 14px',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'border-color 0.15s, background 0.15s',
                    textAlign: 'left', minHeight: 60,
                  }}>
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 99, background: t.accent, boxShadow: active ? '0 0 0 3px ' + t.accent + '55' : 'none' }} />
                    <div style={{ width: 22, height: 8, borderRadius: 4, background: t.bg, border: '1px solid ' + t.border }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: active ? t.accent : c.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.icon} {t.name}
                    </div>
                    {active && <div style={{ fontSize: 10, color: t.accent, fontWeight: 700, marginTop: 2 }}>Active</div>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Units */}
          <SectionLabel label="UNITS" />
          <Card c={c} style={{ marginBottom: 20 }}>
            <SettingRow label="Lifting Weight" sub="Used for all exercises and plate math" c={c}>
              <SegControl
                options={[{ value: 'kg', label: 'KG' }, { value: 'lb', label: 'LB' }]}
                value={unit} onChange={onSetUnit} c={c}
              />
            </SettingRow>
            <Divider c={c} />
            <SettingRow label="Body Weight" sub="Can differ from lifting unit" c={c}>
              <SegControl
                options={[{ value: 'kg', label: 'KG' }, { value: 'lb', label: 'LB' }]}
                value={effectiveBwUnit} onChange={onSetBwUnit} c={c}
              />
            </SettingRow>
          </Card>

          {/* Streak / Rest Days */}
          <SectionLabel label="STREAK" />
          <Card c={c} style={{ marginBottom: 20 }}>
            <SettingRow
              label="Rest Days Allowed"
              sub={"Streak stays alive through up to " + (streakDays || 1) + " rest day" + ((streakDays || 1) === 1 ? "" : "s") + " in a row"}
              c={c}
            >
              <SegControl
                options={[{ value: 1, label: '1d' }, { value: 2, label: '2d' }, { value: 3, label: '3d' }]}
                value={streakDays || 1}
                onChange={onSetStreakDays}
                c={c}
              />
            </SettingRow>
          </Card>

          {/* Notifications */}
          {'Notification' in window && (
            <>
              <SectionLabel label="NOTIFICATIONS" />
              <Card c={c} style={{ marginBottom: 20 }}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>Workout Reminder</div>
                  <div style={{ fontSize: 12, color: c.sub, marginBottom: 12, lineHeight: 1.5 }}>
                    Get a push notification if you haven't trained in N days. Fires at 9am on the overdue day.
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {[0, 1, 2, 3, 4, 5, 7].map(d => (
                      <button key={d} onClick={() => {
                        if (d > 0 && Notification.permission !== 'granted') {
                          Notification.requestPermission().then(p => { if (p === 'granted') onSetReminderDays(d); });
                        } else {
                          onSetReminderDays(d);
                        }
                      }} style={{ border: 'none', borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', minHeight: 36, background: reminderDays === d ? c.accent : c.card2, color: reminderDays === d ? '#fff' : c.sub, transition: 'background 0.15s,color 0.15s' }}>
                        {d === 0 ? 'Off' : d + 'd'}
                      </button>
                    ))}
                  </div>
                  {reminderDays > 0 && Notification.permission !== 'granted' && (
                    <div style={{ fontSize: 11, color: c.am, background: c.ams, borderRadius: 9, padding: '7px 10px' }}>Permission not granted — tap a day option above to request it.</div>
                  )}
                  {reminderDays > 0 && Notification.permission === 'granted' && (
                    <div style={{ fontSize: 11, color: c.g, background: c.gs, borderRadius: 9, padding: '7px 10px' }}>Active — you'll be notified after {reminderDays}+ rest day{reminderDays === 1 ? '' : 's'}.</div>
                  )}
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* ════════════════════ EQUIPMENT TAB ════════════════════ */}
      {activeTab === 'equipment' && (
        <>
          <SectionLabel label="GYM EQUIPMENT" />
          <Card c={c} style={{ marginBottom: 20 }}>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>My Plates</div>
              <div style={{ fontSize: 12, color: c.sub, marginBottom: 14, lineHeight: 1.5 }}>
                Add the plates you actually own (up to 10). Bar loading math uses only these — nothing else.
              </div>
              {gymPlates.length > 0 ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
                  {gymPlates.map((pKg, i) => {
                    const dispW = unit === 'lb' ? Math.round(kgToLb(pKg) * 4) / 4 : pKg;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <PlateCircle weight={dispW} unit={unit} size={52} />
                        <button onClick={() => onSetGymPlates(prev => prev.filter(g => Math.abs(g - pKg) > 0.01))}
                          style={{ background: c.rs, border: 'none', borderRadius: 6, padding: '2px 10px', fontSize: 10, cursor: 'pointer', color: c.r, fontFamily: 'inherit', fontWeight: 700 }}><IX /></button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: c.sub, marginBottom: 14, textAlign: 'center', padding: '14px 0', background: c.card2, borderRadius: 14 }}>
                  No plates yet — add your first plate below
                </div>
              )}
              {gymPlates.length < 10 ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" inputMode="decimal" value={plateInput}
                    onChange={e => setPlateInput(e.target.value)}
                    placeholder={'Plate weight (' + (unit === 'lb' ? 'lb' : 'kg') + ')…'}
                    style={{ flex: 1, background: c.card2, border: '1.5px solid ' + c.border, borderRadius: 11, padding: '9px 12px', fontSize: 14, color: c.text, outline: 'none', fontFamily: 'inherit' }} />
                  <button onClick={() => {
                    const v = parseFloat(plateInput);
                    if (!v || v <= 0 || v > 500) return;
                    const vKg = unit === 'lb' ? lbToKg(v) : v;
                    onSetGymPlates(prev => {
                      if (prev.length >= 10) return prev;
                      if (prev.some(g => Math.abs(g - vKg) < 0.01)) return prev;
                      return [...prev, vKg].sort((a, b) => b - a);
                    });
                    setPlateInput('');
                  }} style={{ background: c.accent, border: 'none', borderRadius: 11, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit', flexShrink: 0 }}>
                    + Add
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: c.am, background: c.ams, borderRadius: 10, padding: '7px 11px' }}>
                  Maximum 10 plates reached. Remove one to add another.
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ════════════════════ DATA TAB ════════════════════ */}
      {activeTab === 'data' && (
        <>
          {/* Cloud Backup */}
          <SectionLabel label="CLOUD BACKUP" />
          <Card c={c} style={{ marginBottom: 20 }}>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>Supabase Sync</div>
              <div style={{ fontSize: 12, color: c.sub, marginBottom: 12, lineHeight: 1.5 }}>
                Backs up your data to the cloud automatically after every workout. Protects against browser data loss on iOS.
              </div>

              {cloudMsg && (
                <div style={{ fontSize: 12, fontWeight: 600, color: cloudMsg.ok ? c.g : c.r, background: cloudMsg.ok ? c.gs : c.rs, borderRadius: 10, padding: '8px 11px', marginBottom: 12 }}>
                  {cloudMsg.text}
                </div>
              )}

              {!cloudUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cloudStep === 'email' ? (
                    <>
                      <input
                        type="email" inputMode="email" value={cloudEmail}
                        onChange={e => setCloudEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        placeholder="your@email.com"
                        style={{ background: c.card2, border: '1.5px solid ' + c.border, borderRadius: 11, padding: '10px 13px', fontSize: 14, color: c.text, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
                      />
                      <button onClick={handleSendOTP} disabled={cloudLoading || !cloudEmail.trim()}
                        style={{ background: c.accent, border: 'none', borderRadius: 11, padding: '11px', fontSize: 13, fontWeight: 700, cursor: cloudEmail.trim() ? 'pointer' : 'not-allowed', color: '#fff', fontFamily: 'inherit', opacity: cloudEmail.trim() ? 1 : 0.5, minHeight: 44 }}>
                        {cloudLoading ? 'Sending…' : 'Send Code'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: c.sub, marginBottom: 2 }}>Enter the 6-digit code sent to {cloudEmail}</div>
                      <input
                        type="text" inputMode="numeric" value={cloudOTP}
                        onChange={e => setCloudOTP(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                        placeholder="00000000"
                        style={{ background: c.card2, border: '1.5px solid ' + c.border, borderRadius: 11, padding: '10px 13px', fontSize: 22, fontWeight: 800, color: c.text, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', letterSpacing: '0.15em', textAlign: 'center' }}
                      />
                      <button onClick={handleVerifyOTP} disabled={cloudLoading || cloudOTP.length < 6}
                        style={{ background: c.accent, border: 'none', borderRadius: 11, padding: '11px', fontSize: 13, fontWeight: 700, cursor: cloudOTP.length >= 6 ? 'pointer' : 'not-allowed', color: '#fff', fontFamily: 'inherit', opacity: cloudOTP.length >= 6 ? 1 : 0.5, minHeight: 44 }}>
                        {cloudLoading ? 'Verifying…' : 'Verify & Sign In'}
                      </button>
                      <button onClick={() => { setCloudStep('email'); setCloudOTP(''); setCloudMsg(null); }}
                        style={{ background: 'none', border: 'none', fontSize: 12, color: c.sub, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0' }}>
                        ← Use a different email
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <div style={{ background: c.gs, borderRadius: 10, padding: '8px 11px', fontSize: 12, color: c.g, fontWeight: 600 }}>
                    ✓ Signed in as {cloudUser.email}
                  </div>
                  {lastCloudBackup && (
                    <div style={{ fontSize: 11, color: c.sub }}>
                      Last cloud backup: {new Date(lastCloudBackup).toLocaleString()}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleCloudBackup} disabled={cloudBackingUp || !hist.length}
                      style={{ flex: 1, background: c.accent, border: 'none', borderRadius: 11, padding: '11px 8px', fontSize: 13, fontWeight: 700, cursor: hist.length ? 'pointer' : 'not-allowed', color: '#fff', fontFamily: 'inherit', opacity: hist.length ? 1 : 0.5, minHeight: 44 }}>
                      {cloudBackingUp ? 'Saving…' : '☁ Backup Now'}
                    </button>
                    <button onClick={handleCloudRestore} disabled={cloudRestoring}
                      style={{ flex: 1, background: c.card2, border: '1px solid ' + c.border, borderRadius: 11, padding: '11px 8px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: c.text, fontFamily: 'inherit', minHeight: 44 }}>
                      {cloudRestoring ? 'Restoring…' : '↓ Restore'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={onCloudSignOut}
                      style={{ background: 'none', border: 'none', fontSize: 12, color: c.sub, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0' }}>
                      Sign out
                    </button>
                    <button onClick={async () => {
                      const ok = window.confirm('Delete your cloud backup? Your local data stays on this device. This cannot be undone.');
                      if (!ok) return;
                      const { error } = await onDeleteCloudAccount();
                      if (error) alert('Error: ' + error);
                    }}
                      style={{ background: 'none', border: 'none', fontSize: 12, color: '#f87171', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0' }}>
                      Delete cloud data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Local Backup */}
          <SectionLabel label="LOCAL BACKUP" />
          <Card c={c} style={{ marginBottom: 20 }}>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>Backup & Restore</div>
              <div style={{ fontSize: 12, color: c.sub, marginBottom: 10, lineHeight: 1.5 }}>
                IronLog <strong style={{ color: c.g }}>auto-saves a snapshot daily</strong> to your device. Export to a file for off-device storage (iCloud, Google Drive, etc.).
              </div>
              {lastSnapshot && (
                <div style={{ fontSize: 11, color: c.g, marginBottom: 12, background: c.gs, borderRadius: 10, padding: '7px 11px' }}>
                  Last auto-snapshot: {fmtD(lastSnapshot)} · {hist.length} workout{hist.length !== 1 ? 's' : ''}
                </div>
              )}
              <div style={{ display: 'flex', gap: 9, marginBottom: 9 }}>
                <button onClick={onBackup} disabled={!hist.length}
                  style={{ flex: 1, background: c.accent, color: '#fff', border: 'none', borderRadius: 13, padding: '11px 8px', fontSize: 13, fontWeight: 700, cursor: hist.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: hist.length ? 1 : 0.5, minHeight: 44 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Export File
                </button>
                <label style={{ flex: 1, background: c.card2, color: c.text, border: '1px solid ' + c.border, borderRadius: 13, padding: '11px 8px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  Restore File
                  <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
                </label>
              </div>
              <button onClick={onShare} disabled={!hist.length}
                style={{ width: '100%', background: c.card2, color: hist.length ? c.accent : c.sub, border: '1.5px solid ' + (hist.length ? c.accent : c.border), borderRadius: 13, padding: '11px 8px', fontSize: 13, fontWeight: 700, cursor: hist.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: hist.length ? 1 : 0.5, minHeight: 44 }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                Send to Device
              </button>

              {/* Auto-snapshot restore */}
              {onListSnapshots && (
                <div style={{ marginTop: 16, borderTop: '1px solid ' + c.border, paddingTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: c.sub, letterSpacing: '0.07em', marginBottom: 10 }}>AUTO-SNAPSHOTS (LAST 7 DAYS)</div>
                  {snapDone && <div style={{ fontSize: 12, color: c.g, background: c.gs, borderRadius: 10, padding: '8px 11px', marginBottom: 10 }}>{snapDone}</div>}
                  {!snapshots && (
                    <button onClick={loadSnapshots} style={{ width: '100%', background: c.card2, border: '1px solid ' + c.border, borderRadius: 13, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: c.text, fontFamily: 'inherit', minHeight: 44 }}>
                      View restorable snapshots
                    </button>
                  )}
                  {snapshots === 'loading' && <div style={{ textAlign: 'center', fontSize: 12, color: c.sub, padding: '8px 0' }}>Loading…</div>}
                  {Array.isArray(snapshots) && snapshots.length === 0 && (
                    <div style={{ fontSize: 12, color: c.sub, background: c.card2, borderRadius: 10, padding: '9px 11px' }}>No snapshots found for the last 7 days.</div>
                  )}
                  {Array.isArray(snapshots) && snapshots.map(item => (
                    <div key={item.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.card2, borderRadius: 12, padding: '10px 12px', marginBottom: 7, border: '1px solid ' + c.border }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{fmtD(item.date)}</div>
                        <div style={{ fontSize: 11, color: c.sub }}>{item.count} workout{item.count !== 1 ? 's' : ''}</div>
                      </div>
                      <button onClick={() => setSnapRestoring(item)} style={{ background: c.accent, border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit', minHeight: 36 }}>
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* About */}
          <SectionLabel label="ABOUT" />
          <Card c={c} style={{ marginBottom: 32 }}>
            {updateAvail && (
              <>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>Update Available</div>
                    <div style={{ fontSize: 12, color: c.sub, marginTop: 2 }}>A new version of IronLog is ready</div>
                  </div>
                  <button onClick={onUpdate} style={{ background: 'linear-gradient(135deg,#7C6EFA,#9b8ffc)', border: 'none', borderRadius: 11, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit', minHeight: 36 }}>
                    Update
                  </button>
                </div>
                <Divider c={c} />
              </>
            )}
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={onStartTour}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>Take the Tour</div>
                <div style={{ fontSize: 12, color: c.sub, marginTop: 2 }}>Walkthrough of all IronLog features</div>
              </div>
              <span style={{ fontSize: 18 }}>→</span>
            </div>
            <Divider c={c} />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>IronLog</div>
              <div style={{ fontSize: 12, color: c.sub, marginTop: 2 }}>100% offline · Data stays on your device</div>
            </div>
          </Card>
        </>
      )}

      {/* QR modals */}
      {showQR && <QRTransfer hist={hist} customPlans={customPlans} bwLog={bwLog} customExercises={customExercises} c={c} onClose={() => setShowQR(false)} />}
      {showQRImport && <QRImportReceiver c={c} onImport={data => { if (onImport) onImport(data); setShowQRImport(false); }} onClose={() => setShowQRImport(false)} />}

      {/* Snapshot restore confirmation */}
      {snapRestoring && (
        <div onClick={() => setSnapRestoring(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: c.card, border: '1px solid ' + c.border, borderRadius: 24, padding: '24px 22px', maxWidth: 320, width: '100%' }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>Restore snapshot?</div>
            <div style={{ fontSize: 14, color: c.sub, marginBottom: 18, lineHeight: 1.55 }}>
              This will <strong style={{ color: c.r }}>replace your current {hist.length} workout{hist.length !== 1 ? 's' : ''}</strong> with the <strong style={{ color: c.text }}>{fmtD(snapRestoring.date)}</strong> snapshot ({snapRestoring.count} workouts).<br /><br />Consider exporting a backup first.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSnapRestoring(null)} style={{ flex: 1, background: c.card2, border: '1px solid ' + c.border, borderRadius: 13, padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: c.text, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => confirmRestore(snapRestoring)} style={{ flex: 1, background: c.r, border: 'none', borderRadius: 13, padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit' }}>Yes, Restore</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
