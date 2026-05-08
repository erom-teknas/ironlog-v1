import React, { useState, useEffect, memo } from 'react';

// Isolated workout-duration timer — manages its own setInterval so ticks never
// cause LogPage (1500+ lines) to re-render. memo + stable prop types keep it
// completely isolated: only re-renders when c (theme) changes.
const WorkoutTimer = memo(function WorkoutTimer({ draftWorkoutT0, c }) {
  const [elapsedSec, setElapsedSec] = useState(() =>
    draftWorkoutT0?.current ? Math.floor((Date.now() - draftWorkoutT0.current) / 1000) : 0
  );

  useEffect(() => {
    let t = null;
    function tick() {
      if (draftWorkoutT0?.current) {
        setElapsedSec(Math.floor((Date.now() - draftWorkoutT0.current) / 1000));
      }
    }
    function start() { t = setInterval(tick, 1000); }
    function stop() { clearInterval(t); t = null; }
    function onVis() { document.visibilityState === 'visible' ? start() : stop(); }
    document.addEventListener('visibilitychange', onVis);
    start();
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const ss = String(elapsedSec % 60).padStart(2, '0');

  return (
    <span style={{
      fontWeight: 800, fontSize: 13, color: c.text,
      fontFamily: 'monospace', letterSpacing: '-0.02em'
    }}>
      {mm}:{ss}
    </span>
  );
});

export default WorkoutTimer;
