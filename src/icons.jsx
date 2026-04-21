import React from 'react';
import {
  Home, Dumbbell, CalendarDays, TrendingUp, Trophy, LayoutGrid, HelpCircle,
  Plus, Trash2, Check, X, ChevronRight, Share2, Sun, Moon, GripHorizontal,
  Scale, BarChart2, Clock, Flame, Target, Medal, Ruler, CalendarCheck,
  Activity, User,
} from 'lucide-react';

const ic = (Icon, size) => () => <Icon size={size} strokeWidth={2} />;

// Nav icons (20px)
export const IHome    = ic(Home, 20);
export const ILog     = ic(Dumbbell, 20);
export const IHist    = ic(CalendarDays, 20);
export const IChart   = ic(TrendingUp, 20);
export const IPR      = ic(Trophy, 20);
export const IGrid    = ic(LayoutGrid, 20);
export const IHelp    = ic(HelpCircle, 20);

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

export const TABS = [
  { id: "home",     label: "Home",     Icon: IHome  },
  { id: "log",      label: "Log",      Icon: ILog   },
  { id: "history",  label: "History",  Icon: IHist  },
  { id: "progress", label: "Progress", Icon: IChart },
  { id: "prs",      label: "PRs",      Icon: IPR    },
  { id: "routines", label: "Routines", Icon: IGrid  },
  { id: "help",     label: "Help",     Icon: IHelp  },
];
