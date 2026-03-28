import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Zap, X, ChevronRight, RotateCcw, ScanLine, Tag, Barcode } from 'lucide-react';
import { logMealToday } from './CalorieBar';

const MODES = [
  { id: 'barcode', label: 'Barcode', icon: <Barcode size={15} /> },
  { id: 'label',   label: 'Food Label', icon: <Tag size={15} /> },
  { id: 'ai',      label: 'AI Scan', icon: <Camera size={15} /> },
];

function MacroBar({ label, value, color }) {
  return (
    <div className="text-center">
      <p className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-1">{label}</p>
      <p className="text-sm font-black text-stone-800">{value}g</p>
    </div>
  );
}

export default function ScannerPage() {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);

  const [mode,          setMode]          = useState('barcode');
  const [scanning,      setScanning]      = useState(false);
  const [cameraReady,   setCameraReady]   = useState(false);
  const [cameraError,   setCameraError]   = useState(null);
  const [barcodeInput,  setBarcodeInput]  = useState('');
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [logged,        setLogged]        = useState(false);
  const [torch,         setTorch]         = useState(false);
  const [detectorReady, setDetectorReady] = useState(false);

  // Check BarcodeDetector support
  useEffect(() => {
    setDetectorReady('BarcodeDetector' in window);
  }, []);

  const stopCamera = useCallback(() => {
    clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        setScanning(true);
      }
    } catch (err) {
      setCameraError('Camera access denied. Use manual entry below.');
    }
  }, [stopCamera]);

  // BarcodeDetector scan loop
  useEffect(() => {
    if (!scanning || !cameraReady || !detectorReady || mode !== 'barcode') return;

    const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'] });

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2) return;
      const canvas = canvasRef.current;
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      try {
        const codes = await detector.detect(canvas);
        if (codes.length > 0) {
          clearInterval(intervalRef.current);
          lookupBarcode(codes[0].rawValue);
        }
      } catch { /* ignore */ }
    }, 400);

    return () => clearInterval(intervalRef.current);
  }, [scanning, cameraReady, detectorReady, mode]);

  // Toggle torch
  useEffect(() => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.getCapabilities?.()?.torch) {
      track.applyConstraints({ advanced: [{ torch }] }).catch(() => {});
    }
  }, [torch]);

  async function lookupBarcode(code) {
    setLoading(true);
    setResult(null);
    stopCamera();
    try {
      const res  = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};
        setResult({
          name:     p.product_name || p.product_name_en || 'Unknown product',
          brand:    p.brands || '',
          calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
          protein:  Math.round(n.proteins_100g || 0),
          carbs:    Math.round(n.carbohydrates_100g || 0),
          fat:      Math.round(n.fat_100g || 0),
          serving:  p.serving_size || '100g',
          image:    p.image_front_small_url || null,
          barcode:  code,
        });
      } else {
        setResult({ error: `No product found for barcode ${code}.` });
      }
    } catch {
      setResult({ error: 'Could not reach the food database. Check your connection.' });
    }
    setLoading(false);
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (barcodeInput.trim()) lookupBarcode(barcodeInput.trim());
  }

  function handleLog() {
    if (!result || result.error) return;
    const success = logMealToday(result.calories);
    setLogged(success);
    setTimeout(() => setLogged(false), 2500);
  }

  function reset() {
    setResult(null);
    setLogged(false);
    setBarcodeInput('');
    setLoading(false);
  }

  // Auto-start camera when page loads
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <motion.div
      key="scanner"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-lg mx-auto space-y-6 pb-20"
    >
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <ScanLine size={13} /> Food Scanner
        </p>
        <h1 className="text-4xl font-serif leading-tight">
          Scan & <span className="italic font-normal text-stone-400">Log.</span>
        </h1>
        <p className="text-sm text-stone-500 font-medium mt-1">Scan a barcode to get instant nutritional info.</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex bg-stone-100 rounded-2xl p-1 gap-1">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); reset(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === m.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Camera Viewfinder */}
      <div className="bg-stone-950 rounded-[2rem] overflow-hidden relative" style={{ aspectRatio: '3/4' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan frame overlay */}
        {!result && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-56 h-40">
              {/* Corner brackets */}
              {[['top-0 left-0', 'border-t-2 border-l-2 rounded-tl-xl'],
                ['top-0 right-0', 'border-t-2 border-r-2 rounded-tr-xl'],
                ['bottom-0 left-0', 'border-b-2 border-l-2 rounded-bl-xl'],
                ['bottom-0 right-0', 'border-b-2 border-r-2 rounded-br-xl']].map(([pos, cls], i) => (
                <div key={i} className={`absolute ${pos} w-8 h-8 border-white ${cls}`} />
              ))}
              {/* Scan line */}
              {scanning && (
                <motion.div
                  className="absolute left-2 right-2 h-0.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/80 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-stone-700 border-t-amber-400 rounded-full"
            />
            <p className="text-white text-xs font-bold uppercase tracking-widest">Looking up...</p>
          </div>
        )}

        {/* Result overlay */}
        {result && !loading && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-stone-950/95 p-6 flex flex-col justify-between overflow-y-auto"
            >
              {result.error ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center">
                    <X size={24} className="text-stone-500" />
                  </div>
                  <p className="text-stone-400 text-sm font-medium">{result.error}</p>
                  <button onClick={reset} className="px-6 py-2.5 bg-stone-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-700 transition-colors">
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {result.image && (
                        <img src={result.image} alt="" className="w-14 h-14 rounded-xl object-contain bg-white p-1 flex-shrink-0" />
                      )}
                      <div>
                        {result.brand && <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-0.5">{result.brand}</p>}
                        <p className="text-white font-bold leading-tight">{result.name}</p>
                        <p className="text-stone-500 text-[10px] mt-0.5">Per {result.serving}</p>
                      </div>
                    </div>

                    <div className="bg-stone-900 rounded-2xl p-5">
                      <div className="text-center mb-4">
                        <p className="text-4xl font-black text-white">{result.calories}</p>
                        <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">kcal</p>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-stone-800">
                        <MacroBar label="Protein" value={result.protein} />
                        <MacroBar label="Carbs"   value={result.carbs} />
                        <MacroBar label="Fat"     value={result.fat} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <button
                      onClick={handleLog}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        logged
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white hover:bg-amber-400'
                      }`}
                    >
                      {logged ? '✓ Logged to Today!' : `Log ${result.calories} kcal to Today`}
                    </button>
                    <button
                      onClick={() => { reset(); startCamera(); }}
                      className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={13} /> Scan Another
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Camera error */}
        {cameraError && !result && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
            <Camera size={32} className="text-stone-600" />
            <p className="text-stone-400 text-xs font-medium">{cameraError}</p>
            <button onClick={startCamera} className="px-5 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
              Retry Camera
            </button>
          </div>
        )}

        {/* Torch + camera controls */}
        {cameraReady && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setTorch(t => !t)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${torch ? 'bg-amber-500 text-white' : 'bg-stone-800/80 text-stone-300'}`}
            >
              <Zap size={16} />
            </button>
          </div>
        )}

        {/* Not supported badge */}
        {!detectorReady && cameraReady && mode === 'barcode' && (
          <div className="absolute bottom-4 left-4 right-4 bg-stone-800/90 rounded-xl px-4 py-2 text-center">
            <p className="text-[10px] text-stone-400 font-medium">Auto-scan not supported in this browser. Use manual entry below.</p>
          </div>
        )}
      </div>

      {/* Manual barcode entry */}
      <form onSubmit={handleManualSubmit} className="flex gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={barcodeInput}
          onChange={e => setBarcodeInput(e.target.value)}
          placeholder="Manually enter barcode..."
          className="flex-1 bg-white border border-stone-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-amber-200 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!barcodeInput.trim() || loading}
          className="px-5 py-3.5 bg-stone-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all disabled:opacity-40 flex items-center gap-1.5"
        >
          <ChevronRight size={14} />
        </button>
      </form>

      {/* Mode info */}
      {mode === 'label' && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Food Label Mode</p>
          <p className="text-sm text-amber-800/70 font-medium leading-relaxed">Point the camera at a nutrition label, then enter the barcode manually to look up the product in the database.</p>
        </div>
      )}
      {mode === 'ai' && (
        <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5">
          <p className="text-xs font-black uppercase tracking-widest text-stone-600 mb-1">AI Scan Mode</p>
          <p className="text-sm text-stone-500 font-medium leading-relaxed">Point the camera at a dish or packaged food, then enter the barcode number if visible. AI visual recognition coming soon.</p>
        </div>
      )}
    </motion.div>
  );
}
