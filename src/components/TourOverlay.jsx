import React, { useState, useLayoutEffect } from 'react';

// ─── Tour step definitions — 8 focused steps ─────────────────────────────────
// anchor: data-tour attribute value to spotlight; null = centered modal
export const TOUR_STEPS = [
  {
    tab:"home", anchor:null,
    emoji:"🏋️", title:"Welcome to IronLog",
    body:"A quick tour to get you lifting in under 60 seconds. Fully offline — your data never leaves your phone.",
  },
  {
    tab:"home", anchor:"home-ctas",
    emoji:"▶️", title:"Start Training",
    body:"Tap Start Workout for a freestyle session, or Use Plan to load a saved plan with last session's weights pre-filled.",
  },
  {
    tab:"log", anchor:"nav-log",
    emoji:"📝", title:"The Log Tab",
    body:"The glowing center button is your gym. Tap it anytime to start or resume a workout, add exercises, and log sets.",
  },
  {
    tab:"history", anchor:"nav-history",
    emoji:"📋", title:"History",
    body:"Every session lives here. Search by exercise, muscle, or date. Repeat any past workout with one tap.",
  },
  {
    tab:"progress", anchor:"nav-progress",
    emoji:"📈", title:"Progress",
    body:"Strength charts, volume trends, muscle balance radar, and strength standards — all from your training history.",
  },
  {
    tab:"plans", anchor:"nav-plans",
    emoji:"📅", title:"Plans",
    body:"Save workout programs here. Enable auto-progression and weights increase automatically each session you complete.",
  },
  {
    tab:"prs", anchor:"nav-prs",
    emoji:"🏆", title:"Personal Records",
    body:"Your all-time bests ranked by estimated 1RM. Medals for your top 3 lifts. Tap any exercise for a full trend chart.",
  },
  {
    tab:"home", anchor:null,
    emoji:"🎉", title:"You're all set!",
    body:"Find this tour again in the Help tab anytime. Now go lift something heavy. 💪",
  },
];

