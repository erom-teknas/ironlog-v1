// ─── Theme ────────────────────────────────────────────────────────────────────
export const D={bg:"#08080f",card:"#0e0e1a",card2:"#141422",border:"#1e1e30",text:"#f0f0ff",sub:"#48486e",muted:"#0c0c18",accent:"#7C6EFA",as:"rgba(124,110,250,0.13)",at:"#a89dff",g:"#10d9a0",gs:"rgba(16,217,160,0.11)",r:"#f56565",rs:"rgba(245,101,101,0.11)",am:"#f6a835",ams:"rgba(246,168,53,0.11)",nav:"rgba(8,8,15,0.96)"};
export const L={bg:"#f1f1f8",card:"#ffffff",card2:"#f5f5fc",border:"#e2e2f0",text:"#0e0e20",sub:"#7070a0",muted:"#e8e8f5",accent:"#5548d9",as:"rgba(85,72,217,0.1)",at:"#5548d9",g:"#059669",gs:"rgba(5,150,105,0.1)",r:"#dc2626",rs:"rgba(220,38,38,0.1)",am:"#d97706",ams:"rgba(217,119,6,0.1)",nav:"rgba(241,241,248,0.96)"};
export const O={bg:"#000000",card:"#0a0a10",card2:"#0f0f18",border:"#1a1a2a",text:"#f0f0ff",sub:"#48486e",muted:"#08080f",accent:"#7C6EFA",as:"rgba(124,110,250,0.13)",at:"#a89dff",g:"#10d9a0",gs:"rgba(16,217,160,0.11)",r:"#f56565",rs:"rgba(245,101,101,0.11)",am:"#f6a835",ams:"rgba(246,168,53,0.11)",nav:"rgba(0,0,0,0.97)"};

