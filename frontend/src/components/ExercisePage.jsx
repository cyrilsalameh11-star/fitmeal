import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Activity, Zap, Play, CheckCircle2, Navigation, ExternalLink, MapPin, ArrowRight, Smartphone } from 'lucide-react';

const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Legs' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
];

const GYM_EXERCISES = {
  chest: [
    {
      id: 'machine-press',
      name: 'Machine Chest Press',
      machine: 'Seated Press Machine',
      focus: 'Mid & Upper Chest',
      sets: 4,
      reps: '10-12',
      tips: ['Keep back flat against pad', 'Squeeze at full extension', 'Control the negative'],
      color: 'from-blue-600 to-indigo-500',
      imageFolder: 'Leverage_Chest_Press'
    },
    {
      id: 'cable-crossover',
      name: 'Cable Crossover',
      machine: 'Dual Cable Pulley',
      focus: 'Lower & Inner Chest',
      sets: 3,
      reps: '12-15',
      tips: ['Slight forward lean', 'Bring hands together at waist height', 'Focus on the stretch'],
      color: 'from-indigo-500 to-purple-500',
      imageFolder: 'Cable_Crossover'
    },
    {
      id: 'pec-deck',
      name: 'Pec Deck Machine',
      machine: 'Fly Machine',
      focus: 'Inner Chest / Cleavage',
      sets: 4,
      reps: '12-15',
      tips: ['Keep slight bend in elbows', 'Don\'t let weight stack drop', 'Focus on mind-muscle connection'],
      color: 'from-purple-500 to-fuchsia-500',
      imageFolder: 'Butterfly'
    },
    {
      id: 'incline-smith',
      name: 'Smith Machine Incline Press',
      machine: 'Smith Machine',
      focus: 'Upper Chest',
      sets: 4,
      reps: '8-10',
      tips: ['Bench at 30-45 degrees', 'Bar paths to upper chest', 'Drive through palms'],
      color: 'from-fuchsia-500 to-pink-500',
      imageFolder: 'Smith_Machine_Incline_Bench_Press'
    }
  ],
  back: [
    {
      id: 'lat-pulldown',
      name: 'Lat Pulldown',
      machine: 'Cable Pulldown Station',
      focus: 'Lats (Width)',
      sets: 4,
      reps: '10-12',
      tips: ['Pull to upper chest', 'Arch middle back slightly', 'Don\'t use momentum'],
      color: 'from-emerald-600 to-teal-500',
      imageFolder: 'Close-Grip_Front_Lat_Pulldown'
    },
    {
      id: 'seated-row',
      name: 'Seated Cable Row',
      machine: 'Low Cable Row',
      focus: 'Mid Back (Thickness)',
      sets: 4,
      reps: '10-12',
      tips: ['Keep torso stationary', 'Squeeze shoulder blades together', 'Full stretch on return'],
      color: 'from-teal-500 to-cyan-500',
      imageFolder: 'Seated_Cable_Rows'
    },
    {
      id: 'assisted-pullup',
      name: 'Assisted Pull-up',
      machine: 'Gravitron Machine',
      focus: 'Upper Back & Lats',
      sets: 3,
      reps: '8-10',
      tips: ['Wide overhand grip', 'Slow eccentric phase', 'Full range of motion'],
      color: 'from-cyan-500 to-sky-500',
      imageFolder: 'Band_Assisted_Pull-Up'
    },
    {
      id: 'straight-arm',
      name: 'Straight-Arm Pulldown',
      machine: 'High Cable Pulley',
      focus: 'Lats Integration',
      sets: 3,
      reps: '12-15',
      tips: ['Keep arms straight but not locked', 'Hinge slightly at hips', 'Pull bar to thighs'],
      color: 'from-sky-500 to-blue-500',
      imageFolder: 'Straight-Arm_Pulldown'
    }
  ],
  legs: [
    {
      id: 'leg-press',
      name: 'Leg Press',
      machine: '45-Degree Leg Press',
      focus: 'Quads & Glutes',
      sets: 4,
      reps: '10-12',
      tips: ['Feet shoulder-width apart', 'Don\'t lock knees at top', 'Go deep but keep lower back flat'],
      color: 'from-orange-600 to-amber-500',
      imageFolder: 'Leg_Press'
    },
    {
      id: 'leg-extension',
      name: 'Leg Extension',
      machine: 'Extension Machine',
      focus: 'Quadriceps Isolation',
      sets: 4,
      reps: '12-15',
      tips: ['Adjust pad to ankle height', 'Hold contraction for 1s', 'Control the descent'],
      color: 'from-amber-500 to-yellow-500',
      imageFolder: 'Leg_Extensions'
    },
    {
      id: 'leg-curl',
      name: 'Seated Leg Curl',
      machine: 'Curl Machine',
      focus: 'Hamstrings',
      sets: 4,
      reps: '12-15',
      tips: ['Pad rests on back of ankle', 'Squeeze handles to stay planted', 'Full contraction'],
      color: 'from-yellow-400 to-lime-500',
      imageFolder: 'Seated_Leg_Curl'
    },
    {
      id: 'calf-raise',
      name: 'Standing Calf Raise',
      machine: 'Calf Raise Machine',
      focus: 'Calves (Gastrocnemius)',
      sets: 4,
      reps: '15-20',
      tips: ['Pause at the very top', 'Deep stretch at the bottom', 'Keep knees slightly bent'],
      color: 'from-lime-500 to-green-500',
      imageFolder: 'Standing_Calf_Raises'
    }
  ],
  shoulders: [
    {
      id: 'shoulder-press',
      name: 'Machine Shoulder Press',
      machine: 'Overhead Press Machine',
      focus: 'Anterior Deltoids',
      sets: 4,
      reps: '10-12',
      tips: ['Grip slightly wider than shoulders', 'Don\'t lock out elbows', 'Controlled negative'],
      color: 'from-red-600 to-rose-500',
      imageFolder: 'Cable_Shoulder_Press'
    },
    {
      id: 'lateral-raise',
      name: 'Cable Lateral Raise',
      machine: 'Low Cable Pulley',
      focus: 'Lateral Deltoids (Width)',
      sets: 4,
      reps: '12-15',
      tips: ['Cable behind your back', 'Lead with the elbows', 'Raise to shoulder height'],
      color: 'from-rose-500 to-pink-500',
      imageFolder: 'Cable_Seated_Lateral_Raise'
    },
    {
      id: 'reverse-pec-deck',
      name: 'Reverse Pec Deck',
      machine: 'Fly Machine (Reversed)',
      focus: 'Rear Deltoids',
      sets: 3,
      reps: '15-20',
      tips: ['Keep chest pressed to pad', 'Slight bend in elbows', 'Don\'t squeeze shoulder blades together'],
      color: 'from-pink-500 to-fuchsia-500',
      imageFolder: 'Reverse_Machine_Flyes'
    },
    {
      id: 'face-pull',
      name: 'Cable Face Pull',
      machine: 'High Cable with Rope',
      focus: 'Rear Delts & Rotator Cuff',
      sets: 3,
      reps: '15-20',
      tips: ['Pull rope towards eyes', 'Keep elbows high', 'Squeeze upper back'],
      color: 'from-fuchsia-500 to-purple-500',
      imageFolder: 'Face_Pull'
    }
  ],
  arms: [
    {
      id: 'tricep-pushdown',
      name: 'Tricep Rope Pushdown',
      machine: 'High Cable Pulley',
      focus: 'Triceps (Lateral/Long Head)',
      sets: 4,
      reps: '12-15',
      tips: ['Keep elbows tucked to sides', 'Spread rope at the bottom', 'Full lockout'],
      color: 'from-stone-800 to-stone-600',
      imageFolder: 'Triceps_Pushdown_-_Rope_Attachment'
    },
    {
      id: 'cable-curl',
      name: 'EZ-Bar Cable Curl',
      machine: 'Low Cable Pulley',
      focus: 'Biceps Brachii',
      sets: 4,
      reps: '10-12',
      tips: ['Keep elbows strictly at sides', 'Squeeze at the top', 'Control weight down'],
      color: 'from-stone-600 to-stone-500',
      imageFolder: 'High_Cable_Curls'
    },
    {
      id: 'overhead-extension',
      name: 'Overhead Rope Extension',
      machine: 'Cable Station',
      focus: 'Triceps (Long Head)',
      sets: 3,
      reps: '12-15',
      tips: ['Lean forward slightly', 'Keep elbows pointed forward', 'Full stretch behind head'],
      color: 'from-stone-500 to-zinc-500',
      imageFolder: 'Triceps_Overhead_Extension_with_Rope'
    },
    {
      id: 'preacher-curl',
      name: 'Machine Preacher Curl',
      machine: 'Preacher Curl Machine',
      focus: 'Biceps (Short Head)',
      sets: 3,
      reps: '10-12',
      tips: ['Armpits snug against pad', 'Don\'t let tension off at bottom', 'Squeeze hard at top'],
      color: 'from-zinc-500 to-neutral-400',
      imageFolder: 'Machine_Preacher_Curls'
    }
  ]
};

