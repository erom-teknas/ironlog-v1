// ── Exercise list & input-type map ────────────────────────────────────────────
// Kept in a separate module so it can be dynamically imported — the ~270 lines
// of string data are only fetched when a picker opens, not on initial load.

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