// ─── Color Themes (14 total) ──────────────────────────────────────────────────
// All dark-mode palettes. Light mode always uses L above.
// ghost = placeholder accent color at ~42% opacity for ghost-copy inputs.
export const THEMES={
  midnight:{name:"Midnight",icon:"🌌",bg:"#08080f",card:"#0e0e1a",card2:"#141422",border:"#1e1e30",text:"#f0f0ff",sub:"#48486e",muted:"#0c0c18",accent:"#7C6EFA",as:"rgba(124,110,250,0.13)",at:"#a89dff",ghost:"rgba(168,157,255,0.48)",g:"#10d9a0",gs:"rgba(16,217,160,0.11)",r:"#f56565",rs:"rgba(245,101,101,0.11)",am:"#f6a835",ams:"rgba(246,168,53,0.11)",nav:"rgba(8,8,15,0.96)"},
  emerald: {name:"Emerald",  icon:"🌿",bg:"#061009",card:"#0c1a10",card2:"#122016",border:"#1a2e1e",text:"#e8fff2",sub:"#3d6b4a",muted:"#081208",accent:"#10d9a0",as:"rgba(16,217,160,0.12)",at:"#4debb8",ghost:"rgba(77,235,184,0.48)",g:"#10d9a0",gs:"rgba(16,217,160,0.13)",r:"#f56565",rs:"rgba(245,101,101,0.11)",am:"#f6a835",ams:"rgba(246,168,53,0.11)",nav:"rgba(6,16,9,0.96)"},
  cyberpunk:{name:"Cyberpunk",icon:"⚡",bg:"#050c14",card:"#0a1520",card2:"#0f1d2a",border:"#132436",text:"#e0f4ff",sub:"#3a5572",muted:"#080f18",accent:"#06b6d4",as:"rgba(6,182,212,0.12)",at:"#38d4f0",ghost:"rgba(56,212,240,0.48)",g:"#10d9a0",gs:"rgba(16,217,160,0.11)",r:"#f56565",rs:"rgba(245,101,101,0.11)",am:"#f6a835",ams:"rgba(246,168,53,0.11)",nav:"rgba(5,12,20,0.96)"},
  amoled:  {name:"Amoled",   icon:"⬛",bg:"#000000",card:"#0a0a0f",card2:"#0f0f18",border:"#1a1a2a",text:"#f0f0ff",sub:"#48486e",muted:"#050508",accent:"#7C6EFA",as:"rgba(124,110,250,0.13)",at:"#a89dff",ghost:"rgba(168,157,255,0.48)",g:"#10d9a0",gs:"rgba(16,217,160,0.11)",r:"#f56565",rs:"rgba(245,101,101,0.11)",am:"#f6a835",ams:"rgba(246,168,53,0.11)",nav:"rgba(0,0,0,0.98)"},
  nordic:  {name:"Nordic",   icon:"❄️",bg:"#0d1117",card:"#161b22",card2:"#1c2330",border:"#21262d",text:"#e6edf3",sub:"#4a5568",muted:"#0a0d13",accent:"#88c0d0",as:"rgba(136,192,208,0.12)",at:"#a8d8e8",ghost:"rgba(168,216,232,0.48)",g:"#2ea043",gs:"rgba(46,160,67,0.13)",r:"#f85149",rs:"rgba(248,81,73,0.11)",am:"#e3b341",ams:"rgba(227,179,65,0.11)",nav:"rgba(13,17,23,0.96)"},
  solarized:{name:"Solarized",icon:"☀️",bg:"#002b36",card:"#073642",card2:"#094652",border:"#0d525f",text:"#fdf6e3",sub:"#586e75",muted:"#00212b",accent:"#268bd2",as:"rgba(38,139,210,0.15)",at:"#4da6e8",ghost:"rgba(77,166,232,0.50)",g:"#859900",gs:"rgba(133,153,0,0.13)",r:"#dc322f",rs:"rgba(220,50,47,0.12)",am:"#b58900",ams:"rgba(181,137,0,0.12)",nav:"rgba(0,43,54,0.97)"},
  dracula:  {name:"Dracula",  icon:"🧛",bg:"#282a36",card:"#343746",card2:"#3c3f54",border:"#44475a",text:"#f8f8f2",sub:"#6272a4",muted:"#21222c",accent:"#bd93f9",as:"rgba(189,147,249,0.13)",at:"#d4b0fc",ghost:"rgba(212,176,252,0.46)",g:"#50fa7b",gs:"rgba(80,250,123,0.11)",r:"#ff5555",rs:"rgba(255,85,85,0.11)",am:"#ffb86c",ams:"rgba(255,184,108,0.11)",nav:"rgba(40,42,54,0.97)"},
  "retro-gold":{name:"Retro Gold",icon:"🏅",bg:"#0f0b05",card:"#1a130a",card2:"#221a0f",border:"#2e2210",text:"#fff8e6",sub:"#6b5430",muted:"#0a0804",accent:"#f6a835",as:"rgba(246,168,53,0.13)",at:"#ffc24a",ghost:"rgba(255,194,74,0.48)",g:"#10d9a0",gs:"rgba(16,217,160,0.11)",r:"#f56565",rs:"rgba(245,101,101,0.11)",am:"#f6a835",ams:"rgba(246,168,53,0.13)",nav:"rgba(15,11,5,0.97)"},
  "neon-tokyo":{name:"Neon Tokyo",icon:"🌸",bg:"#08030f",card:"#120920",card2:"#190e2c",border:"#241438",text:"#fff0fa",sub:"#5a3a6e",muted:"#060210",accent:"#ff2d78",as:"rgba(255,45,120,0.13)",at:"#ff6aa0",ghost:"rgba(255,106,160,0.46)",g:"#39ff14",gs:"rgba(57,255,20,0.10)",r:"#ff2d78",rs:"rgba(255,45,120,0.11)",am:"#f6e835",ams:"rgba(246,232,53,0.11)",nav:"rgba(8,3,15,0.97)"},
  outrun:   {name:"Outrun",   icon:"🚗",bg:"#0a0118",card:"#120a28",card2:"#1a0f38",border:"#261544",text:"#fff0ff",sub:"#5c3878",muted:"#070010",accent:"#f72585",as:"rgba(247,37,133,0.13)",at:"#ff6cb8",ghost:"rgba(255,108,184,0.46)",g:"#4cc9f0",gs:"rgba(76,201,240,0.10)",r:"#f72585",rs:"rgba(247,37,133,0.11)",am:"#f8b500",ams:"rgba(248,181,0,0.11)",nav:"rgba(10,1,24,0.97)"},
  titanium: {name:"Titanium", icon:"🔩",bg:"#0d0d0f",card:"#161618",card2:"#1e1e22",border:"#2a2a30",text:"#e8e8f0",sub:"#5a5a6e",muted:"#0a0a0c",accent:"#94a3b8",as:"rgba(148,163,184,0.12)",at:"#b0bfd4",ghost:"rgba(176,191,212,0.46)",g:"#10d9a0",gs:"rgba(16,217,160,0.10)",r:"#f56565",rs:"rgba(245,101,101,0.10)",am:"#f6a835",ams:"rgba(246,168,53,0.10)",nav:"rgba(13,13,15,0.97)"},
  coffee:   {name:"Coffee",   icon:"☕",bg:"#1a0f07",card:"#241508",card2:"#2e1c0f",border:"#3d2613",text:"#fff8f0",sub:"#7a5a3a",muted:"#100a04",accent:"#c49a6c",as:"rgba(196,154,108,0.13)",at:"#d4b48c",ghost:"rgba(212,180,140,0.50)",g:"#10d9a0",gs:"rgba(16,217,160,0.10)",r:"#f56565",rs:"rgba(245,101,101,0.10)",am:"#f6a835",ams:"rgba(246,168,53,0.11)",nav:"rgba(26,15,7,0.97)"},
  crimson:  {name:"Crimson Tide",icon:"🔴",bg:"#0f0508",card:"#1a080e",card2:"#220c14",border:"#30101c",text:"#fff0f0",sub:"#6e3040",muted:"#0a0305",accent:"#f56565",as:"rgba(245,101,101,0.13)",at:"#f88080",ghost:"rgba(248,128,128,0.46)",g:"#10d9a0",gs:"rgba(16,217,160,0.10)",r:"#f56565",rs:"rgba(245,101,101,0.13)",am:"#f6a835",ams:"rgba(246,168,53,0.10)",nav:"rgba(15,5,8,0.97)"},
  oceanic:  {name:"Oceanic",  icon:"🌊",bg:"#050d12",card:"#091520",card2:"#0d1e2c",border:"#122636",text:"#e0f4ff",sub:"#2e5a72",muted:"#040a0f",accent:"#0891b2",as:"rgba(8,145,178,0.13)",at:"#22b8d6",ghost:"rgba(34,184,214,0.48)",g:"#10d9a0",gs:"rgba(16,217,160,0.11)",r:"#f56565",rs:"rgba(245,101,101,0.10)",am:"#f6a835",ams:"rgba(246,168,53,0.10)",nav:"rgba(5,13,18,0.97)"},
};
export const THEME_ORDER=["midnight","emerald","cyberpunk","amoled","nordic","solarized","dracula","retro-gold","neon-tokyo","outrun","titanium","coffee","crimson","oceanic"];