// ─── TourOverlay component ────────────────────────────────────────────────────
export default function TourOverlay({ c, step, onNext, onPrev, onSkip }) {
  const s      = TOUR_STEPS[step];
  const total  = TOUR_STEPS.length;
  const isFirst = step === 0;
  const isLast  = step === total - 1;

  const PAD = 10; // spotlight padding around element
  const GAP = 10; // gap between spotlight and callout bubble

  const [spotRect, setSpotRect] = useState(null);
  const [visible,  setVisible]  = useState(true);

  useLayoutEffect(() => {
    // Cross-fade on step change
    setVisible(false);
    const fadeIn = setTimeout(() => setVisible(true), 90);

    if (!s.anchor) {
      setSpotRect(null);
      return () => clearTimeout(fadeIn);
    }

    const capture = () => {
      const el = document.querySelector('[data-tour="' + s.anchor + '"]');
      if (el) {
        const r = el.getBoundingClientRect();
        // Sanity-check: rect must be inside the visible viewport.
        // Negative top means the scroll reset hasn't propagated yet — bail and
        // let the retry handle it.
        if (r.top < 0 || r.top > window.innerHeight) { setSpotRect(null); return; }
        setSpotRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setSpotRect(null);
      }
    };

    const findEl = () => {
      const el = document.querySelector('[data-tour="' + s.anchor + '"]');
      if (!el) { setSpotRect(null); return; }

      const scroller = document.querySelector('.il-scroll');
      const inScroller = scroller && scroller.contains(el);

      if (inScroller) {
        // Bug fix 1 & 2: .il-scroll carries its scrollTop across tab switches.
        // Reset to 0 first so the element's offsetTop is always measured from
        // the top of the content, then use block:'center' so the element lands
        // in the middle of the visible area (not under the fixed topbar).
        scroller.scrollTop = 0;
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
      }

      // Two rAF ticks: first lets the browser commit the scroll, second ensures
      // any pending layout from the scroll is flushed before measuring.
      requestAnimationFrame(() => requestAnimationFrame(capture));
    };

    findEl();
    // Bug fix 3: tab-switch animation (il-enter-r) runs for 220ms.
    // getBoundingClientRect() during a translateX animation returns the animated
    // (mid-slide) coordinate, not the resting position.
    // 380ms > 220ms animation + one rAF buffer — rect is stable by then.
    const retry = setTimeout(findEl, 380);
    return () => { clearTimeout(fadeIn); clearTimeout(retry); };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Shared: step progress dots ─────────────────────────────────────────────
  function Dots({ size = 'lg' }) {
    return (
      <div style={{ display:'flex', gap:4, justifyContent:'center', marginBottom: size==='lg' ? 20 : 8 }}>
        {TOUR_STEPS.map((_, i) => (
          <div key={i} style={{
            width:  i === step ? (size==='lg' ? 22 : 16) : (size==='lg' ? 7 : 5),
            height: size==='lg' ? 7 : 5,
            borderRadius: 4,
            background: i === step ? c.accent : c.card2,
            transition: 'width .25s cubic-bezier(.4,0,.2,1), background .25s',
          }}/>
        ))}
      </div>
    );
  }

  // ── Shared: nav buttons ────────────────────────────────────────────────────
  function NavButtons({ compact }) {
    const btnBase = {
      border:'none', cursor:'pointer', fontFamily:'inherit',
      fontWeight:700, borderRadius: compact ? 10 : 14,
    };
    return (
      <div style={{ display:'flex', gap: compact ? 5 : 8, alignItems:'center' }}>
        {!isFirst && (
          <button onClick={onPrev} style={{
            ...btnBase,
            background: c.card2,
            border: '1px solid ' + c.border,
            padding: compact ? '9px 13px' : '12px 16px',
            fontSize: compact ? 15 : 16,
            color: c.sub,
            flexShrink: 0,
          }}>‹</button>
        )}
        {!isLast && (
          <button onClick={onSkip} style={{
            ...btnBase,
            background: 'none',
            padding: compact ? '9px 6px' : '12px 8px',
            fontSize: compact ? 12 : 13,
            color: c.sub,
            flexShrink: 0,
          }}>Skip</button>
        )}
        <button onClick={onNext} style={{
          ...btnBase,
          flex: 1,
          background: 'linear-gradient(135deg,' + c.accent + ',' + c.accent + 'cc)',
          padding: compact ? '10px' : '14px',
          fontSize: compact ? 13 : 15,
          fontWeight: 800,
          color: '#fff',
          boxShadow: '0 4px 20px ' + c.accent + '44',
        }}>{isLast ? 'Start Lifting 💪' : 'Next →'}</button>
      </div>
    );
  }

  // ── Centered modal (welcome / done, or element not found) ──────────────────
  if (!s.anchor || !spotRect) {
    return (
      <div style={{
        position:'fixed', inset:0, zIndex:9500,
        background:'rgba(8,8,15,0.88)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'24px 20px',
        pointerEvents:'all',
        opacity: visible ? 1 : 0,
        transition:'opacity 0.18s ease',
      }}>
        <div style={{
          background: c.card,
          borderRadius: 28,
          padding:'28px 24px 22px',
          width:'100%', maxWidth:360,
          boxShadow:'0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px ' + c.border,
          textAlign:'center',
        }}>
          <Dots size="lg" />
          <div style={{ fontSize:52, marginBottom:12, lineHeight:1 }}>{s.emoji}</div>
          <div style={{ fontSize:23, fontWeight:900, color:c.text, letterSpacing:'-0.03em', marginBottom:10, lineHeight:1.2 }}>{s.title}</div>
          <div style={{ fontSize:14.5, color:c.sub, lineHeight:1.65, marginBottom:24 }}>{s.body}</div>
          <NavButtons compact={false} />
        </div>
      </div>
    );
  }

  // ── Spotlight mode ─────────────────────────────────────────────────────────
  const sTop  = spotRect.top    - PAD;
  const sLeft = spotRect.left   - PAD;
  const sW    = spotRect.width  + PAD * 2;
  const sH    = spotRect.height + PAD * 2;
  const sR    = Math.min(sH / 2 + 4, 26); // border-radius

  // Element center x (for aligning callout arrow)
  const spotCX = sLeft + sW / 2;

  // Callout goes above element if element is in the bottom 55% of the screen
  const calloutAbove = spotRect.top + spotRect.height / 2 > window.innerHeight * 0.52;

  // Callout width + horizontal clamping
  const calloutW = Math.min(296, window.innerWidth - 32);
  const idealLeft  = spotCX - calloutW / 2;
  const clampedLeft = Math.max(16, Math.min(idealLeft, window.innerWidth - calloutW - 16));

  // Arrow offset within callout (pointing toward spotlight center)
  const arrowLeft = Math.min(Math.max(spotCX - clampedLeft - 8, 18), calloutW - 34);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9500, pointerEvents:'none' }}>

      {/* ── Punch-hole spotlight ──────────────────────────────────────────── */}
      <div style={{
        position:'absolute',
        top:  sTop,
        left: sLeft,
        width:  sW,
        height: sH,
        borderRadius: sR,
        // The 9999px spread creates the full-screen dim; second shadow = pulse ring
        boxShadow: '0 0 0 9999px rgba(8,8,15,0.82)',
        border: '2px solid ' + c.accent + '99',
        animation: 'il-spot-pulse 2s ease-in-out infinite',
        opacity: visible ? 1 : 0,
        transition: [
          'opacity 0.2s ease',
          'top .32s cubic-bezier(.4,0,.2,1)',
          'left .32s cubic-bezier(.4,0,.2,1)',
          'width .32s cubic-bezier(.4,0,.2,1)',
          'height .32s cubic-bezier(.4,0,.2,1)',
        ].join(','),
      }}/>

      {/* ── Callout bubble ────────────────────────────────────────────────── */}
      <div style={{
        position:'absolute',
        ...(calloutAbove
          ? { bottom: window.innerHeight - sTop + GAP }
          : { top:    sTop + sH + GAP }
        ),
        left: clampedLeft,
        width: calloutW,
        background: c.card,
        borderRadius: 20,
        padding:'13px 15px 11px',
        boxShadow:'0 12px 48px rgba(0,0,0,0.55), 0 0 0 1px ' + c.border,
        pointerEvents:'all',
        opacity: visible ? 1 : 0,
        transition:'opacity 0.18s ease',
      }}>

        {/* Triangle arrow pointing toward spotlight */}
        <div style={{
          position:'absolute',
          [calloutAbove ? 'bottom' : 'top']: -7,
          left: arrowLeft,
          width:0, height:0,
          borderLeft:'8px solid transparent',
          borderRight:'8px solid transparent',
          [calloutAbove ? 'borderTop' : 'borderBottom']: '8px solid ' + c.card,
        }}/>

        <Dots size="sm" />

        {/* Title row */}
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
          <span style={{ fontSize:20, lineHeight:1, flexShrink:0 }}>{s.emoji}</span>
          <span style={{ fontSize:15, fontWeight:800, color:c.text, letterSpacing:'-0.02em', lineHeight:1.25 }}>{s.title}</span>
        </div>

        <div style={{ fontSize:12.5, color:c.sub, lineHeight:1.6, marginBottom:10 }}>{s.body}</div>

        <NavButtons compact={true} />
      </div>
    </div>
  );
}
