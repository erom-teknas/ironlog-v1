import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MG } from '../constants';
import { useConfirm } from '../hooks.jsx';
import { IX, IChev, IStar } from '../icons';
import SwipeToDelete from './SwipeToDelete';

// ─── Muscle group visual config ──────────────────────────────────────────────
const MG_ICONS = {
  Chest:    {e:"🏋️",c:"#ef4444"},
  Back:     {e:"🤸",c:"#3b82f6"},
  Shoulders:{e:"🔺",c:"#f59e0b"},
  Biceps:   {e:"💪",c:"#8b5cf6"},
  Triceps:  {e:"🤜",c:"#ec4899"},
  Legs:     {e:"🦵",c:"#22c55e"},
  Core:     {e:"🎯",c:"#06b6d4"},
  Glutes:   {e:"🏃",c:"#f97316"},
  Cardio:   {e:"❤️",c:"#10d9a0"},
};

// Auto-guess inputType for new custom exercises based on muscle group
const guessExType = (muscle) =>
  muscle === "Cardio" ? "cardio"
  : (muscle === "Core" || muscle === "Glutes") ? "bodyweight"
  : "weighted";

// ─── ExercisePicker ───────────────────────────────────────────────────────────
// Owns all picker-internal state: screen, search, add-form, inline rename.
// Rendered as a portal so it overlays any stack.
export default function ExercisePicker({
  c,
  customExercises = {},
  onAddCustomEx,
  onDeleteCustomEx,
  onRenameCustomEx,
  onAddEx,   // (name, muscle) — LogPage adds the exercise + closes the picker
  onClose,   // () — parent sets picker=false
}) {
  const [pickerScreen, setPickerScreen] = useState("grid"); // "grid" | "list"
  const [pm, setPm] = useState(MG[0]);
  const [search, setSearch] = useState("");
  const [newExName, setNewExName] = useState("");
  const [newExType, setNewExType] = useState("weighted");
  const [editingEx, setEditingEx] = useState(null);
  const [editExVal, setEditExVal] = useState("");
  const { confirm: dlgConfirm, confirmEl } = useConfirm(c);

  // ── Lazy-load exercise list ─────────────────────────────────────────────────
  const [EX, setEX] = useState(null);
  useEffect(() => { import('../exercises.js').then(m => setEX(m.EX)); }, []);

  // ── Computed ────────────────────────────────────────────────────────────────
  const searchLower = search.toLowerCase().trim();
  const filteredCustom = (customExercises[pm] || []).filter(
    n => !searchLower || n.toLowerCase().includes(searchLower)
  );
  const filteredBuiltin = EX ? (EX[pm] || []).filter(
    n => !searchLower || n.toLowerCase().includes(searchLower)
  ) : [];
  const crossResults = searchLower ? [
    ...Object.entries(customExercises).flatMap(([m, names]) =>
      names.filter(n => n.toLowerCase().includes(searchLower)).map(n => ({ name: n, muscle: m, custom: true }))
    ),
    ...(EX ? Object.entries(EX).flatMap(([m, names]) =>
      names.filter(n => n.toLowerCase().includes(searchLower)).map(n => ({ name: n, muscle: m, custom: false }))
    ) : []),
  ].filter((r, i, a) => a.findIndex(x => x.name === r.name) === i) : [];

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openMuscle = (m) => {
    setPm(m);
    setPickerScreen("list");
    setSearch("");
    setNewExName("");
    setNewExType(guessExType(m));
    setEditingEx(null);
  };

  const submitNewEx = () => {
    const n = newExName.trim().slice(0, 50);
    if (!n) return;
    if ((customExercises[pm] || []).includes(n) || (EX && (EX[pm] || []).includes(n))) {
      dlgConfirm('"' + n + '" already exists in ' + pm + '. Choose a different name.').then(() => {});
      return;
    }
    onAddCustomEx(pm, n, newExType);
    setNewExName("");
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9300,
        display: "flex", alignItems: "flex-end", backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)", cursor: "pointer", touchAction: "manipulation",
      }}
    >
      {confirmEl}
      <div
        onClick={e => e.stopPropagation()}
        className="il-slide-up"
        style={{
          background: c.card, borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 430,
          margin: "0 auto", maxHeight: "calc(92dvh - env(safe-area-inset-top,0px))",
          display: "flex", flexDirection: "column", boxSizing: "border-box",
          overflow: "hidden", cursor: "default", touchAction: "auto",
        }}
      >

        {/* ── Shared sticky header ── */}
        <div style={{ flexShrink: 0, padding: "14px 16px 0", background: c.card }}>
          <div style={{ width: 36, height: 4, background: c.border, borderRadius: 99, margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            {pickerScreen === "list" && !searchLower && (
              <button
                onClick={() => setPickerScreen("grid")}
                style={{
                  background: c.card2, border: "none", borderRadius: 10, padding: "8px 12px",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", color: c.text,
                  fontFamily: "inherit", flexShrink: 0, minHeight: 44,
                  display: "flex", alignItems: "center", gap: 4, touchAction: "manipulation",
                }}
              >
                ← {pm}
              </button>
            )}
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: c.text, letterSpacing: "-0.02em", flex: 1 }}>
              {searchLower ? 'Results for "' + search + '"' : (pickerScreen === "grid" ? "Add Exercise" : pm)}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: c.card2, border: "none", borderRadius: 10, padding: 10,
                cursor: "pointer", color: c.sub, display: "flex",
                minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center",
                touchAction: "manipulation",
              }}
            >
              <IX />
            </button>
          </div>

          {/* Global search — always visible, bypasses grid when active */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 15, pointerEvents: "none", opacity: 0.45,
            }}>🔍</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); if (e.target.value) setPickerScreen("list"); }}
              placeholder="Quick search any exercise…"
              style={{
                width: "100%", background: c.card2,
                border: "1.5px solid " + (searchLower ? c.accent : c.border),
                borderRadius: 12, padding: "10px 12px 10px 36px",
                fontSize: 16, color: c.text, outline: "none",
                fontFamily: "inherit", boxSizing: "border-box", transition: "border-color .15s",
              }}
            />
            {searchLower && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: c.sub,
                  fontSize: 16, padding: 4, minHeight: 36, minWidth: 36,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >×</button>
            )}
          </div>
        </div>

        {/* ── SCREEN 1: Muscle Group Grid ── */}
        {pickerScreen === "grid" && !searchLower && (
          <div style={{
            flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch",
            overscrollBehavior: "none", padding: "4px 16px",
            paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 24px)",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {MG.map(m => {
                const meta = MG_ICONS[m] || { e: "💪", c: c.accent };
                const exCount = (EX ? (EX[m] || []).length : 0) + (customExercises[m] || []).length;
                return (
                  <button
                    key={m}
                    onClick={() => openMuscle(m)}
                    style={{
                      background: c.card2, border: "1.5px solid " + c.border, borderRadius: 18,
                      padding: "18px 8px 14px", cursor: "pointer", fontFamily: "inherit",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      touchAction: "manipulation", transition: "transform .12s,border-color .12s,background .12s",
                      WebkitTapHighlightColor: "transparent", minHeight: 100,
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: meta.c + "22", border: "2px solid " + meta.c + "55",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    }}>
                      {meta.e}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        fontSize: 13, fontWeight: 800, color: c.text,
                        letterSpacing: "-0.01em", whiteSpace: "nowrap",
                      }}>{m}</div>
                      <div style={{ fontSize: 10, color: c.sub, marginTop: 1, fontWeight: 500 }}>
                        {exCount} exercises
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SCREEN 2: Exercise List (single muscle or cross-search) ── */}
        {(pickerScreen === "list" || searchLower) && (
          <div style={{
            flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch",
            overscrollBehavior: "none", padding: "0 16px",
            paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 48px)",
          }}>

            {/* Cross-group search results */}
            {searchLower && crossResults.length > 0 && (
              <div>
                {crossResults.map(r => (
                  <button
                    key={r.name + r.muscle}
                    onClick={() => onAddEx(r.name, r.muscle)}
                    style={{
                      width: "100%", textAlign: "left", background: "none", border: "none",
                      borderBottom: "1px solid " + c.border, padding: "13px 4px",
                      fontSize: 15, color: r.custom ? c.accent : c.text, cursor: "pointer",
                      fontFamily: "inherit", display: "flex", justifyContent: "space-between",
                      alignItems: "center", fontWeight: r.custom ? 700 : 500, touchAction: "manipulation",
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.custom ? "★ " : ""}{r.name}
                    </span>
                    <span style={{
                      fontSize: 10, color: c.sub, fontWeight: 600, flexShrink: 0, marginLeft: 8,
                      background: c.card2, borderRadius: 8, padding: "2px 6px",
                    }}>{r.muscle}</span>
                  </button>
                ))}
              </div>
            )}
            {searchLower && crossResults.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: c.sub, fontSize: 14 }}>
                No exercises matching "{search}"
              </div>
            )}

            {/* Single-muscle list */}
            {!searchLower && <>
              {/* Custom exercises */}
              {filteredCustom.length > 0 && (
                <div style={{ marginBottom: 8, marginTop: 4 }}>
                  <div style={{
                    fontSize: 10, color: c.sub, fontWeight: 700,
                    letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 2,
                  }}>
                    MY EXERCISES · swipe left to delete
                  </div>
                  {filteredCustom.map(name => (
                    <SwipeToDelete key={name} onDelete={() => onDeleteCustomEx(pm, name)} c={c}>
                      {editingEx === name
                        ? <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "8px 4px" }}>
                            <input
                              autoFocus
                              value={editExVal}
                              onChange={e => setEditExVal(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") { onRenameCustomEx(pm, name, editExVal); setEditingEx(null); }
                                if (e.key === "Escape") setEditingEx(null);
                              }}
                              style={{
                                flex: 1, background: c.card2, border: "1.5px solid " + c.accent,
                                borderRadius: 9, padding: "6px 10px", fontSize: 14,
                                color: c.text, outline: "none", fontFamily: "inherit",
                              }}
                            />
                            <button
                              onClick={() => { onRenameCustomEx(pm, name, editExVal); setEditingEx(null); }}
                              style={{
                                background: c.accent, border: "none", borderRadius: 8,
                                padding: "6px 11px", fontSize: 12, fontWeight: 700,
                                cursor: "pointer", color: "#fff", fontFamily: "inherit",
                              }}
                            >Save</button>
                            <button
                              onClick={() => setEditingEx(null)}
                              style={{
                                background: c.card2, border: "none", borderRadius: 8,
                                padding: "6px 10px", fontSize: 12, cursor: "pointer",
                                color: c.sub, fontFamily: "inherit",
                              }}
                            ><IX /></button>
                          </div>
                        : <>
                            <button
                              onClick={() => onAddEx(name, pm)}
                              style={{
                                flex: 1, textAlign: "left", background: "none", border: "none",
                                padding: "13px 4px", fontSize: 15, color: c.accent,
                                cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                              }}
                            ><IStar size={12} style={{ marginRight: 4 }} />{name}</button>
                            <button
                              onClick={() => { setEditingEx(name); setEditExVal(name); }}
                              style={{
                                background: "none", border: "none", padding: "8px 10px",
                                cursor: "pointer", color: c.sub, fontSize: 12, fontFamily: "inherit",
                              }}
                            >Edit</button>
                          </>
                      }
                    </SwipeToDelete>
                  ))}
                </div>
              )}

              {/* Add custom exercise */}
              <div style={{ marginBottom: 14, marginTop: filteredCustom.length ? 0 : 8 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                  <input
                    value={newExName}
                    onChange={e => setNewExName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") submitNewEx(); }}
                    placeholder={"Add custom " + pm + " exercise…"}
                    style={{
                      flex: 1, background: c.card2, border: "1.5px solid " + c.border,
                      borderRadius: 11, padding: "9px 12px", fontSize: 16,
                      color: c.text, outline: "none", fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={submitNewEx}
                    disabled={!newExName.trim()}
                    style={{
                      background: newExName.trim() ? c.accent : c.muted, border: "none",
                      borderRadius: 11, padding: "9px 14px", fontSize: 13, fontWeight: 700,
                      cursor: newExName.trim() ? "pointer" : "default",
                      color: newExName.trim() ? "#fff" : c.sub,
                      fontFamily: "inherit", flexShrink: 0,
                    }}
                  >Add</button>
                </div>
                {/* Input type picker — auto-guessed, user can override */}
                <div style={{ display: "flex", gap: 5 }}>
                  {[["weighted","Weighted"],["bodyweight","Bodyweight"],["cardio","Cardio"],["timed","Timed"]].map(([t, label]) => (
                    <button
                      key={t}
                      onClick={() => setNewExType(t)}
                      style={{
                        flex: 1, background: newExType === t ? c.accent + "22" : c.card2,
                        border: "1px solid " + (newExType === t ? c.accent : c.border),
                        borderRadius: 8, padding: "5px 2px", fontSize: 10, fontWeight: 700,
                        cursor: "pointer", color: newExType === t ? c.accent : c.sub,
                        fontFamily: "inherit", touchAction: "manipulation",
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {/* Built-in exercises */}
              {filteredCustom.length > 0 && (
                <div style={{
                  fontSize: 10, color: c.sub, fontWeight: 700,
                  letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 2,
                }}>BUILT-IN</div>
              )}
              {filteredBuiltin.map(name => (
                <button
                  key={name}
                  onClick={() => onAddEx(name, pm)}
                  style={{
                    width: "100%", textAlign: "left", background: "none", border: "none",
                    borderBottom: "1px solid " + c.border, padding: "14px 4px",
                    fontSize: 15, color: c.text, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 6, fontWeight: 500, touchAction: "manipulation",
                    contentVisibility: "auto", containIntrinsicBlockSize: "50px",
                  }}
                >
                  <span style={{
                    flex: 1, minWidth: 0, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{name}</span>
                  <IChev style={{ flexShrink: 0 }} />
                </button>
              ))}
              {filteredCustom.length === 0 && filteredBuiltin.length === 0 && (
                <div style={{ textAlign: "center", padding: "28px 0", color: c.sub, fontSize: 14 }}>
                  No exercises in {pm} yet
                </div>
              )}
            </>}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