// ─── Data ─────────────────────────────────────────────────────────────────────
export const MG=["Chest","Back","Shoulders","Biceps","Triceps","Legs","Core","Glutes","Cardio"];
export const EX={
  Chest:[
    // Barbell
    "Bench Press","Incline Bench Press","Decline Bench Press","Close-Grip Bench Press",
    "Wide-Grip Bench Press","Spoto Press","Floor Press","Paused Bench Press","Guillotine Press",
    // Dumbbell
    "Flat DB Press","Incline DB Press","Decline DB Press","DB Fly","Incline DB Fly",
    "Decline DB Fly","DB Pullover","Neutral-Grip DB Press","Single-Arm DB Press","Dumbbell Squeeze Press",
    // Cable
    "Cable Fly","Low-to-High Cable Fly","High-to-Low Cable Fly","Single-Arm Cable Fly",
    "Cable Crossover","Incline Cable Fly","Decline Cable Fly",
    // Machine
    "Pec Deck","Machine Chest Press","Smith Machine Bench Press","Smith Machine Incline Press",
    "Hammer Strength Chest Press","Incline Hammer Strength Press","Chest Dip Machine","Machine Fly",
    // Bodyweight
    "Push-Up","Wide Push-Up","Decline Push-Up","Incline Push-Up","Archer Push-Up",
    "Clap Push-Up","Ring Push-Up","Pseudo Planche Push-Up","T-Push-Up","Chest Dip","Weighted Push-Up",
    // Other
    "Svend Press","Landmine Press","Resistance Band Fly","Hex Press","Plate Press","TRX Fly"
  ],
  Back:[
    // Pull-Up
    "Pull-Up","Chin-Up","Wide-Grip Pull-Up","Neutral-Grip Pull-Up","Weighted Pull-Up",
    "Assisted Pull-Up","Close-Grip Pull-Up","Ring Pull-Up","Band-Assisted Pull-Up","Scapular Pull-Up",
    // Pulldown
    "Lat Pulldown","Wide-Grip Lat Pulldown","Close-Grip Lat Pulldown","Reverse-Grip Lat Pulldown",
    "Single-Arm Lat Pulldown","V-Bar Lat Pulldown","Straight-Arm Pulldown","Kneeling Pulldown","Pullover Machine",
    // Row
    "Bent-Over Row","Underhand Bent-Over Row","Pendlay Row","T-Bar Row","Seated Cable Row",
    "Single-Arm DB Row","Chest-Supported Row","Machine Row","Seal Row","Meadows Row",
    "High Cable Row","Low Cable Row","Inverted Row","Renegade Row","Smith Machine Row",
    "Incline DB Row","Landmine Row","Gorilla Row","Kroc Row","TRX Row",
    "Wide-Grip Seated Row","Close-Grip Seated Row",
    // Deadlift (back focus)
    "Deadlift","Sumo Deadlift","Trap Bar Deadlift","Rack Pull","Snatch-Grip Deadlift","Deficit Deadlift",
    // Extension
    "Hyperextension","Back Extension","Good Morning","Superman","Reverse Hyperextension",
    // Other
    "Band Pull-Apart","Cable Pullover","Dumbbell Pullover","Barbell Pullover",
    "Rear Delt Row","Barbell Shrug","DB Shrug","High Row","Pullover Machine"
  ],
  Shoulders:[
    // Press
    "Overhead Press","Seated DB Press","Arnold Press","Push Press","Behind-the-Neck Press",
    "Z-Press","Machine Shoulder Press","Smith Machine Overhead Press","Landmine Press",
    "Single-Arm DB Press","Kettlebell Press","Dumbbell Shoulder Press","Half-Kneeling Press",
    "Bottoms-Up KB Press","Resistance Band Press",
    // Lateral
    "Lateral Raise","Cable Lateral Raise","Machine Lateral Raise","Incline Lateral Raise",
    "Leaning Lateral Raise","Seated Lateral Raise","Behind-the-Back Cable Lateral Raise","Band Lateral Raise",
    // Front Raise
    "Front Raise","Barbell Front Raise","Plate Front Raise","Cable Front Raise",
    "Alternating Front Raise","Kettlebell Front Raise",
    // Rear Delt
    "Rear Delt Fly","Bent-Over Rear Delt Fly","Cable Rear Delt Fly","Reverse Pec Deck",
    "Face Pull","Prone Y-Raise","Prone T-Raise","Prone W-Raise",
    "Seated Rear Delt Machine","Rear Delt Cable Row",
    // Shrug
    "Barbell Shrug","DB Shrug","Cable Shrug","Machine Shrug","Trap Bar Shrug",
    // Other
    "Upright Row","Cable Upright Row","High Pull","Bradford Press","Handstand Push-Up",
    "Pike Push-Up","Cuban Press","Cable Y-Raise","Rotational Press","Band Pull-Apart"
  ],
  Biceps:[
    // Barbell
    "Barbell Curl","EZ-Bar Curl","Reverse Barbell Curl","Wide-Grip Curl","Close-Grip Curl","Cheat Curl","21s",
    // Dumbbell
    "Dumbbell Curl","Hammer Curl","Incline Curl","Concentration Curl","Zottman Curl",
    "Cross-Body Curl","Alternating Curl","Waiter Curl","Drag Curl","Reverse DB Curl",
    "Seated Alternating Curl","Twisting DB Curl",
    // Cable
    "Cable Curl","Rope Hammer Curl","Single-Arm Cable Curl","Overhead Cable Curl",
    "Reverse Cable Curl","Cable Hammer Curl","Low Cable Curl","High Cable Curl",
    "Cable Cross Curl","Lying Cable Curl","Seated Cable Curl",
    // Machine
    "Machine Curl","Machine Preacher Curl","Preacher Curl","Scott Curl","Reverse Preacher Curl",
    // Bodyweight
    "Neutral-Grip Chin-Up","TRX Curl","Inverted Curl",
    // Other
    "Kettlebell Curl","Spider Curl","Prone Incline Curl","Band Curl","Band Hammer Curl","Isometric Curl"
  ],
  Triceps:[
    // Pushdown
    "Tricep Pushdown","Rope Pushdown","Reverse Grip Pushdown","V-Bar Pushdown",
    "Single-Arm Pushdown","Single-Arm Reverse Pushdown","Bar Pushdown","Cable Kickback","Rope Tricep Extension",
    // Extension
    "Overhead Extension","DB Overhead Extension","Cable Overhead Extension","EZ-Bar Overhead Extension",
    "Single-Arm Overhead Extension","Skull Crusher","EZ-Bar Skull Crusher","Incline Skull Crusher",
    "Decline Skull Crusher","Tate Press","Rolling Tricep Extension","Overhead Rope Extension",
    "Lying Cable Extension","One-Arm Skull Crusher","Reverse Skull Crusher",
    // Press
    "Close-Grip Bench Press","Weighted Dip","JM Press","Board Press","Smith Machine Close-Grip Press","Floor Tricep Press",
    // Bodyweight
    "Diamond Push-Up","Tricep Push-Up","Bodyweight Tricep Extension","Parallel Bar Dip","Ring Dip","Bench Dip","Close-Grip Push-Up",
    // Other
    "Kickback","DB Kickback","Band Pushdown","Band Overhead Extension",
    "Machine Dip","Machine Tricep Extension","Cable Tricep Extension","Diamond Press"
  ],
  Legs:[
    // Squat
    "Back Squat","Front Squat","Goblet Squat","Hack Squat","Box Squat","Pause Squat",
    "Safety Bar Squat","Sumo Squat","Overhead Squat","Zercher Squat","Anderson Squat",
    "Smith Machine Squat","Belt Squat","Pin Squat","Cyclist Squat","Jefferson Squat",
    "Pistol Squat","Assisted Pistol Squat","Bear Squat",
    // Lunge
    "Walking Lunge","Reverse Lunge","Lateral Lunge","Bulgarian Split Squat","Curtsy Lunge",
    "Step-Up","Deficit Lunge","Barbell Lunge","DB Lunge","Split Squat",
    "Rear-Foot Elevated Split Squat","Step-Up with Knee Drive","Box Step-Up","Landmine Split Squat",
    // Deadlift (leg focus)
    "Romanian Deadlift","Stiff-Leg Deadlift","Single-Leg Deadlift","Nordic Curl","Glute-Ham Raise",
    // Machine
    "Leg Press","Hack Squat Machine","Leg Curl","Seated Leg Curl","Lying Leg Curl",
    "Leg Extension","Inner Thigh Machine","Outer Thigh Machine","Pendulum Squat",
    "V-Squat Machine","Single-Leg Leg Press","Close-Stance Leg Press","Wide-Stance Leg Press",
    // Calf
    "Standing Calf Raise","Seated Calf Raise","Donkey Calf Raise","Single-Leg Calf Raise",
    "Leg Press Calf Raise","Smith Machine Calf Raise","Cable Calf Raise","Tibialis Raise",
    // Power
    "Box Jump","Jump Squat","Broad Jump","Depth Jump","Power Clean","Power Snatch","Hang Clean","Kettlebell Swing",
    // Other
    "Sissy Squat","Leg Abduction","Leg Adduction","Sled Push","Sled Pull","Prowler Push",
    "Farmer's Walk","Wall Sit","Terminal Knee Extension","Hip Adduction Cable","Hip Abduction Cable",
    "Landmine Squat","45-Degree Back Extension","Duck Walk","Resistance Band Squat","Reverse Hyper"
  ],
  Core:[
    // Plank
    "Plank","Side Plank","Reverse Plank","RKC Plank","Plank with Hip Dip",
    "Plank Shoulder Tap","Plank Up-Down","Extended Plank","Stir the Pot",
    // Crunch
    "Crunch","Bicycle Crunch","Reverse Crunch","Decline Crunch","Cable Crunch",
    "Machine Crunch","Weighted Crunch","Oblique Crunch","Toe-Touch Crunch","Swiss Ball Crunch",
    // Leg Raise
    "Hanging Leg Raise","Lying Leg Raise","Flutter Kick","Scissor Kick",
    "Captain's Chair Leg Raise","Hanging Knee Raise","Toes to Bar","Windshield Wiper",
    "Hanging Windshield Wiper","Hanging L-Sit",
    // Rotation
    "Russian Twist","Wood Chop","Cable Wood Chop","Landmine Rotation","Pallof Press",
    "Med Ball Rotation","Oblique Twist","Cable Rotation",
    // Stability
    "Dead Bug","Bird Dog","Hollow Body Hold","L-Sit","Ab Rollout","Dragon Flag",
    "Swiss Ball Pike","Swiss Ball Pass",
    // Sit-Up
    "Sit-Up","Decline Sit-Up","V-Up","Weighted Sit-Up","Landmine Sit-Up","GHD Sit-Up",
    // Other
    "Mountain Climber","Medicine Ball Slam","Ab Wheel","Kneeling Cable Crunch",
    "V-Up Crunch","Suitcase Carry","Standing Ab Wheel","Bear Crawl","Farmer's Carry"
  ],
  Glutes:[
    // Hip Thrust
    "Barbell Hip Thrust","Single-Leg Hip Thrust","Banded Hip Thrust","DB Hip Thrust",
    "Machine Hip Thrust","Frog Pump","Hip Thrust with Band","Smith Machine Hip Thrust","Hip Thrust Feet-Elevated",
    // Bridge
    "Glute Bridge","Single-Leg Glute Bridge","Banded Glute Bridge","Elevated Glute Bridge",
    "Weighted Glute Bridge","Hip Raise","Bridge March","Hip Extension",
    // Squat/Lunge (glute focus)
    "Kneeling Squat","Hex Bar Deadlift","Sumo Deadlift","Curtsy Lunge",
    // Cable
    "Cable Kickback","Cable Pull-Through","Cable Hip Abduction","Donkey Kick",
    "Standing Cable Abduction","Reverse Cable Kickback","Cable Hip Extension","Hip Adduction",
    // Machine
    "Abductor Machine","Adductor Machine","Glute Kickback Machine","Hip Thrust Machine","Seated Hip Abduction",
    // Floor
    "Clam Shell","Side-Lying Hip Abduction","Banded Clamshell","Banded Monster Walk",
    "Banded Squat Walk","Quadruped Hip Extension","Fire Hydrant","Lateral Band Walk","Banded Hip Extension",
    // Other
    "Romanian Deadlift","Nordic Hamstring Curl","Resistance Band Kickback",
    "Good Morning","Hip Circle Walk","Hip Abductor Cable","Seated Hip Adduction","Banded Pull-Through"
  ],
  Cardio:[
    // Machine
    "Treadmill","Elliptical","Stationary Bike","Rowing Machine","Stair Master","Stair Stepper",
    "Ski Erg","Air Bike","Assault Bike","Recumbent Bike","Spin Bike","VersaClimber",
    // Outdoor
    "Running","Jogging","Walking","Hiking","Cycling","Swimming","Open Water Swimming",
    "Trail Running","Nordic Walking","Power Walk","Aqua Jogging",
    // HIIT / Reps-based
    "Jump Rope","Burpee","Jumping Jacks","High Knees","Sprint","Battle Ropes",
    "Shuttle Run","Agility Ladder","Skipping","Tire Flip",
    // Classes
    "Zumba","Aerobics","Step Aerobics","Dance Cardio","Kickboxing","Yoga Flow","Pilates","HIIT Class",
    // Sports
    "Basketball","Soccer","Tennis","Badminton","Volleyball","Football","Squash","Handball","Racquetball","Martial Arts",
    // Other
    "Shadow Boxing","Rope Climbing","Climbing","Aqua Aerobics","Circuit Training","Sled Push","Sled Pull"
  ]
};

