import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';

// Lightweight virtual list — renders only visible items + an overscan buffer.
// Drop-in for a flat array: no library required.
// Props:
//   items      — array to render
//   itemHeight — estimated row height in px (used to compute spacers)
//   overscan   — extra rows to render above/below viewport (default 5)
//   renderItem — (item, index) => JSX
//   style      — style for the scroll container
const OVERSCAN = 5;

export default function VirtualList({ items, itemHeight = 50, overscan = OVERSCAN, renderItem, style }) {
  const containerRef = useRef(null);
  const [range, setRange] = useState({ start: 0, end: 40 });

  const recalc = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollTop, clientHeight } = el;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan);
    setRange(r => (r.start === start && r.end === end ? r : { start, end }));
  }, [items.length, itemHeight, overscan]);

  useLayoutEffect(() => {
    recalc();
  }, [items.length, recalc]);

  const topPad = range.start * itemHeight;
  const bottomPad = Math.max(0, (items.length - range.end) * itemHeight);
  const visible = items.slice(range.start, range.end);

  return (
    <div
      ref={containerRef}
      onScroll={recalc}
      style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none', ...style }}
    >
      {topPad > 0 && <div style={{ height: topPad }} />}
      {visible.map((item, i) => renderItem(item, range.start + i))}
      {bottomPad > 0 && <div style={{ height: bottomPad }} />}
    </div>
  );
}
