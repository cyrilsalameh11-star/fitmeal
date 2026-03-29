import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GymContent from './GymContent';
import PadelContent from './PadelContent';
import PilatesContent from './PilatesContent';
import RunningContent from './RunningPage';
import SpinningContent from './SpinningContent';
import SupplementsContent from './SupplementsContent';

const EXERCISE_TABS = [
  { id: 'gym', label: 'Gym' },
  { id: 'padel', label: 'Padel' },
  { id: 'pilates', label: 'Pilates' },
  { id: 'running', label: 'Running' },
  { id: 'spinning', label: 'Spinning' },
  { id: 'supplements', label: 'Supplements' },
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
        {activeTab === 'running' && <RunningContent key="running-content" />}
        {activeTab === 'spinning' && <SpinningContent key="spinning-content" />}
        {activeTab === 'supplements' && <SupplementsContent key="supplements-content" />}
      </AnimatePresence>
    </div>
  );
}
