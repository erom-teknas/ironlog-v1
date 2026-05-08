import React from 'react';
import {
  Home, Dumbbell, CalendarDays, TrendingUp, Trophy, LayoutGrid, HelpCircle,
  Plus, Trash2, Check, X, ChevronRight, Share2, Sun, Moon, GripHorizontal,
  Scale, BarChart2, Clock, Flame, Target, Medal, Ruler, CalendarCheck,
  Activity, User, Settings2,
  // Muscle group icons
  StretchHorizontal, MoveUp, Zap, PersonStanding, Layers, HeartPulse,
  // Additional functional icons for zero-emoji sweep
  Bell, AlertTriangle, Search, Star, Pencil, RefreshCw, WifiOff,
  Smartphone, Camera, AlertOctagon, ClipboardList, Package, Repeat2,
} from 'lucide-react';

const ic = (Icon, size) => () => <Icon size={size} strokeWidth={2} />;

// Nav icons (20px)
export const IHome     = ic(Home, 20);
export const ILog      = ic(Dumbbell, 20);
export const IHist     = ic(CalendarDays, 20);
export const IChart    = ic(TrendingUp, 20);
export const IPR       = ic(Trophy, 20);
export const IGrid     = ic(LayoutGrid, 20);
export const IHelp     = ic(HelpCircle, 20);
export const ISettings = ic(Settings2, 20);

// Action icons (14px)
export const IPlus    = ic(Plus, 15);
export const ITrash   = ic(Trash2, 14);
export const ICheck   = ic(Check, 13);
export const IX       = ic(X, 13);
export const IChev    = ic(ChevronRight, 14);
export const IShare   = ic(Share2, 14);
export const ISun     = ic(Sun, 16);
export const IMoon    = ic(Moon, 16);
export const IDrag    = ic(GripHorizontal, 16);

// Section icons (16px)
export const IScale        = ic(Scale, 16);
export const ITrendUp      = ic(TrendingUp, 16);
export const IBarChart     = ic(BarChart2, 16);
export const IClock        = ic(Clock, 16);
export const IFlame        = ic(Flame, 16);
export const ITarget       = ic(Target, 16);
export const IMedal        = ic(Medal, 16);
export const IRuler        = ic(Ruler, 16);
export const ICalendarGrid = ic(CalendarCheck, 16);
export const IActivity     = ic(Activity, 16);
export const IBodyScan     = ic(User, 16);

// Muscle group icons — for the exercise picker grid (24px, thinner stroke for card use)
const mg = (Icon) => ({ size=24, color='currentColor', strokeWidth=1.75 } = {}) =>
  <Icon size={size} strokeWidth={strokeWidth} color={color} />;

export const IMuscleChest     = mg(Dumbbell);           // bench press / pressing
export const IMuscleBack      = mg(StretchHorizontal);  // row / pull
export const IMuscleShoulders = mg(MoveUp);             // overhead press
export const IMuscleBiceps    = mg(Dumbbell);           // curl
export const IMuscleTriceps   = mg(Zap);                // extension / push
export const IMuscleLegs      = mg(PersonStanding);     // squat / standing
export const IMuscleCore      = mg(Target);             // centred / braced
export const IMuscleGlutes    = mg(Layers);             // hip thrust / posterior chain
export const IMuscleCardio    = mg(HeartPulse);         // pulse rate

// Additional functional icons
export const IBell        = ic(Bell, 16);
export const IAlert       = ic(AlertTriangle, 16);
export const ISearch      = ic(Search, 16);
export const IStar        = ic(Star, 16);
export const IPencil      = ic(Pencil, 14);

// Barbell icon — used on plate-loader button so intent is obvious
export const IBarbell = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* left plate */}
    <rect x="0.5" y="4.5" width="3" height="13" rx="1.5" fill="currentColor"/>
    {/* left collar */}
    <rect x="3.5" y="7" width="2" height="8" rx="0.75" fill="currentColor"/>
    {/* bar */}
    <rect x="5.5" y="10" width="11" height="2" rx="1" fill="currentColor"/>
    {/* right collar */}
    <rect x="16.5" y="7" width="2" height="8" rx="0.75" fill="currentColor"/>
    {/* right plate */}
    <rect x="18.5" y="4.5" width="3" height="13" rx="1.5" fill="currentColor"/>
  </svg>
);
export const IRefresh     = ic(RefreshCw, 14);
export const IWifiOff     = ic(WifiOff, 18);
export const ISmartphone  = ic(Smartphone, 16);
export const ICamera      = ic(Camera, 16);
export const ICrash       = ic(AlertOctagon, 28);
export const IClipboard   = ic(ClipboardList, 16);
export const IPackage     = ic(Package, 48);
export const IRepeat      = ic(Repeat2, 14);

export const TABS = [
  { id: "home",     label: "Home",     Icon: IHome  },
  { id: "log",      label: "Log",      Icon: ILog   },
  { id: "history",  label: "History",  Icon: IHist  },
  { id: "progress", label: "Progress", Icon: IChart },
  { id: "prs",      label: "PRs",      Icon: IPR    },
  { id: "plans", label: "Plans", Icon: IGrid  },
  { id: "help",     label: "Help",     Icon: IHelp  },
];