function ExerciseCard({ exercise, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const baseUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.imageFolder}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header / Graphic Area */}
      <div className={`h-48 bg-gradient-to-br ${exercise.color} relative overflow-hidden flex justify-center items-center`}>
        {/* Render Exercise Image */}
        {exercise.imageFolder && (
          <img 
            src={`${baseUrl}/${isHovered ? '1' : '0'}.jpg`} 
            alt={exercise.name} 
            className="h-full object-cover mix-blend-multiply opacity-90 transition-opacity duration-300"
            loading="lazy"
          />
        )}
        
        {/* Preload the second frame so the animation is instant */}
        {exercise.imageFolder && (
          <img src={`${baseUrl}/1.jpg`} alt="preload" className="hidden" />
        )}

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-900/60 to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 w-auto">
          <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-sm">
            {exercise.machine}
          </span>
          <div className="bg-white/20 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-sm">
            <Play size={16} className={`text-white ml-0.5 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          </div>
        </div>
        <h3 className="absolute bottom-4 left-4 right-4 text-xl md:text-2xl font-black text-white z-10 leading-tight drop-shadow-md">
          {exercise.name}
        </h3>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-5 flex-1">
        <div className="flex justify-between items-center pb-4 border-b border-stone-50">
          <div className="flex items-center space-x-2 text-stone-500">
            <Target size={16} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest">{exercise.focus}</span>
          </div>
          <div className="flex space-x-2">
            <div className="flex flex-col items-center bg-stone-50 px-3 py-1.5 rounded-xl">
              <span className="text-sm font-black text-stone-900">{exercise.sets}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Sets</span>
            </div>
            <div className="flex flex-col items-center bg-stone-50 px-3 py-1.5 rounded-xl">
              <span className="text-sm font-black text-stone-900">{exercise.reps}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Reps</span>
            </div>
          </div>
        </div>

        {/* Form Tips */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Form Check</p>
          <ul className="space-y-2">
            {exercise.tips.map((tip, i) => (
              <li key={i} className="flex items-start space-x-2 text-sm text-stone-600 font-medium">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function GymContent() {
  const [activeGroup, setActiveGroup] = useState('chest');
  const exercises = GYM_EXERCISES[activeGroup] || [];

  return (
    <motion.div
      key="gym"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10 md:space-y-12"
    >
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center">
          <Zap size={14} className="mr-2" /> Training Intelligence
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Machine &amp; Cable <br /><span className="italic font-normal text-stone-400">Workouts.</span></h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">Safe, effective, and highly isolated exercises designed for machines and cables. Perfect for controlled hypertrophy.</p>
      </div>

      {/* Muscle Group Tabs */}
      <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-hide">
        {MUSCLE_GROUPS.map(group => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest border transition-all ${
              activeGroup === group.id
                ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-[1.03]'
                : 'bg-white text-stone-500 border-stone-200 hover:border-amber-200'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-stone-400 font-medium">
        <span className="font-black text-stone-900">4</span> highly optimized movements for {activeGroup}
      </p>

      {/* Exercise Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {exercises.map((ex, idx) => (
            <ExerciseCard key={ex.id} exercise={ex} index={idx} />
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function PadelContent() {
  return (
    <motion.div
      key="padel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center">
          <Activity size={14} className="mr-2" /> Court Booking
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Lebanon Padel <br /><span className="italic font-normal text-stone-400">Community.</span></h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">Book your courts instantly through Sportciety, the premier padel booking platform in Lebanon.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 border border-stone-100 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="space-y-6 max-w-lg">
          <h2 className="text-3xl font-serif">Ready to play?</h2>
          <p className="text-stone-500 text-lg">Browse available courts, join matches, and manage your bookings directly through the official Sportciety app.</p>
          <ul className="space-y-3">
            <li className="flex items-center text-stone-600 font-medium"><CheckCircle2 className="text-emerald-500 mr-3 w-5 h-5 flex-shrink-0" /> Real-time court availability</li>
            <li className="flex items-center text-stone-600 font-medium"><CheckCircle2 className="text-emerald-500 mr-3 w-5 h-5 flex-shrink-0" /> Join active matches nearby</li>
            <li className="flex items-center text-stone-600 font-medium"><CheckCircle2 className="text-emerald-500 mr-3 w-5 h-5 flex-shrink-0" /> Rent equipment on the go</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <a 
            href="https://apps.apple.com/lb/app/sportciety/id1552553974" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-stone-900 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors flex items-center justify-center text-sm shadow-sm"
          >
            <Smartphone className="mr-2 w-4 h-4" /> App Store
          </a>
          <a 
            href="https://play.google.com/store/apps/details?id=com.sportcietyapp.sportciety" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-stone-900 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors flex items-center justify-center text-sm shadow-sm"
          >
            <Smartphone className="mr-2 w-4 h-4" /> Google Play
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function PilatesContent() {
  return (
    <motion.div
      key="pilates"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center">
          <Target size={14} className="mr-2" /> Reformer & Mat
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Premium Pilates <br /><span className="italic font-normal text-stone-400">Studios.</span></h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">Connect your mind and body at Lebanon's top rated pilates studios. Book easily using the standard IN2 app.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Studios</span>
              <MapPin className="text-stone-300 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif mb-3 group-hover:text-amber-600 transition-colors">IN2 Connect</h2>
            <p className="text-stone-500">Access classes at Exhale, Body Garage, and dozens of other premier studios across the country.</p>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <a 
              href="https://apps.apple.com/lb/app/in2/id1200222044" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-widest flex items-center text-stone-900 hover:text-amber-600 transition-colors"
            >
              <Smartphone className="mr-2 w-4 h-4" /> App Store <ArrowRight className="ml-1 w-3 h-3 opacity-50" />
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.codefish.in2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-widest flex items-center text-stone-900 hover:text-amber-600 transition-colors"
            >
              <Smartphone className="mr-2 w-4 h-4" /> Google Play <ArrowRight className="ml-1 w-3 h-3 opacity-50" />
            </a>
          </div>
        </div>

        <div className="bg-stone-900 text-white rounded-3xl p-8 border border-stone-800 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-stone-800 text-stone-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Featured</span>
              <Zap className="text-amber-500 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif mb-3 group-hover:text-amber-400 transition-colors">Posto Nove</h2>
            <p className="text-stone-400">A specialized luxury studio experience. Check their official site to book their proprietary classes.</p>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <a 
              href="https://apps.apple.com/lb/app/posto-nove/id1450284566" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-widest flex items-center text-white hover:text-amber-400 transition-colors"
            >
              <Smartphone className="mr-2 w-4 h-4" /> App Store <ExternalLink className="ml-1 w-3 h-3 opacity-50" />
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.glofox.postonove" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-widest flex items-center text-white hover:text-amber-400 transition-colors"
            >
              <Smartphone className="mr-2 w-4 h-4" /> Google Play <ExternalLink className="ml-1 w-3 h-3 opacity-50" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const EXERCISE_TABS = [
  { id: 'gym', label: 'Gym' },
  { id: 'padel', label: 'Padel' },
  { id: 'pilates', label: 'Pilates' }
];

export default function ExercisePage() {
  const [activeTab, setActiveTab] = useState('gym');

  return (
    <div className="space-y-10 lg:space-y-14">
      {/* Top Level Exercise Navigation */}
      <div className="relative">
        <div className="flex border-b border-stone-200 justify-start w-full gap-8 overflow-x-auto scrollbar-hide">
          {EXERCISE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 relative ${
                activeTab === tab.id 
                  ? 'text-stone-900' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="exerciseTabIndicator"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-stone-900 z-10"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'gym' && <GymContent key="gym-content" />}
        {activeTab === 'padel' && <PadelContent key="padel-content" />}
        {activeTab === 'pilates' && <PilatesContent key="pilates-content" />}
      </AnimatePresence>
    </div>
  );
}
