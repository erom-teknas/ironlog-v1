import React from 'react';
import { today } from '../utils';
import CollapsibleSection from './CollapsibleSection';
import WorkoutCalendar from './WorkoutCalendar';

export default function CalendarCard({hist,c,unit}){
  const thisMonth=today().slice(0,7);
  const sessionsThisMonth=hist.filter(w=>w.date.startsWith(thisMonth)).length;
  return(
    <CollapsibleSection title="Workout Calendar" icon="📅" sub={sessionsThisMonth+" session"+(sessionsThisMonth!==1?"s":"")+" this month"} c={c} defaultOpen={false}>
      <WorkoutCalendar hist={hist} c={c} unit={unit}/>
    </CollapsibleSection>
  );
}
