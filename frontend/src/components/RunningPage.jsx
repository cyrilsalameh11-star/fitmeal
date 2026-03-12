import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity, Share2, Map as MapIcon, ChevronRight, Zap, Target, ExternalLink } from 'lucide-react';

const RUNNING_CITIES = {
  Lebanon: {
    name: 'Beirut, Lebanon',
    lat: 33.8938,
    lng: 35.5018,
    zoom: 14,
    trails: [
      // Corniche Beirut
      [[33.9056, 35.4674], [33.9015, 35.4682], [33.8967, 35.4745], [33.8998, 35.4856], [33.9034, 35.5012], [33.8992, 35.5145]]
    ]
  },
  Paris: {
    name: 'Paris, France',
    lat: 48.8566,
    lng: 2.3522,
    zoom: 13,
    trails: [
      // Seine Banks
      [[48.8617, 2.2900], [48.8601, 2.3021], [48.8576, 2.3211], [48.8532, 2.3498], [48.8505, 2.3612]],
      // Bois de Boulogne simple loop
      [[48.8700, 2.2500], [48.8650, 2.2450], [48.8600, 2.2500], [48.8650, 2.2600], [48.8700, 2.2500]]
    ]
  },
  'New York': {
    name: 'New York, USA',
    lat: 40.7828,
    lng: -73.9653,
    zoom: 14,
    trails: [
      // Central Park Reservoir & Inner Loop
      [[40.7900, -73.9660], [40.7880, -73.9600], [40.7820, -73.9580], [40.7800, -73.9640], [40.7820, -73.9700], [40.7900, -73.9660]]
    ]
  },
  Madrid: {
    name: 'Madrid, Spain',
    lat: 40.4113,
    lng: -3.6822,
    zoom: 15,
    trails: [
      // Retiro Park
      [[40.4180, -3.6850], [40.4185, -3.6780], [40.4100, -3.6750], [40.4080, -3.6820], [40.4180, -3.6850]]
    ]
  }
};

const DYNAMIC_EXAMPLES = [
  { name: 'Morning Glow Run', user: 'Cyril S.', distance: '12.4km', time: '58:20', elevation: '120m', city: 'Beirut' },
  { name: 'Seine Sunset Sprints', user: 'Marc L.', distance: '8.2km', time: '36:15', elevation: '15m', city: 'Paris' },
  { name: 'Central Park Lap', user: 'Sarah J.', distance: '10.1km', time: '48:40', elevation: '45m', city: 'New York' }
];

