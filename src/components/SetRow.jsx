import React from 'react';
import { calcPlates, calc1RM, kgToLb, fmtW, storeW } from '../utils';
import { ITrash, IBarbell } from '../icons';
import PlateCircle from './PlateCircle';

// ─── Set label cycling ────────────────────────────────────────────────────────
const SET_LABELS = ["Working", "Warm-up", "Drop set"];
export function nextLabel(cur) {
  const i = SET_LABELS.indexOf(cur || "Working");
  return SET_LABELS[(i + 1) % SET_LABELS.length];
}

// ─── SetRow ───────────────────────────────────────────────────────────────────
// Renders a single set row inside the focus-mode DragSortList.
// All business logic lives in LogPage; SetRow is pure display + event wiring.
export default function SetRow({
  s,
  idx,
  allSets,       // ex.sets — for prev-set ghost values + drag handle guard
  exId,
  isBW,
  isCardioFocus,
  isTimedFocus,
  barDispF,      // bar weight in display unit
  barKgF,        // bar weight in kg
  exBarType,     // BAR_TYPES entry (with .perSide, .id)
  exName,        // ex.name — for plate picker
  exMuscle,      // ex.muscle — for plate picker
  gymPlates,
  c,
  unit,
  upd,           // (exId, sid, field, val) => void
  tog,           // (exId, sid) => void
  remS,          // (exId, sid) => void
  dlgConfirm,
  zeroRepWarnSid,
  histBest1RM,
  bwLog,
  PCOL_USE2,
  plateConfirmed,
  setPlatePickerFor,
  setDragHandle,
}) {
  const wDisp2 = !isBW ? (parseFloat(unit === "lb" ? fmtW(s.weight, unit) : s.weight) || 0) : 0;
  const plates2 = (!isBW && wDisp2 > barDispF)
    ? calcPlates(wDisp2, unit, unit === "lb" ? barDispF : barKgF, gymPlates && gymPlates.length ? gymPlates : undefined)
    : [];
  const lbl2 = s.label || (isCardioFocus ? "Steady" : "Working");
  const lblCol2 = lbl2 === "Warm-up" ? c.am : lbl2 === "Drop set" ? c.r : c.sub;

  return (
    <div style={{
      background: s.done ? c.gs : c.card,
      border: "2px solid " + (s.done ? c.g : c.border),
      borderRadius: 20, padding: "16px", marginBottom: 14, transition: "all .2s",
    }}>
      {/* ── Row header: drag, delete, set label, mark-done ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {allSets.length > 1 && setDragHandle}
          {allSets.length > 1 && (
            <button
              onClick={() => {
                if (s.done) {
                  dlgConfirm("Remove completed Set " + (idx + 1) + "?").then(ok => { if (ok) remS(exId, s.id); });
                } else {
                  remS(exId, s.id);
                }
              }}
              style={{
                background: "none", border: "none", borderRadius: 10,
                padding: 0, width: 44, height: 44, cursor: "pointer",
                color: s.done ? c.r : c.sub, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "color .15s,background .15s", touchAction: "manipulation",
              }}
              title={"Remove Set " + (idx + 1)}
            >
              <ITrash />
            </button>
          )}
          <span style={{ fontSize: 13, fontWeight: 700, color: s.done ? c.g : c.sub, flexShrink: 0 }}>SET {idx + 1}</span>
          {/* Label cycle button */}
          <button
            onClick={() => upd(exId, s.id, "label",
              isCardioFocus
                ? (["Steady", "Intervals", "Sprint"][(["Steady", "Intervals", "Sprint"].indexOf(lbl2 || "Steady") + 1) % 3])
                : nextLabel(lbl2)
            )}
            style={{
              background: lbl2 === "Warm-up" ? c.ams : lbl2 === "Drop set" ? c.rs : c.card2,
              border: "1px solid " + (lbl2 === "Warm-up" ? c.am : lbl2 === "Drop set" ? c.r : c.border) + "55",
              borderRadius: 8, padding: "3px 8px", fontSize: 10, fontWeight: 700,
              cursor: "pointer", color: lblCol2, fontFamily: "inherit", minHeight: 44,
            }}
          >
            {lbl2}
          </button>
        </div>
        <button
          onClick={() => tog(exId, s.id)}
          style={{
            background: s.done ? c.g : zeroRepWarnSid === s.id ? c.r : c.accent,
            border: "none", borderRadius: 12, padding: "12px 18px",
            fontSize: 14, fontWeight: 900, cursor: "pointer", color: "#fff",
            fontFamily: "inherit", minHeight: 44, flexShrink: 0, transition: "background 0.2s",
          }}
        >
          {s.done ? "Done" : zeroRepWarnSid === s.id ? "Enter reps!" : "Mark Done"}
        </button>
      </div>

      {/* ── Timed input ── */}
      {isTimedFocus && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: c.sub, fontWeight: 700, marginBottom: 6 }}>SECONDS</div>
          <input
            type="number" inputMode="numeric"
            value={s.secs || ""}
            onChange={v => upd(exId, s.id, "secs", v.target.value)}
            placeholder="0"
            style={{ width: "100%", background: c.card2, border: "2px solid " + c.border, borderRadius: 12, padding: "14px 6px", fontSize: 22, fontWeight: 800, color: c.text, outline: "none", textAlign: "center", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
      )}

      {/* ── Cardio inputs ── */}
      {isCardioFocus && (
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: c.sub, fontWeight: 700, marginBottom: 6 }}>MINUTES</div>
            <input type="number" inputMode="decimal" value={s.mins || ""} onChange={v => upd(exId, s.id, "mins", v.target.value)} placeholder="0"
              style={{ width: "100%", background: c.card2, border: "2px solid " + c.border, borderRadius: 12, padding: "14px 6px", fontSize: 22, fontWeight: 800, color: c.text, outline: "none", textAlign: "center", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: c.sub, fontWeight: 700, marginBottom: 6 }}>DISTANCE (km)</div>
            <input type="number" inputMode="decimal" value={s.dist || ""} onChange={v => upd(exId, s.id, "dist", v.target.value)} placeholder="0"
              style={{ width: "100%", background: c.card2, border: "2px solid " + c.border, borderRadius: 12, padding: "14px 6px", fontSize: 22, fontWeight: 800, color: c.text, outline: "none", textAlign: "center", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
        </div>
      )}

      {/* ── Weighted strength inputs ── */}
      {!isCardioFocus && !isTimedFocus && !isBW && (
        <div style={{ marginBottom: 10 }}>
          {/* One-tap autofill from previous set */}
          {idx > 0 && allSets[idx - 1] && (() => {
            const prev = allSets[idx - 1];
            const prevW = prev.weight && parseFloat(prev.weight) ? fmtW(prev.weight, unit) : null;
            const prevR = prev.reps;
            if (!prevW && !prevR) return null;
            return (
              <button
                onClick={() => {
                  if (prevW !== null) upd(exId, s.id, "weight", prev.weight);
                  if (prevR) upd(exId, s.id, "reps", prevR);
                }}
                style={{ width: "100%", background: c.card2, border: "1.5px dashed " + c.border, borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: c.accent, fontFamily: "inherit", marginBottom: 8, letterSpacing: "0.01em" }}
              >
                ↩ Copy prev: {prevW ? prevW + unit : ""}{prevW && prevR ? " × " : ""}{prevR ? "" + prevR + " reps" : ""}
              </button>
            );
          })()}
          {/* Weight + Reps inputs */}
          {(() => {
            const prev = idx > 0 ? allSets[idx - 1] : null;
            const ghostW = prev && prev.weight && parseFloat(prev.weight) ? fmtW(prev.weight, unit) : "";
            const ghostR = prev && prev.reps ? prev.reps : "";
            return (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: c.sub, fontWeight: 700, marginBottom: 6 }}>WEIGHT ({unit})</div>
                  <input
                    type="number" inputMode="decimal"
                    className="il-ghost-input"
                    value={s.weight && parseFloat(s.weight) ? fmtW(s.weight, unit) : s.weight}
                    placeholder={ghostW || "0"}
                    onChange={v => upd(exId, s.id, "weight", unit === "lb" && v.target.value ? String(storeW(v.target.value, "lb")) : v.target.value)}
                    autoFocus={idx === 0 && !s.done && !s.weight}
                    style={{ width: "100%", background: c.card2, border: "2px solid " + c.border, borderRadius: 12, padding: "14px 6px", fontSize: 22, fontWeight: 800, color: c.text, outline: "none", textAlign: "center", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: c.sub, fontWeight: 700, marginBottom: 6 }}>REPS</div>
                  <input
                    type="number" inputMode="numeric"
                    className="il-ghost-input"
                    value={s.reps}
                    placeholder={ghostR || "0"}
                    onChange={v => upd(exId, s.id, "reps", v.target.value)}
                    style={{ width: "100%", background: c.card2, border: "2px solid " + c.border, borderRadius: 12, padding: "14px 6px", fontSize: 22, fontWeight: 800, color: c.text, outline: "none", textAlign: "center", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            );
          })()}
          {/* Live 1RM badge */}
          {(() => {
            const w = parseFloat(unit === "lb" ? fmtW(s.weight, unit) : s.weight) || 0;
            const r = parseInt(s.reps) || 0;
            const liveRM = calc1RM(w, r);
            if (!liveRM) return null;
            const isPR = histBest1RM > 0 && liveRM > histBest1RM;
            const dispRM = unit === "lb" ? Math.round(kgToLb(liveRM) * 4) / 4 : liveRM;
            return (
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, marginBottom: 8, color: isPR ? c.g : c.sub }}>
                {isPR ? "🏆 PR! " : ""}~1RM {dispRM}{unit}
              </div>
            );
          })()}
          {/* RPE picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: c.sub, fontWeight: 700, flexShrink: 0 }}>RPE</span>
            <div style={{ display: "flex", gap: 3, flex: 1, flexWrap: "nowrap", overflow: "hidden" }}>
              {[6, 7, 8, 9, 10].map(r => {
                const active = (s.rpe || 0) === r;
                const col = r <= 7 ? c.g : r <= 8 ? c.am : c.r;
                return (
                  <button
                    key={r}
                    onClick={() => upd(exId, s.id, "rpe", active ? 0 : r)}
                    style={{ flex: 1, background: active ? col + "33" : c.card2, border: "1px solid " + (active ? col : c.border), borderRadius: 8, padding: "4px 0", fontSize: 11, fontWeight: 800, cursor: "pointer", color: active ? col : c.sub, fontFamily: "inherit", minHeight: 44, transition: "all .15s" }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Barbell plate diagram */}
          {exBarType.perSide && (() => {
            const perSideCount = plates2.length;
            const useTextSummary = perSideCount >= 7;
            const plateSize = perSideCount <= 4 ? 34 : perSideCount <= 6 ? 26 : 20;
            const summaryGroups = plates2.reduce((acc, p) => {
              if (acc.length > 0 && acc[acc.length - 1].w === p) acc[acc.length - 1].n++;
              else acc.push({ w: p, n: 1 });
              return acc;
            }, []);
            const summaryStr = summaryGroups.map(g => g.w + (g.n > 1 ? "×" + g.n : "")).join(" · ");
            return (
              <div>
                {!useTextSummary && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flexWrap: "nowrap", paddingBottom: plates2.length > 0 ? 4 : 0 }}>
                    {plates2.length > 0 && [...plates2].reverse().map((p, pi) => (
                      <PlateCircle key={"L" + pi} weight={p} unit={unit} size={plateSize} />
                    ))}
                    <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                      {plates2.length > 0 && <div style={{ width: 10, height: 5, background: c.sub, opacity: 0.3, borderRadius: "3px 0 0 3px" }} />}
                      <button
                        onClick={() => setPlatePickerFor({ eid: exId, sid: s.id, cur: wDisp2 || 0, barType: exBarType.id })}
                        style={{
                          background: plates2.length > 0 ? c.as : c.accent,
                          border: plates2.length > 0 ? "2px solid " + c.accent + "66" : "none",
                          borderRadius: 12, padding: "10px 14px",
                          fontSize: plates2.length > 0 ? 12 : 14, fontWeight: 900,
                          cursor: "pointer", color: plates2.length > 0 ? c.accent : "#fff",
                          fontFamily: "inherit", flexShrink: 0, minHeight: 44, minWidth: 44,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                          whiteSpace: "nowrap", letterSpacing: "-0.02em",
                        }}
                      >
                        <span
                          key={plateConfirmed[s.id] || 0}
                          style={{
                            fontSize: 18, lineHeight: 1, display: "inline-block",
                            transformOrigin: "bottom center",
                            animation: (plateConfirmed[s.id] || 0) > 0
                              ? "il-lifter-press 0.7s cubic-bezier(0.34,1.56,0.64,1) 5 forwards"
                              : "none",
                          }}
                        >🏋️</span>
                        {plates2.length === 0 && <span style={{ fontSize: 9, fontWeight: 800 }}>Load</span>}
                      </button>
                      {plates2.length > 0 && <div style={{ width: 10, height: 5, background: c.sub, opacity: 0.3, borderRadius: "0 3px 3px 0" }} />}
                    </div>
                    {plates2.length > 0 && plates2.map((p, pi) => (
                      <PlateCircle key={"R" + pi} weight={p} unit={unit} size={plateSize} />
                    ))}
                  </div>
                )}
                {useTextSummary && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <div style={{ flex: 1, background: c.card2, border: "1.5px solid " + c.border, borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: c.sub, textAlign: "center", letterSpacing: "0.01em", lineHeight: 1.4 }}>
                      {barDispF > 0 && <span style={{ color: c.accent, marginRight: 6 }}>{barDispF}{unit}</span>}
                      {summaryStr && <span>{summaryStr} per side</span>}
                    </div>
                    <button
                      onClick={() => setPlatePickerFor({ eid: exId, sid: s.id, cur: wDisp2 || 0, barType: exBarType.id })}
                      style={{ background: c.accent, border: "none", borderRadius: 12, padding: "10px 16px", fontSize: 20, fontWeight: 900, cursor: "pointer", color: "#fff", fontFamily: "inherit", flexShrink: 0, minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <IBarbell />
                    </button>
                  </div>
                )}
                {plates2.length === 0 && <div style={{ textAlign: "center", fontSize: 10, color: c.sub, marginTop: 4, letterSpacing: "0.04em" }}>Tap bar to load plates</div>}
                {useTextSummary && plates2.length > 0 && (
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 6, flexWrap: "wrap" }}>
                    {summaryGroups.map((g, gi) => (
                      <span key={gi} style={{ background: PCOL_USE2[g.w] || "#555", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>
                        {g.w}{g.n > 1 ? "×" + g.n : ""}
                      </span>
                    ))}
                    <span style={{ fontSize: 11, color: c.sub, alignSelf: "center" }}>per side</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Bodyweight inputs ── */}
      {!isCardioFocus && !isTimedFocus && isBW && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: c.sub, fontWeight: 700, marginBottom: 6 }}>REPS</div>
          <input
            type="number" inputMode="numeric"
            value={s.reps}
            onChange={v => upd(exId, s.id, "reps", v.target.value)}
            style={{ width: "100%", background: c.card2, border: "2px solid " + c.border, borderRadius: 12, padding: "14px 6px", fontSize: 22, fontWeight: 800, color: c.text, outline: "none", textAlign: "center", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          <div style={{ fontSize: 11, color: c.sub, fontWeight: 700, marginTop: 12, marginBottom: 6 }}>EXTRA WEIGHT ({unit})</div>
          <input
            type="number" inputMode="decimal"
            value={s.bwExtra || ""} placeholder="0"
            onChange={v => upd(exId, s.id, "bwExtra", v.target.value)}
            style={{ width: "100%", background: c.card2, border: "2px solid " + c.border, borderRadius: 12, padding: "14px 6px", fontSize: 22, fontWeight: 800, color: c.text, outline: "none", textAlign: "center", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          {bwLog.length > 0 && (parseFloat(s.bwExtra) || 0) > 0 && (() => {
            const total = unit === "lb"
              ? Math.round((kgToLb(bwLog[bwLog.length - 1].kg) + (parseFloat(s.bwExtra) || 0)) * 10) / 10
              : Math.round(((bwLog[bwLog.length - 1]?.kg || 0) + (parseFloat(s.bwExtra) || 0)) * 10) / 10;
            return (
              <div style={{ textAlign: "center", fontSize: 12, color: c.accent, fontWeight: 700, marginTop: 6, letterSpacing: "0.01em" }}>
                = {total}{unit} total bodyweight
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
