import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RotateCcw, Zap, Check, ScanLine, ChevronRight, X } from 'lucide-react';
import { logMealToday } from './CalorieBar';

function MacroChip({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
        <span className="text-xs font-black text-white">{value}</span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">{label}</span>
    </div>
  );
}

export default function ScannerPage() {
  const fileInputRef  = useRef(null);
  const cameraInputRef = useRef(null);

  const [preview,  setPreview]  = useState(null);  // data URL for display
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [logged,   setLogged]   = useState(false);

  // Resize + compress image to max 900px / 80% quality before sending
  // Keeps payload under ~300KB regardless of phone camera resolution
  const compressImage = useCallback((file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = objectUrl;
    });
  }, []);

  const analyzeImage = useCallback(async (file) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setLogged(false);

    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);

      const base64 = dataUrl.split(',')[1];

      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not analyze image. Please try again.');
    }
    setLoading(false);
  }, [compressImage]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) analyzeImage(file);
  }

  function handleLog() {
    if (!result) return;
    const ok = logMealToday(result.calories);
    if (ok) { setLogged(true); setTimeout(() => setLogged(false), 2500); }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setError(null);
    setLogged(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  const confidenceColor = {
    high:   'text-emerald-500',
    medium: 'text-amber-500',
    low:    'text-red-400',
  };

  return (
    <motion.div
      key="scanner"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-lg mx-auto space-y-6 pb-24"
    >
      {/* Header */}
      <div className="max-w-sm">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <ScanLine size={13} /> AI Food Scanner
        </p>
        <h1 className="text-4xl md:text-5xl leading-tight mb-2">
          Snap &amp; <span className="italic font-normal text-stone-400">Estimate.</span>
        </h1>
        <p className="text-sm text-stone-500 font-medium leading-relaxed">
          Take a photo of any meal and get an instant calorie &amp; macro breakdown powered by Gemini AI.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-stone-950 rounded-[2.5rem] overflow-hidden shadow-2xl">

        {/* Image area */}
        <div className="relative" style={{ aspectRatio: '4/3' }}>
          {preview ? (
            <img src={preview} alt="Food" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-stone-900">
              {/* Decorative frame */}
              <div className="relative w-40 h-32">
                {[['top-0 left-0','border-t-2 border-l-2 rounded-tl-2xl'],
                  ['top-0 right-0','border-t-2 border-r-2 rounded-tr-2xl'],
                  ['bottom-0 left-0','border-b-2 border-l-2 rounded-bl-2xl'],
                  ['bottom-0 right-0','border-b-2 border-r-2 rounded-br-2xl']].map(([pos,cls],i) => (
                  <div key={i} className={`absolute ${pos} w-8 h-8 border-stone-600 ${cls}`} />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={36} className="text-stone-600" />
                </div>
              </div>
              <p className="text-stone-500 text-xs font-medium">Point at your meal</p>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-2 border-stone-700 border-t-amber-400 rounded-full"
              />
              <p className="text-white text-xs font-black uppercase tracking-widest">Analyzing food...</p>
              <p className="text-stone-500 text-[10px]">Gemini AI is estimating your macros</p>
            </div>
          )}

          {/* Reset button */}
          {preview && !loading && (
            <button
              onClick={reset}
              className="absolute top-4 right-4 w-9 h-9 bg-stone-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 space-y-5"
            >
              {/* Dish name + confidence */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-black text-lg leading-tight">{result.dish}</p>
                  <p className="text-stone-500 text-[10px] font-medium mt-0.5">{result.servingSize}</p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${confidenceColor[result.confidence] || 'text-stone-400'}`}>
                  {result.confidence} confidence
                </span>
              </div>

              {/* Calories big number */}
              <div className="bg-stone-900 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-5xl font-black text-white leading-none">{result.calories}</p>
                  <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mt-1">kcal estimated</p>
                </div>
                <div className="flex gap-4">
                  <MacroChip label="Protein" value={`${result.protein}g`} color="bg-stone-700" />
                  <MacroChip label="Carbs"   value={`${result.carbs}g`}   color="bg-amber-600" />
                  <MacroChip label="Fat"     value={`${result.fat}g`}     color="bg-stone-600" />
                </div>
              </div>

              {/* Detected items */}
              {result.items?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.items.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-stone-800 text-stone-300 rounded-full text-[10px] font-bold">
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {/* Tip */}
              {result.tip && (
                <div className="flex gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3">
                  <Zap size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-200/80 text-xs font-medium leading-relaxed">{result.tip}</p>
                </div>
              )}

              {/* Log button */}
              <button
                onClick={handleLog}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  logged
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white hover:bg-amber-400'
                }`}
              >
                {logged
                  ? <><Check size={14} /> Logged to Today!</>
                  : <>Log {result.calories} kcal to Today <ChevronRight size={14} /></>
                }
              </button>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center space-y-3"
            >
              <p className="text-stone-400 text-sm font-medium">{error}</p>
              <button onClick={reset} className="px-5 py-2.5 bg-stone-800 text-stone-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-700 transition-colors">
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {!preview && !loading && (
          <div className="p-6 grid grid-cols-2 gap-3">
            {/* Camera capture (mobile) */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 py-6 bg-amber-500 rounded-2xl hover:bg-amber-400 transition-all active:scale-95"
            >
              <Camera size={22} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Take Photo</span>
            </button>

            {/* Upload from gallery */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 py-6 bg-stone-800 rounded-2xl hover:bg-stone-700 transition-all active:scale-95"
            >
              <Upload size={22} className="text-stone-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Upload Photo</span>
            </button>

            {/* Hidden inputs */}
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            <input ref={fileInputRef}   type="file" accept="image/*"                        className="hidden" onChange={handleFile} />
          </div>
        )}

        {/* Re-scan button after result */}
        {(result || error) && !loading && (
          <div className="px-6 pb-6">
            <button
              onClick={() => { reset(); }}
              className="w-full py-3 bg-stone-800 text-stone-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-stone-700 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={13} /> Scan Another Meal
            </button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-stone-400 font-medium px-4">
        Estimates are AI-generated and may vary ±20%. For reference only.
      </p>
    </motion.div>
  );
}