function MapController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { animate: true, duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

export default function RunningContent() {
  const [activeCityId, setActiveCityId] = useState('Lebanon');
  const [stravaUrl, setStravaUrl] = useState('');
  const city = RUNNING_CITIES[activeCityId];

  const handleShare = (e) => {
    e.preventDefault();
    if (!stravaUrl) return;
    alert(`Strava run submitted for review! URL: ${stravaUrl}`);
    setStravaUrl('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10 md:space-y-12 pb-20"
    >
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center">
          <Activity size={14} className="mr-2" /> Global Heatmaps
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
          Famous Strava <br /><span className="italic font-normal text-stone-400">Trails.</span>
        </h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">
          Discover where the community runs. Powered by local Strava data and heatmaps.
        </p>
      </div>

      {/* Main UI Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Map & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-stone-900 rounded-[2.5rem] p-3 shadow-2xl border border-stone-800 relative group overflow-hidden">
            {/* City Toggles Over Map */}
            <div className="absolute top-8 left-8 z-[500] flex shrink-0 gap-2 overflow-x-auto max-w-[calc(100%-4rem)] scrollbar-hide py-1">
              {Object.keys(RUNNING_CITIES).map(id => (
                <button
                  key={id}
                  onClick={() => setActiveCityId(id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeCityId === id 
                      ? 'bg-amber-500 text-white shadow-lg scale-105' 
                      : 'bg-stone-800/80 backdrop-blur-md text-stone-400 border border-stone-700 hover:text-white'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>

            {/* Map Container */}
            <div className="h-[500px] md:h-[600px] w-full rounded-[2rem] overflow-hidden">
              <MapContainer 
                center={[city.lat, city.lng]} 
                zoom={city.zoom} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <MapController target={city} />
                
                {/* Simulated Heatmap Trails */}
                {city.trails.map((path, idx) => (
                  <div key={idx}>
                    {/* Glow effect layers */}
                    <Polyline positions={path} pathOptions={{ color: '#f59e0b', weight: 12, opacity: 0.1, lineJoin: 'round' }} />
                    <Polyline positions={path} pathOptions={{ color: '#f59e0b', weight: 6, opacity: 0.3, lineJoin: 'round' }} />
                    <Polyline positions={path} pathOptions={{ color: '#ffffff', weight: 2, opacity: 0.8, lineJoin: 'round' }} />
                  </div>
                ))}
              </MapContainer>
            </div>

            {/* Legend / Stats overlay */}
            <div className="absolute bottom-8 right-8 z-[500] bg-stone-900/80 backdrop-blur-md border border-stone-800 p-6 rounded-2xl space-y-4 shadow-xl pointer-events-none hidden md:block">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Live Heat Intensity</span>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-serif text-white">{city.name}</p>
                <p className="text-xs text-stone-500 font-medium">Most active in last 24h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Share & Examples */}
        <div className="space-y-8">
          {/* Share Box */}
          <div className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-xl">
                <Share2 className="text-amber-600" size={20} />
              </div>
              <h3 className="text-xl font-serif">Share your Run</h3>
            </div>
            
            <p className="text-sm text-stone-500 leading-relaxed font-medium">
              Join the heatmap. Connect your Strava or paste a public activity link to contribute.
            </p>

            <form onSubmit={handleShare} className="space-y-3">
              <input 
                type="url"
                placeholder="Strava Activity URL..."
                value={stravaUrl}
                onChange={e => setStravaUrl(e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium"
              />
              <button 
                type="submit"
                className="w-full bg-stone-900 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg active:scale-95"
              >
                Connect to Community
              </button>
            </form>
          </div>

          {/* Dynamic Feed Examples */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4 flex items-center">
              <Zap size={12} className="mr-2 text-amber-500" /> Recent Community Milestones
            </h4>
            
            <div className="space-y-3">
              {DYNAMIC_EXAMPLES.map((ex, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{ex.city}</p>
                      <h5 className="font-bold text-stone-900 group-hover:text-amber-600 transition-colors">{ex.name}</h5>
                    </div>
                    <span className="text-[10px] font-medium bg-stone-50 px-2 py-1 rounded-full text-stone-500">{ex.user}</span>
                  </div>
                  
                  <div className="flex gap-4 border-t border-stone-50 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Dist</span>
                      <span className="text-xs font-bold text-stone-700">{ex.distance}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Time</span>
                      <span className="text-xs font-bold text-stone-700">{ex.time}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Elev</span>
                      <span className="text-xs font-bold text-stone-700">{ex.elevation}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center justify-center space-x-2">
              <span>View All Activities</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Discover nearby section */}
      <div className="bg-amber-50 rounded-[3rem] p-10 md:p-16 text-center space-y-8 border border-amber-100">
        <div className="mx-auto w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-500">
          <MapIcon className="text-amber-600" size={32} />
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-serif">Run with friends.</h2>
          <p className="text-lg text-amber-900/60 font-medium leading-relaxed">
            Our algorithm matches you with similar-paced runners in your area. Open the map to find active meetups.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-amber-600 shadow-xl transition-all">
            Find Nearby Runners
          </button>
          <button className="bg-white text-stone-900 border border-stone-100 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:border-amber-500 transition-all">
            Browse Groups
          </button>
        </div>
      </div>
    </motion.div>
  );
}
