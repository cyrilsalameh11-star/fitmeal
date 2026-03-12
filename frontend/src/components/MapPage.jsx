import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, MessageCircle, Search, Trash2 } from 'lucide-react';
import { useMap } from 'react-leaflet';

const cities = {
  Lebanon:    { name: 'Beirut, Lebanon',   lat: 33.8938, lng: 35.5018,  zoom: 13, countryCode: 'lb' },
  Paris:      { name: 'Paris, France',     lat: 48.8566, lng: 2.3522,   zoom: 13, countryCode: 'fr' },
  Madrid:     { name: 'Madrid, Spain',     lat: 40.4168, lng: -3.7038,  zoom: 13, countryCode: 'es' },
  'New York': { name: 'New York, USA',     lat: 40.7128, lng: -74.0060, zoom: 13, countryCode: 'us' },
};

// Create a custom div icon for the marker with initials and color
const createCustomIcon = (initials, color, emoji) => {
  const content = emoji || initials;
  const fontSize = emoji ? '20px' : '14px';
  const markerHtmlStyles = `
    background-color: ${color};
    width: 2.2rem;
    height: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: white;
    font-weight: bold;
    font-size: ${fontSize};
    border: 2px solid white;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
  `;

  return L.divIcon({
    className: 'custom-pin',
    iconAnchor: [17, 35], // Point from center bottom
    popupAnchor: [0, -35],
    html: `<div style="${markerHtmlStyles}">${content}</div>`
  });
};

// Helper component to add pins on map click and handle map panning
function PinInteraction({ onMapClick, selectedCity }) {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });

  // Fly to the new city when it changes
  useEffect(() => {
    if (selectedCity && map) {
      map.flyTo([selectedCity.lat, selectedCity.lng], selectedCity.zoom, { animate: true, duration: 1.5 });
    }
  }, [selectedCity, map]);

  return null;
}

// Helper to manually fly map to a specific location
function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

const EMOJI_OPTIONS = ['🍔', '🍕', '🍣', '🥗', '☕', '🍦', '🥑', '🥩', '🍺', '🥐', '🌶️', '🍪'];