// ── Exercise input-type map ────────────────────────────────────────────────────
// Unlisted exercises default to "weighted" (reps + weight).
// "bodyweight" = reps only (BW pre-toggled, no weight field)
// "cardio"     = time (mins) + distance
// "timed"      = duration in seconds only
export const EX_TYPES={
  // ── TIMED (seconds) ──────────────────────────────────────────────────────────
  "Plank":"timed","Side Plank":"timed","Reverse Plank":"timed","RKC Plank":"timed",
  "Plank with Hip Dip":"timed","Plank Shoulder Tap":"timed","Plank Up-Down":"timed",
  "Extended Plank":"timed","Stir the Pot":"timed","Wall Sit":"timed",
  "Hollow Body Hold":"timed","L-Sit":"timed","Hanging L-Sit":"timed",
  "Dead Bug":"timed","Bird Dog":"timed","Battle Ropes":"timed","Shadow Boxing":"timed",
  "Yoga Flow":"timed","Hip Circle Walk":"timed",
  // ── BODYWEIGHT (reps, no weight field) ───────────────────────────────────────
  // Chest
  "Push-Up":"bodyweight","Wide Push-Up":"bodyweight","Decline Push-Up":"bodyweight",
  "Incline Push-Up":"bodyweight","Archer Push-Up":"bodyweight","Clap Push-Up":"bodyweight",
  "Ring Push-Up":"bodyweight","Pseudo Planche Push-Up":"bodyweight","T-Push-Up":"bodyweight",
  "Chest Dip":"bodyweight","TRX Fly":"bodyweight",
  // Back
  "Pull-Up":"bodyweight","Chin-Up":"bodyweight","Wide-Grip Pull-Up":"bodyweight",
  "Neutral-Grip Pull-Up":"bodyweight","Assisted Pull-Up":"bodyweight",
  "Close-Grip Pull-Up":"bodyweight","Ring Pull-Up":"bodyweight",
  "Band-Assisted Pull-Up":"bodyweight","Scapular Pull-Up":"bodyweight",
  "TRX Row":"bodyweight","Inverted Row":"bodyweight","Superman":"bodyweight",
  // Biceps
  "Neutral-Grip Chin-Up":"bodyweight","TRX Curl":"bodyweight","Inverted Curl":"bodyweight",
  // Triceps
  "Diamond Push-Up":"bodyweight","Tricep Push-Up":"bodyweight",
  "Bodyweight Tricep Extension":"bodyweight","Parallel Bar Dip":"bodyweight",
  "Ring Dip":"bodyweight","Bench Dip":"bodyweight","Close-Grip Push-Up":"bodyweight",
  // Shoulders
  "Handstand Push-Up":"bodyweight","Pike Push-Up":"bodyweight",
  "Prone Y-Raise":"bodyweight","Prone T-Raise":"bodyweight","Prone W-Raise":"bodyweight",
  // Legs
  "Pistol Squat":"bodyweight","Assisted Pistol Squat":"bodyweight",
  "Box Jump":"bodyweight","Jump Squat":"bodyweight","Broad Jump":"bodyweight",
  "Depth Jump":"bodyweight","Nordic Curl":"bodyweight","Glute-Ham Raise":"bodyweight",
  "Duck Walk":"bodyweight","Resistance Band Squat":"bodyweight","Bear Squat":"bodyweight",
  // Core
  "Crunch":"bodyweight","Bicycle Crunch":"bodyweight","Reverse Crunch":"bodyweight",
  "Oblique Crunch":"bodyweight","Toe-Touch Crunch":"bodyweight","Swiss Ball Crunch":"bodyweight",
  "V-Up Crunch":"bodyweight","Hanging Leg Raise":"bodyweight","Lying Leg Raise":"bodyweight",
  "Flutter Kick":"bodyweight","Scissor Kick":"bodyweight",
  "Captain's Chair Leg Raise":"bodyweight","Hanging Knee Raise":"bodyweight",
  "Toes to Bar":"bodyweight","Windshield Wiper":"bodyweight",
  "Hanging Windshield Wiper":"bodyweight","Dragon Flag":"bodyweight",
  "Ab Rollout":"bodyweight","Russian Twist":"bodyweight","V-Up":"bodyweight",
  "Sit-Up":"bodyweight","Decline Sit-Up":"bodyweight","GHD Sit-Up":"bodyweight",
  "Mountain Climber":"bodyweight","Bear Crawl":"bodyweight","Landmine Rotation":"bodyweight",
  "Swiss Ball Pass":"bodyweight","Swiss Ball Pike":"bodyweight","Standing Ab Wheel":"bodyweight",
  // Glutes
  "Glute Bridge":"bodyweight","Single-Leg Glute Bridge":"bodyweight",
  "Banded Glute Bridge":"bodyweight","Frog Pump":"bodyweight",
  "Banded Monster Walk":"bodyweight","Banded Squat Walk":"bodyweight",
  "Clam Shell":"bodyweight","Side-Lying Hip Abduction":"bodyweight",
  "Banded Clamshell":"bodyweight","Quadruped Hip Extension":"bodyweight",
  "Fire Hydrant":"bodyweight","Donkey Kick":"bodyweight","Bridge March":"bodyweight",
  "Resistance Band Kickback":"bodyweight","Hip Extension":"bodyweight",
  "Single-Leg Hip Thrust":"bodyweight","Banded Hip Thrust":"bodyweight",
  "Hip Thrust with Band":"bodyweight","Nordic Hamstring Curl":"bodyweight",
  "Banded Hip Extension":"bodyweight","Lateral Band Walk":"bodyweight",
  // Cardio (reps-based — stay in Cardio group but use reps)
  "Burpee":"bodyweight","Jumping Jacks":"bodyweight","High Knees":"bodyweight",
  "Jump Rope":"bodyweight","Shuttle Run":"bodyweight","Agility Ladder":"bodyweight",
  "Skipping":"bodyweight","Tire Flip":"bodyweight",
  // ── CARDIO (time + distance) ─────────────────────────────────────────────────
  "Treadmill":"cardio","Elliptical":"cardio","Stationary Bike":"cardio",
  "Rowing Machine":"cardio","Stair Master":"cardio","Stair Stepper":"cardio",
  "Ski Erg":"cardio","Air Bike":"cardio","Assault Bike":"cardio",
  "Recumbent Bike":"cardio","Spin Bike":"cardio","VersaClimber":"cardio",
  "Running":"cardio","Jogging":"cardio","Walking":"cardio","Hiking":"cardio",
  "Cycling":"cardio","Swimming":"cardio","Open Water Swimming":"cardio",
  "Trail Running":"cardio","Nordic Walking":"cardio","Power Walk":"cardio",
  "Aqua Jogging":"cardio","Sprint":"cardio","Rope Climbing":"cardio","Climbing":"cardio",
  "Aqua Aerobics":"cardio","Circuit Training":"cardio",
  "Sled Push":"cardio","Sled Pull":"cardio",
  "Zumba":"cardio","Aerobics":"cardio","Step Aerobics":"cardio","Dance Cardio":"cardio",
  "Kickboxing":"cardio","Pilates":"cardio","HIIT Class":"cardio",
  "Basketball":"cardio","Soccer":"cardio","Tennis":"cardio","Badminton":"cardio",
  "Volleyball":"cardio","Football":"cardio","Squash":"cardio",
  "Handball":"cardio","Racquetball":"cardio","Martial Arts":"cardio",
};
export const MZ={Chest:"ch",Back:"bk",Shoulders:"sh",Biceps:"bi",Triceps:"tr",Legs:"lg",Core:"co",Glutes:"gl"};
export const TMPLS=[
  {id:"push",name:"Push Day",tag:"PPL",col:"#7C6EFA",exercises:[{name:"Bench Press",muscle:"Chest",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:80},{reps:8,weight:80},{reps:8,weight:80}]},{name:"Overhead Press",muscle:"Shoulders",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:50},{reps:8,weight:50},{reps:8,weight:50}]},{name:"Lateral Raise",muscle:"Shoulders",sets:[{reps:15,weight:12},{reps:15,weight:12},{reps:15,weight:12}]},{name:"Tricep Pushdown",muscle:"Triceps",sets:[{reps:12,weight:30},{reps:12,weight:30},{reps:12,weight:30}]}]},
  {id:"pull",name:"Pull Day",tag:"PPL",col:"#34d399",exercises:[{name:"Lat Pulldown",muscle:"Back",progression:{increment:2.5,unit:"kg"},sets:[{reps:10,weight:65},{reps:10,weight:65},{reps:10,weight:65}]},{name:"Seated Cable Row",muscle:"Back",progression:{increment:2.5,unit:"kg"},sets:[{reps:10,weight:55},{reps:10,weight:55},{reps:10,weight:55}]},{name:"Face Pull",muscle:"Back",sets:[{reps:15,weight:25},{reps:15,weight:25}]},{name:"Barbell Curl",muscle:"Biceps",progression:{increment:1.25,unit:"kg"},sets:[{reps:10,weight:35},{reps:10,weight:35},{reps:10,weight:35}]}]},
  {id:"legs",name:"Leg Day",tag:"PPL",col:"#fbbf24",exercises:[{name:"Squat",muscle:"Legs",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:100},{reps:8,weight:100},{reps:8,weight:100}]},{name:"Leg Press",muscle:"Legs",progression:{increment:5,unit:"kg"},sets:[{reps:12,weight:160},{reps:12,weight:160},{reps:12,weight:160}]},{name:"Romanian Deadlift",muscle:"Legs",progression:{increment:2.5,unit:"kg"},sets:[{reps:10,weight:80},{reps:10,weight:80},{reps:10,weight:80}]},{name:"Calf Raise",muscle:"Legs",sets:[{reps:20,weight:60},{reps:20,weight:60}]}]},
  {id:"upper",name:"Upper Body",tag:"Split",col:"#f87171",exercises:[{name:"Bench Press",muscle:"Chest",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:80},{reps:8,weight:80}]},{name:"Bent-Over Row",muscle:"Back",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:70},{reps:8,weight:70}]},{name:"Dumbbell Curl",muscle:"Biceps",sets:[{reps:12,weight:14},{reps:12,weight:14}]},{name:"Tricep Pushdown",muscle:"Triceps",sets:[{reps:12,weight:28},{reps:12,weight:28}]}]},
  {id:"lower",name:"Lower Body",tag:"Split",col:"#06b6d4",exercises:[{name:"Squat",muscle:"Legs",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:100},{reps:8,weight:100}]},{name:"Romanian Deadlift",muscle:"Legs",progression:{increment:2.5,unit:"kg"},sets:[{reps:10,weight:80},{reps:10,weight:80}]},{name:"Hip Thrust",muscle:"Glutes",progression:{increment:2.5,unit:"kg"},sets:[{reps:12,weight:90},{reps:12,weight:90}]},{name:"Calf Raise",muscle:"Legs",sets:[{reps:20,weight:50},{reps:20,weight:50}]}]}
];
export const PLATES_KG=[25,20,15,10,5,2.5,1.25];
export const BAR_KG=20;
export const PLATES_LB=[45,35,25,10,5,2.5];
export const BAR_LB=45;
export const PCOL_LB={45:"#ef4444",35:"#3b82f6",25:"#f59e0b",10:"#22c55e",5:"#8b5cf6",2.5:"#ec4899"};
export const PCOL={25:"#ef4444",20:"#3b82f6",15:"#f59e0b",10:"#22c55e",5:"#8b5cf6",2.5:"#ec4899",1.25:"#94a3b8"};
export const CC=["#7C6EFA","#34d399","#fbbf24","#f87171","#06b6d4","#ec4899","#a78bfa"];
// Bar types: label, kg weight
// perSide flag = true means plates load both sides (× 2). False = weight is entered directly (× 1).
export const BAR_TYPES=[
  {id:"barbell", label:"Barbell",        kg:20,  lbEquiv:45, perSide:true},
  {id:"smith",   label:"Smith Machine",  kg:4.1, lbEquiv:9,  perSide:true},
  {id:"ez",      label:"EZ Bar",         kg:10,  lbEquiv:25, perSide:true},
  {id:"dumbbell",label:"Dumbbell",       kg:0,   lbEquiv:0,  perSide:false},
  {id:"cable",   label:"Cable",          kg:0,   lbEquiv:0,  perSide:false},
  {id:"machine", label:"Machine / Stack",  kg:0,   lbEquiv:0,  perSide:false},
  {id:"plateloaded",label:"Plate-Loaded Machine",kg:0,lbEquiv:0,perSide:true},
  {id:"none",    label:"Other",            kg:0,   lbEquiv:0,  perSide:false},
];
export const MILESTONES=[1,5,10,25,50,100,200,365];
export const TIMER_STEPS=[60,120,180];
