// ─── Theme ────────────────────────────────────────────────────────────────────
export const D={bg:"#0c0c12",card:"#141420",card2:"#1a1a28",border:"#252535",text:"#eeeeff",sub:"#55557a",muted:"#1f1f2e",accent:"#7C6EFA",as:"rgba(124,110,250,0.14)",at:"#b0a0ff",g:"#34d399",gs:"rgba(52,211,153,0.12)",r:"#f87171",rs:"rgba(248,113,113,0.12)",am:"#fbbf24",ams:"rgba(251,191,36,0.12)",nav:"rgba(12,12,18,0.97)"};
export const L={bg:"#f1f1f8",card:"#ffffff",card2:"#f5f5fc",border:"#e2e2f0",text:"#0e0e20",sub:"#7070a0",muted:"#e8e8f5",accent:"#5548d9",as:"rgba(85,72,217,0.1)",at:"#5548d9",g:"#059669",gs:"rgba(5,150,105,0.1)",r:"#dc2626",rs:"rgba(220,38,38,0.1)",am:"#d97706",ams:"rgba(217,119,6,0.1)",nav:"rgba(241,241,248,0.97)"};
export const O={bg:"#000000",card:"#0d0d12",card2:"#111118",border:"#1e1e2e",text:"#eeeeff",sub:"#55557a",muted:"#111118",accent:"#7C6EFA",as:"rgba(124,110,250,0.14)",at:"#b0a0ff",g:"#34d399",gs:"rgba(52,211,153,0.12)",r:"#f87171",rs:"rgba(248,113,113,0.12)",am:"#fbbf24",ams:"rgba(251,191,36,0.12)",nav:"rgba(0,0,0,0.97)"};

// ─── Data ─────────────────────────────────────────────────────────────────────
export const MG=["Chest","Back","Shoulders","Biceps","Triceps","Legs","Core","Glutes","Cardio"];
export const EX={Chest:["Bench Press","Incline DB Press","Cable Fly","Chest Dip","Push-Up","Pec Deck","Decline Press","Dumbbell Pullover"],Back:["Pull-Up","Lat Pulldown","Seated Cable Row","Bent-Over Row","Single-Arm DB Row","Face Pull","Deadlift","T-Bar Row"],Shoulders:["Overhead Press","Lateral Raise","Front Raise","Arnold Press","Rear Delt Fly","Upright Row","Cable Lateral Raise","Shrug"],Biceps:["Barbell Curl","Dumbbell Curl","Hammer Curl","Incline Curl","Cable Curl","Concentration Curl","Spider Curl","Preacher Curl"],Triceps:["Tricep Pushdown","Overhead Extension","Skull Crusher","Close-Grip Bench","Dip","Kickback","Diamond Push-Up"],Legs:["Squat","Leg Press","Romanian Deadlift","Leg Curl","Leg Extension","Walking Lunge","Calf Raise","Hack Squat","Sumo Squat"],Core:["Plank","Crunch","Hanging Leg Raise","Cable Crunch","Russian Twist","Ab Rollout","Side Plank","Dragon Flag"],Glutes:["Hip Thrust","Cable Kickback","Glute Bridge","Bulgarian Split Squat","Abductor Machine","Sumo Deadlift","Donkey Kick"],Cardio:["Treadmill","Elliptical","Cycling","Stair Master","Jump Rope","Row Machine","Assault Bike","Swimming"]};
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
export const BAR_TYPES=[
  {id:"barbell",label:"Barbell",kg:20,lbEquiv:45},
  {id:"ez",label:"EZ Bar",kg:10,lbEquiv:25},
  {id:"dumbbell",label:"Dumbbell",kg:0,lbEquiv:0},
  {id:"none",label:"No Bar",kg:0,lbEquiv:0},
];
export const MILESTONES=[1,5,10,25,50,100,200,365];
export const TIMER_STEPS=[60,120,180];