const MapPage = () => {
  const [activeCityId, setActiveCityId] = useState('Lebanon');
  const [pins, setPins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedCity = cities[activeCityId];

  // Pin dropping state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [comment, setComment] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Get user details for pins
  const userName = localStorage.getItem('fitmeal_username') || 'Guest';
  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}.${parts[parts.length - 1][0]}.`.toUpperCase();
    } else if (parts.length === 1 && parts[0]) {
      return `${parts[0][0]}.`.toUpperCase();
    }
    return 'G.';
  };
  
  // Consistent color gen based on name
  const getUserColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 45%)`; // Darker vibrant colors for morning coffee theme match capability
  };

  const fetchPins = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/map/pins?city=${activeCityId}`);
      if (resp.ok) {
        const data = await resp.json();
        setPins(data.pins);
      }
    } catch (err) {
      console.error("Failed to fetch pins", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, [activeCityId]);

  const handleMapClick = (latlng) => {
    setPendingPin(latlng);
    setRestaurantName('');
    setComment('');
    setSelectedEmoji(null);
    setShowPinModal(true);
  };

  const deletePin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pin?")) return;
    try {
      const resp = await fetch(`/api/map/pins/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        setPins(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitPin = async (e) => {
    e.preventDefault();
    if (!restaurantName.trim() || !pendingPin) return;

    try {
      const pinData = {
        city: activeCityId,
        lat: pendingPin.lat,
        lng: pendingPin.lng,
        restaurant_name: restaurantName,
        comment: comment,
        user_initials: getInitials(userName),
        user_color: getUserColor(userName),
        emoji: selectedEmoji
      };

      const resp = await fetch('/api/map/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pinData)
      });

      if (resp.ok) {
        const data = await resp.json();
        setPins(prev => [data.pin, ...prev]);
        setShowPinModal(false);
        setPendingPin(null);
      }
    } catch (err) {
      console.error("Failed to save pin", err);
      alert("Failed to save your pin. Make sure you have an active internet connection.");
    }
  };

  const openGoogleMaps = (query) => {
    const base = query.trim()
      ? `${query} in ${selectedCity.name}`
      : selectedCity.name;
    window.open(
      `https://www.google.com/maps/search/${encodeURIComponent(base)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleSearchFocus = () => {
    openGoogleMaps(searchQuery);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    openGoogleMaps(searchQuery);
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 rounded-3xl overflow-hidden border border-stone-200 shadow-sm relative" style={{ minHeight: '80vh' }}>
      
      {/* City Selector Header */}
      <div className="bg-white px-6 py-4 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center z-10 relative space-y-4 md:space-y-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div>
          <h2 className="text-2xl font-serif text-stone-900 flex items-center">
            <MapPin className="mr-2 text-amber-600" />
            Explore like a Local
          </h2>
          <p className="text-sm text-stone-500 font-medium">Click anywhere on the map to pin your favorite spots.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Bar — opens Google Maps */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search in ${selectedCity.name}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                className="w-full bg-stone-100 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none transition-all cursor-pointer"
              />
            </div>
          </form>

          <div className="flex space-x-2 bg-stone-100 p-1 rounded-xl">
            {Object.keys(cities).map(city => (
              <button
                key={city}
                onClick={() => setActiveCityId(city)}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeCityId === city 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The Map */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer 
          center={[selectedCity.lat, selectedCity.lng]} 
          zoom={selectedCity.zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          {/* Subtle minimal map tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <PinInteraction onMapClick={handleMapClick} selectedCity={selectedCity} />
          
          {pins.map((pin) => (
            <Marker 
              key={pin.id || (pin.lat + '-' + pin.lng)} 
              position={[pin.lat, pin.lng]}
              icon={createCustomIcon(pin.user_initials, pin.user_color, pin.emoji)}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[150px]">
                  <h4 className="font-bold text-stone-900 border-b border-stone-100 pb-2 mb-2 flex items-center justify-between">
                    <span>{pin.restaurant_name}</span>
                    {pin.emoji && <span className="text-lg ml-2">{pin.emoji}</span>}
                  </h4>
                  {pin.comment && (
                    <p className="text-stone-600 text-sm italic mb-3 flex items-start">
                      <MessageCircle size={14} className="mr-1.5 mt-0.5 opacity-50 flex-shrink-0" />
                      "{pin.comment}"
                    </p>
                  )}
                  <div className="text-xs text-stone-400 flex items-center justify-between">
                    <span className="font-medium bg-stone-100 px-2 py-0.5 rounded-full" style={{ color: pin.user_color }}>
                      Added by {pin.user_initials}
                    </span>
                    {getInitials(userName) === pin.user_initials && (
                      <button onClick={(e) => { e.stopPropagation(); deletePin(pin.id); }} className="text-red-400 hover:text-red-600 transition-colors" title="Delete your pin">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold text-sm tracking-widest animate-pulse shadow-xl">
              Loading Map Pins...
            </div>
          </div>
        )}
      </div>

      {/* Add Pin Modal */}
      {showPinModal && pendingPin && (
        <div className="absolute inset-x-0 bottom-4 z-20 mx-auto px-4 w-full max-w-md pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-stone-100 pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif">Pin a Spot</h3>
              <button 
                onClick={() => { setShowPinModal(false); setPendingPin(null); }}
                className="text-stone-400 hover:text-stone-700"
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={submitPin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Restaurant or Spot Name"
                  required
                  autoFocus
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-stone-800"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Category Emoji (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEmoji(null)}
                    className={`h-10 px-3 rounded-lg border flex items-center justify-center transition-all ${selectedEmoji === null ? 'bg-amber-100 border-amber-300 text-amber-800 font-medium' : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-500'}`}
                  >
                    None
                  </button>
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-10 h-10 rounded-lg border text-lg flex items-center justify-center transition-all ${selectedEmoji === emoji ? 'bg-amber-100 border-amber-300 shadow-sm scale-110' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Why do you love it here? (Optional)"
                  rows={2}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm text-stone-800 resize-none"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center mt-2"
              >
                <MapPin size={18} className="mr-2" />
                Save Pin as {getInitials(userName)}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
