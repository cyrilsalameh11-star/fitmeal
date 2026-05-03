import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RotateCcw, Zap, Check, ScanLine, ChevronRight, X, Clock, Trash2, Sparkles, MessageSquare, Send, Barcode, FileText } from 'lucide-react';
import { logMealToday } from './CalorieBar';
import ParticleCanvas from './ParticleCanvas';

const HISTORY_KEY = 'fitmeal_scan_history';

function saveToHistory(result) {
  try {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const entry = {
      id: Date.now(),
      dish: result.dish,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      servingSize: result.servingSize,
      ts: new Date().toISOString(),
    };
    // Deduplicate: remove any existing entry with same dish + calories
    const deduped = prev.filter(p => !(p.dish === entry.dish && p.calories === entry.calories));
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...deduped].slice(0, 100)));
  } catch {}
}

function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function MacroChip({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
        <span className="text-xs font-bold text-white">{value}</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
    </div>
  );
}

function HistoryPanel({ onClose, onReLog }) {
  const [items, setItems] = useState(readHistory);

  function deleteItem(id) {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Clock size={11} /> Scan History
        </p>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <button onClick={() => { localStorage.removeItem(HISTORY_KEY); setItems([]); }} className="text-gray-600 hover:text-red-400 transition-colors">
              <Trash2 size={13} />
            </button>
          )}
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X size={16} /></button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-500 text-xs text-center py-8">No scans yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="bg-gray-900 rounded-2xl p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{item.dish}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{item.servingSize} · {formatRelative(item.ts)}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-amber-400 text-xs font-bold">{item.calories} kcal</span>
                  <span className="text-gray-600 text-[10px]">P {item.protein}g · C {item.carbs}g · F {item.fat}g</span>
                </div>
              </div>
              <button onClick={() => onReLog(item)} className="flex-shrink-0 px-3 py-1.5 bg-gray-800 hover:bg-amber-500 text-gray-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all">
                Log
              </button>
              <button onClick={() => deleteItem(item.id)} className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function QuestionsStep({ dish, items, questions, answers, onChange, onSubmit, loading }) {
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.q]);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-amber-400" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">{dish}</p>
          {items?.length > 0 && (
            <p className="text-gray-500 text-[10px] font-medium mt-0.5">{items.join(', ')}</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 pt-5 space-y-5">
        <p className="text-gray-400 text-xs font-medium leading-relaxed">
          Before I estimate the calories, a few quick questions:
        </p>
        {questions.map((q, i) => (
          <div key={i} className="space-y-3">
            <p className="text-white text-sm font-bold">{q.q}</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map(opt => {
                const selected = answers[q.q] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onChange(q.q, opt)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                      selected
                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {allAnswered && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onSubmit}
            disabled={loading}
            className="w-full py-4 bg-amber-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Estimating...
              </>
            ) : (
              <><Sparkles size={14} /> Get Calorie Estimate</>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BarcodeScannerView({ onDetected, onClose }) {
  const videoRef    = useRef(null);
  const readerRef   = useRef(null);
  const controlsRef = useRef(null);
  const detectedRef = useRef(false);
  const [camError,  setCamError]  = useState(null);
  const [manualCode, setManualCode] = useState('');

  // Aggressive shutdown: stops zxing controls + all media tracks + clears srcObject
  const fullStop = () => {
    try { controlsRef.current?.stop?.(); } catch {}
    try { readerRef.current?.reset?.(); } catch {}
    const video = videoRef.current;
    if (video?.srcObject) {
      try { video.srcObject.getTracks?.().forEach(t => t.stop()); } catch {}
      try { video.srcObject = null; } catch {}
    }
    try { video?.pause?.(); } catch {}
  };

  useEffect(() => {
    let mounted = true;
    async function start() {
      if (!videoRef.current) return;
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        if (!mounted || !videoRef.current) return;
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        // decodeFromVideoDevice returns a Promise<IScannerControls> in @zxing/browser
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (!mounted) return;
          if (result && !detectedRef.current) {
            detectedRef.current = true;
            // Stop the camera IMMEDIATELY, don't wait for React unmount
            fullStop();
            onDetected(result.getText());
          }
        });
        controlsRef.current = controls;
        // If component already unmounted while awaiting, stop now
        if (!mounted) fullStop();
      } catch {
        if (mounted) setCamError('Camera access denied or unavailable.');
      }
    }
    start();
    return () => {
      mounted = false;
      fullStop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function submitManual() {
    const code = manualCode.trim();
    if (/^\d{8,14}$/.test(code)) onDetected(code);
  }

  return (
    <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
      {!camError ? (
        <>
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative w-56 h-36 border-2 border-transparent">
              {[['top-0 left-0','border-t-2 border-l-2 rounded-tl-xl'],
                ['top-0 right-0','border-t-2 border-r-2 rounded-tr-xl'],
                ['bottom-0 left-0','border-b-2 border-l-2 rounded-bl-xl'],
                ['bottom-0 right-0','border-b-2 border-r-2 rounded-br-xl']].map(([pos,cls],i) => (
                <div key={i} className={`absolute ${pos} w-8 h-8 border-amber-400 ${cls}`} />
              ))}
              <motion.div
                className="absolute left-3 right-3 h-0.5 bg-amber-400/80 rounded-full shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]"
                animate={{ top: ['8%', '88%', '8%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <p className="text-white text-[11px] font-bold mt-4 bg-black/50 px-3 py-1.5 rounded-full tracking-wide">
              Point at a product barcode
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-gray-400 text-xs text-center">{camError}</p>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Enter barcode manually</p>
          <div className="flex gap-2 w-full max-w-xs">
            <input
              type="text"
              inputMode="numeric"
              value={manualCode}
              onChange={e => setManualCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 3017620425035"
              className="flex-1 bg-gray-800 text-white text-xs px-3 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-amber-500/50"
              maxLength={14}
            />
            <button
              onClick={submitManual}
              disabled={!/^\d{8,14}$/.test(manualCode)}
              className="px-4 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl disabled:opacity-30"
            >
              Go
            </button>
          </div>
        </div>
      )}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function ScannerPage() {
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);
  const labelCamRef    = useRef(null);
  const lastBase64Ref  = useRef(null);

  // view: 'photo' | 'describe' | 'barcode' | 'label'
  const [view,        setView]        = useState('photo');
  // phase: 'idle' | 'identifying' | 'questions' | 'estimating' | 'result' | 'error'
  const [phase,       setPhase]       = useState('idle');
  const [preview,     setPreview]     = useState(null);
  const [identified,  setIdentified]  = useState(null);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);
  const [logged,      setLogged]      = useState(false);
  const [answers,     setAnswers]     = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [describeText, setDescribeText] = useState('');
  const [servingMode, setServingMode] = useState('serving'); // 'serving' | 'package'
  const [qty,         setQty]         = useState(1);

  const compressImage = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read image file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not load image.'));
        img.onload = () => {
          try {
            const MAX = 500;
            let { width, height } = img;
            if (width > MAX || height > MAX) {
              if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
              else { width = Math.round((width * MAX) / height); height = MAX; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.55));
          } catch { reject(new Error('Could not compress image.')); }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  async function callPhotoApi(base64, mode, answersMap = {}) {
    const res = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg', mode, answers: answersMap }),
    });
    if (res.status === 413) throw new Error('Image too large for server.');
    const text = await res.text();
    if (!text) throw new Error('Empty response from server.');
    let data;
    try { data = JSON.parse(text); } catch { throw new Error(`Server error: ${text.slice(0, 100)}`); }
    if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
    return data;
  }

  async function callDescribeApi(mode, answersMap = {}) {
    const res = await fetch('/api/describe-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: describeText.trim(), mode, answers: answersMap }),
    });
    const text = await res.text();
    if (!text) throw new Error('Empty response from server.');
    let data;
    try { data = JSON.parse(text); } catch { throw new Error(`Server error: ${text.slice(0, 100)}`); }
    if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
    return data;
  }

  // Analyze a nutrition label photo via the new /api/analyze-food-label endpoint
  const analyzeLabel = useCallback(async (file) => {
    setPhase('identifying');
    setResult(null);
    setIdentified(null);
    setError(null);
    setLogged(false);
    setAnswers({});
    setShowHistory(false);

    if (file.size > 20 * 1024 * 1024) {
      setError('Photo too large (max 20MB).');
      setPhase('error');
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      if (!base64) throw new Error('Could not read image data.');

      const res = await fetch('/api/analyze-food-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(`Server error: ${text.slice(0, 100)}`); }
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      setResult(data);
      setPhase('result');
    } catch (err) {
      setError(err.message || 'Could not read label.');
      setPhase('error');
    }
  }, [compressImage]);

  function handleLabelFile(e) {
    const file = e.target.files?.[0];
    if (file) analyzeLabel(file);
  }

  const analyzeImage = useCallback(async (file) => {
    setPhase('identifying');
    setResult(null);
    setIdentified(null);
    setError(null);
    setLogged(false);
    setAnswers({});
    setShowHistory(false);

    if (file.size > 20 * 1024 * 1024) {
      setError('Photo too large (max 20MB).');
      setPhase('error');
      return;
    }

    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      if (!base64) throw new Error('Could not read image data.');
      lastBase64Ref.current = base64;

      const data = await callPhotoApi(base64, 'identify');
      if (!data.questions?.length || data.dish === 'Not food detected') {
        const estimate = await callPhotoApi(base64, 'estimate', {});
        setResult(estimate);
        setPhase('result');
      } else {
        setIdentified(data);
        setPhase('questions');
      }
    } catch (err) {
      setError(err.message || 'Could not analyze image.');
      setPhase('error');
    }
  }, [compressImage]);

  async function handlePhotoEstimate() {
    if (!lastBase64Ref.current) return;
    setPhase('estimating');
    try {
      const data = await callPhotoApi(lastBase64Ref.current, 'estimate', answers);
      setResult(data);
      setPhase('result');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }

  async function handleDescribeSubmit() {
    if (!describeText.trim()) return;
    setPhase('identifying');
    setResult(null);
    setIdentified(null);
    setError(null);
    setLogged(false);
    setAnswers({});
    setShowHistory(false);

    try {
      const data = await callDescribeApi('identify');
      if (!data.questions?.length) {
        const estimate = await callDescribeApi('estimate', {});
        setResult(estimate);
        saveToHistory(estimate);
        setPhase('result');
      } else {
        setIdentified(data);
        setPhase('questions');
      }
    } catch (err) {
      setError(err.message || 'Could not analyze description.');
      setPhase('error');
    }
  }

  const handleBarcodeDetected = useCallback(async (code) => {
    setPhase('identifying');
    setResult(null);
    setError(null);
    setLogged(false);
    setShowHistory(false);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`/api/barcode/${encodeURIComponent(code)}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const text = await res.text();
      if (!text) throw new Error('Empty response from server.');
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(`Server error: ${text.slice(0, 100)}`); }
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      setResult(data);
      setPhase('result');
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err.name === 'AbortError' ? 'not found' : (err.message || 'Could not look up product.');
      setError(msg);
      setPhase('error');
    }
  }, []);

  async function handleDescribeEstimate() {
    setPhase('estimating');
    try {
      const data = await callDescribeApi('estimate', answers);
      setResult(data);
      setPhase('result');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) analyzeImage(file);
  }

  function handleLog() {
    if (!result) return;
    const base = (servingMode === 'package' && result.perPackage)
      ? result.perPackage
      : (result.perServing || result);
    const entry = {
      ...result,
      calories:    Math.round(base.calories * qty),
      protein:     Math.round(base.protein  * qty),
      carbs:       Math.round(base.carbs    * qty),
      fat:         Math.round(base.fat      * qty),
      servingSize: qty > 1 ? `×${qty} ${base.label || result.servingSize}` : (base.label || result.servingSize),
    };
    const ok = logMealToday(entry);
    if (ok) {
      saveToHistory(entry); // history reflects what was actually logged (e.g. whole-bag macros)
      setLogged(true);
      setTimeout(() => setLogged(false), 2500);
    }
  }

  function reset() {
    setPhase('idle');
    setPreview(null);
    setResult(null);
    setIdentified(null);
    setError(null);
    setLogged(false);
    setAnswers({});
    setShowHistory(false);
    setServingMode('serving');
    setQty(1);
    lastBase64Ref.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  function switchView(v) {
    reset();
    setView(v);
    if (v === 'describe') setDescribeText('');
  }

  // Label view: show the nutrition-facts mockup for 3s, then auto-open the camera
  useEffect(() => {
    if (view !== 'label' || phase !== 'idle') return;
    const t = setTimeout(() => {
      labelCamRef.current?.click();
    }, 3000);
    return () => clearTimeout(t);
  }, [view, phase]);

  const isLoading = phase === 'identifying' || phase === 'estimating';
  const confidenceColor = { high: 'text-emerald-500', medium: 'text-amber-500', low: 'text-red-400' };
  const onEstimate = view === 'describe' ? handleDescribeEstimate : handlePhotoEstimate;

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
        <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <ScanLine size={13} /> AI Food Scanner
        </p>
        <h2 className="text-4xl lg:text-5xl tracking-tight text-gray-900">
          {view === 'describe' ? <>Describe <span className="italic font-normal text-gray-400">& Estimate.</span></>
            : view === 'barcode' ? <>Scan <span className="italic font-normal text-gray-400">& Look up.</span></>
            : view === 'label'   ? <>Snap <span className="italic font-normal text-gray-400">the Label.</span></>
            : <>Snap <span className="italic font-normal text-gray-400">& Estimate.</span></>}
        </h2>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mt-3">
          {view === 'describe'
            ? 'Tell the AI what you ate, answer 2 to 3 quick questions, and get an accurate calorie breakdown.'
            : view === 'barcode'
            ? 'Scan any product barcode and instantly get the nutrition facts from the Open Food Facts database.'
            : view === 'label'
            ? "Take a clear photo of the nutrition facts label and we'll read the values directly off the package."
            : 'Take a photo of any meal, answer 2 to 3 quick questions, and get an accurate calorie breakdown.'}
        </p>
      </div>

      {/* Main card */}
      <div className="bg-gray-950 rounded-2xl overflow-hidden shadow-2xl">

        {/* ── PHOTO VIEW: image area ─────────────────────── */}
        {view === 'photo' && (
          <div className="relative" style={{ aspectRatio: '4/3' }}>
            {preview ? (
              <img src={preview} alt="Food" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gray-900">
                <div className="relative w-40 h-32">
                  {[['top-0 left-0','border-t-2 border-l-2 rounded-tl-2xl'],
                    ['top-0 right-0','border-t-2 border-r-2 rounded-tr-2xl'],
                    ['bottom-0 left-0','border-b-2 border-l-2 rounded-bl-2xl'],
                    ['bottom-0 right-0','border-b-2 border-r-2 rounded-br-2xl']].map(([pos,cls],i) => (
                    <div key={i} className={`absolute ${pos} w-8 h-8 border-gray-600 ${cls}`} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera size={36} className="text-gray-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-xs font-medium">Point at your meal</p>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-2 border-gray-700 border-t-amber-400 rounded-full"
                />
                <p className="text-white text-xs font-bold uppercase tracking-wider">
                  {phase === 'identifying' ? 'Identifying food...' : 'Calculating calories...'}
                </p>
                <p className="text-gray-500 text-[10px]">
                  {phase === 'identifying' ? 'Gemini AI is reading your photo' : 'Using your answers for accuracy'}
                </p>
              </div>
            )}

            {preview && !isLoading && (
              <button onClick={reset} className="absolute top-4 right-4 w-9 h-9 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* ── DESCRIBE VIEW: chat area ───────────────────── */}
        {view === 'describe' && (
          <div className="bg-gray-900 min-h-[220px]">
            {phase === 'idle' ? (
              /* Input state */
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={12} className="text-amber-400" />
                  </div>
                  <p className="text-gray-400 text-xs font-medium">What did you eat? Describe it in your own words.</p>
                </div>
                <textarea
                  value={describeText}
                  onChange={e => setDescribeText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && describeText.trim()) {
                      e.preventDefault();
                      handleDescribeSubmit();
                    }
                  }}
                  placeholder="e.g. I had a chicken shawarma wrap from a local spot, with garlic sauce and a side of fries..."
                  className="bg-gray-800 text-white text-sm placeholder-gray-600 rounded-2xl px-4 py-3 resize-none outline-none focus:ring-1 focus:ring-amber-500/40 transition-all leading-relaxed"
                  rows={4}
                />
                <button
                  onClick={handleDescribeSubmit}
                  disabled={!describeText.trim()}
                  className="w-full py-3.5 bg-amber-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={13} /> Analyze Meal
                </button>
              </div>
            ) : (
              /* Chat bubble state */
              <div className="p-5 space-y-4">
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[82%] bg-amber-500 text-white text-sm font-medium px-4 py-3 rounded-2xl rounded-tr-sm leading-relaxed">
                    {describeText}
                  </div>
                </div>
                {/* AI status */}
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={11} className="text-amber-400" />
                    </div>
                    <div className="flex items-center gap-2.5 bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-3.5 h-3.5 border border-gray-600 border-t-amber-400 rounded-full flex-shrink-0"
                      />
                      <span className="text-gray-400 text-xs font-medium">
                        {phase === 'identifying' ? 'Analyzing your meal...' : 'Calculating calories...'}
                      </span>
                    </div>
                  </div>
                ) : (phase === 'questions' || phase === 'result' || phase === 'error') && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={11} className="text-amber-400" />
                    </div>
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <p className="text-gray-300 text-xs font-medium leading-relaxed">
                        {phase === 'questions'
                          ? 'Got it! A few quick questions before I estimate:'
                          : phase === 'result'
                          ? 'Here\'s your estimate based on what you described:'
                          : 'Something went wrong, please try again.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── BARCODE VIEW ──────────────────────────────── */}
        {view === 'barcode' && phase === 'idle' && (
          <BarcodeScannerView
            onDetected={handleBarcodeDetected}
            onClose={() => switchView('photo')}
          />
        )}
        {view === 'barcode' && isLoading && (
          <div className="relative bg-gray-900" style={{ aspectRatio: '4/3' }}>
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-2 border-gray-700 border-t-amber-400 rounded-full"
                />
                <p className="text-white text-xs font-bold uppercase tracking-wider">Looking up product...</p>
                <p className="text-gray-500 text-[10px]">Checking Open Food Facts database</p>
              </div>
            )}
          </div>
        )}

        {/* ── LABEL VIEW (camera-style guide overlay) ─────── */}
        {view === 'label' && phase === 'idle' && (
          <button
            onClick={() => labelCamRef.current?.click()}
            className="relative w-full bg-black overflow-hidden block group"
            style={{ aspectRatio: '4/3' }}
            aria-label="Open camera to scan label"
          >
            {/* dark gradient backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-950" />

            {/* corner brackets, viewfinder feel */}
            <div className="absolute inset-6">
              {[['top-0 left-0','border-t-2 border-l-2 rounded-tl-xl'],
                ['top-0 right-0','border-t-2 border-r-2 rounded-tr-xl'],
                ['bottom-0 left-0','border-b-2 border-l-2 rounded-bl-xl'],
                ['bottom-0 right-0','border-b-2 border-r-2 rounded-br-xl']].map(([pos,cls],i) => (
                <div key={i} className={`absolute ${pos} w-10 h-10 border-amber-400/80 ${cls}`} />
              ))}
            </div>

            {/* Content: realistic nutrition-facts mock + instruction */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center pointer-events-none">
              {/* Realistic nutrition label mockup */}
              <div className="bg-white text-black rounded-md p-2 w-[120px] text-left shadow-xl"
                   style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                <p className="font-extrabold text-[11px] leading-tight border-b-[3px] border-black pb-0.5">Nutrition Facts</p>
                <p className="text-[6px] leading-tight">16 servings per container</p>
                <p className="text-[7px] font-bold leading-tight border-b border-black pb-0.5">Serving size <span className="float-right">1 Tbsp (21g)</span></p>
                <p className="text-[5px] mt-1 leading-tight">Amount per serving</p>
                <div className="flex justify-between items-baseline border-b-[3px] border-black">
                  <span className="text-[10px] font-extrabold leading-tight">Calories</span>
                  <span className="text-[12px] font-extrabold leading-tight">60</span>
                </div>
                <p className="text-[5px] text-right border-b border-black pb-0.5">% Daily Value*</p>
                <div className="flex justify-between text-[5.5px] border-b border-gray-400 py-0.5">
                  <span><b>Total Fat</b> 0g</span><span>0%</span>
                </div>
                <div className="flex justify-between text-[5.5px] border-b border-gray-400 py-0.5">
                  <span>Sodium 0mg</span><span>0%</span>
                </div>
                <div className="flex justify-between text-[5.5px] border-b border-gray-400 py-0.5">
                  <span><b>Total Carbs</b> 17g</span><span>6%</span>
                </div>
                <div className="flex justify-between text-[5.5px] py-0.5">
                  <span>Total Sugars 17g</span><span>34%</span>
                </div>
              </div>

              <p className="text-white text-base font-medium leading-snug max-w-xs">
                Look for the label and<br />take a clear picture.
              </p>
            </div>

            {/* Capture indicator at bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-white border-4 border-gray-300 group-active:scale-95 transition-transform shadow-2xl" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Tap to scan</span>
            </div>
          </button>
        )}
        {view === 'label' && (phase === 'identifying' || phase === 'estimating') && (
          <div className="relative bg-gray-900" style={{ aspectRatio: '4/3' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-2 border-gray-700 border-t-amber-400 rounded-full"
              />
              <p className="text-white text-xs font-bold uppercase tracking-wider">Reading label...</p>
              <p className="text-gray-500 text-[10px]">Extracting nutrition facts</p>
            </div>
          </div>
        )}

        {/* ── History panel (photo idle only) ───────────── */}
        <AnimatePresence>
          {showHistory && phase === 'idle' && view === 'photo' && (
            <HistoryPanel onClose={() => setShowHistory(false)} onReLog={(item) => { logMealToday(item); saveToHistory(item); setShowHistory(false); }} />
          )}
        </AnimatePresence>

        {/* ── Questions step (shared) ────────────────────── */}
        <AnimatePresence>
          {phase === 'questions' && identified && (
            <QuestionsStep
              dish={identified.dish}
              items={identified.items}
              questions={identified.questions}
              answers={answers}
              onChange={(q, opt) => setAnswers(prev => ({ ...prev, [q]: opt }))}
              onSubmit={onEstimate}
              loading={phase === 'estimating'}
            />
          )}
        </AnimatePresence>

        {/* ── Result (shared) ────────────────────────────── */}
        <AnimatePresence>
          {phase === 'result' && result && (() => {
            const hasServing  = !!result.perServing;
            const hasPackage  = !!result.perPackage;
            const base = (servingMode === 'package' && hasPackage)
              ? result.perPackage
              : (hasServing ? result.perServing : result);
            const displayCals    = Math.round(base.calories * qty);
            const displayProtein = Math.round(base.protein  * qty);
            const displayCarbs   = Math.round(base.carbs    * qty);
            const displayFat     = Math.round(base.fat      * qty);
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">{result.dish}</p>
                    <p className="text-gray-500 text-[10px] font-medium mt-0.5">{base.label || result.servingSize}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${confidenceColor[result.confidence] || 'text-gray-400'}`}>
                    {result.confidence} confidence
                  </span>
                </div>

                {/* ── Serving picker, always shown ── */}
                <div className="space-y-3">
                  {/* Per product / Whole bag toggle, barcode only */}
                  {hasServing && hasPackage && (
                    <div className="flex gap-2 bg-gray-900 p-1 rounded-2xl">
                      {[['serving', 'Per Product'], ['package', 'Whole Bag']].map(([mode, label]) => (
                        <button
                          key={mode}
                          onClick={() => { setServingMode(mode); setQty(1); setLogged(false); }}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                            servingMode === mode ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Number of servings, presets + custom decimal input */}
                  {(!hasPackage || servingMode === 'serving') && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Number of servings</p>
                      <div className="flex gap-2 items-center">
                        {[0.5, 1, 2, 3].map(n => (
                          <button
                            key={n}
                            onClick={() => { setQty(n); setLogged(false); }}
                            className={`h-9 px-3 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                              qty === n ? 'bg-amber-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
                            }`}
                          >
                            ×{n}
                          </button>
                        ))}
                        <input
                          key={`qty-${[0.5,1,2,3].includes(qty) ? qty : 'custom'}`}
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="20"
                          defaultValue={qty}
                          placeholder="e.g. 0.3"
                          onChange={e => {
                            const v = parseFloat(e.target.value);
                            if (v >= 0.1 && v <= 20) { setQty(v); setLogged(false); }
                          }}
                          className="flex-1 h-9 bg-gray-900 text-white text-xs font-bold rounded-xl outline-none text-center focus:ring-1 focus:ring-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-gray-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-bold text-white leading-none">{displayCals}</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">kcal estimated</p>
                  </div>
                  <div className="flex gap-4">
                    <MacroChip label="Protein" value={`${displayProtein}g`} color="bg-gray-700" />
                    <MacroChip label="Carbs"   value={`${displayCarbs}g`}   color="bg-amber-600" />
                    <MacroChip label="Fat"     value={`${displayFat}g`}     color="bg-gray-600" />
                  </div>
                </div>

                {result.items?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.items.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-[10px] font-bold">{item}</span>
                    ))}
                  </div>
                )}

                {result.tip && (
                  <div className="flex gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3">
                    <Zap size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-200/80 text-xs font-medium leading-relaxed">{result.tip}</p>
                  </div>
                )}

                <button
                  onClick={handleLog}
                  className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    logged ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-400'
                  }`}
                >
                  {logged ? <><Check size={14} /> Logged to Today!</> : <>Log {displayCals} kcal to Today <ChevronRight size={14} /></>}
                </button>
              </motion.div>
            );
          })()}

          {phase === 'error' && error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center space-y-4">
              {(error.includes('not found') || error.includes('No nutritional')) ? (
                <>
                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto">
                    <Barcode size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-1">Product not in database</p>
                    <p className="text-gray-500 text-xs leading-relaxed">This product isn't in Open Food Facts yet.<br />Try one of these alternatives:</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { reset(); switchView('photo'); setTimeout(() => cameraInputRef.current?.click(), 150); }}
                      className="flex-1 py-3 bg-amber-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Camera size={12} /> Photo Label
                    </button>
                    <button
                      onClick={() => { reset(); switchView('describe'); }}
                      className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={12} /> Describe It
                    </button>
                  </div>
                  <button onClick={reset} className="text-gray-600 text-xs font-bold hover:text-gray-400 transition-colors">← Try another barcode</button>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-sm font-medium">{error}</p>
                  <button onClick={reset} className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-700 transition-colors">Try Again</button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action buttons, photo idle ─────────────────── */}
        {phase === 'idle' && view === 'photo' && (
          <div className="p-5 grid grid-cols-6 gap-1.5">
            <button
              onClick={() => switchView('describe')}
              className="flex flex-col items-center justify-center gap-2 py-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-all active:scale-95 border border-amber-500/20"
            >
              <MessageSquare size={16} className="text-amber-400" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400">Describe</span>
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 py-4 bg-amber-500 rounded-2xl hover:bg-amber-400 transition-all active:scale-95"
            >
              <Camera size={16} className="text-white" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-white">Camera</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 py-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-all active:scale-95"
            >
              <Upload size={16} className="text-gray-300" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-gray-300">Gallery</span>
            </button>
            <button
              onClick={() => switchView('label')}
              className="flex flex-col items-center justify-center gap-2 py-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-all active:scale-95 border border-gray-700"
            >
              <FileText size={16} className="text-gray-300" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-gray-300">Label</span>
            </button>
            <button
              onClick={() => switchView('barcode')}
              className="flex flex-col items-center justify-center gap-2 py-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-all active:scale-95 border border-gray-700"
            >
              <Barcode size={16} className="text-gray-300" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-gray-300">Barcode</span>
            </button>
            <button
              onClick={() => setShowHistory(v => !v)}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all active:scale-95 ${showHistory ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <Clock size={16} />
              <span className="text-[8px] font-bold uppercase tracking-wider">History</span>
            </button>
          </div>
        )}

        {/* Hidden file inputs — always mounted so refs are valid across all views */}
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        <input ref={fileInputRef}   type="file" accept="image/*"                        className="hidden" onChange={handleFile} />
        <input ref={labelCamRef}    type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLabelFile} />

        {/* ── Describe idle footer: switch to photo ──────── */}
        {phase === 'idle' && view === 'describe' && (
          <div className="px-5 pb-5 flex items-center justify-between">
            <button
              onClick={() => switchView('photo')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs font-bold transition-colors"
            >
              <Camera size={13} /> Use photo instead
            </button>
            <button
              onClick={() => setShowHistory(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${showHistory ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Clock size={13} /> History
            </button>
          </div>
        )}

        {/* ── Label idle footer: switch back to photo ────── */}
        {phase === 'idle' && view === 'label' && (
          <div className="px-5 py-4 flex items-center justify-center bg-gray-950">
            <button
              onClick={() => switchView('photo')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs font-bold transition-colors"
            >
              <ChevronRight size={13} className="rotate-180" /> Back to scanner
            </button>
          </div>
        )}

        {/* ── History panel (describe idle) ─────────────── */}
        <AnimatePresence>
          {showHistory && phase === 'idle' && view === 'describe' && (
            <HistoryPanel onClose={() => setShowHistory(false)} onReLog={(item) => { logMealToday(item); setShowHistory(false); }} />
          )}
        </AnimatePresence>

        {/* ── Re-scan / New description ─────────────────── */}
        {(phase === 'result' || phase === 'error') && (
          <div className="px-6 pb-6">
            <button onClick={reset} className="w-full py-3 bg-gray-800 text-gray-400 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center gap-2">
              <RotateCcw size={13} />
              {view === 'describe' ? 'Describe Another Meal' : view === 'barcode' ? 'Scan Another Barcode' : 'Scan Another Meal'}
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-gray-400 font-medium px-4">
        Estimates are AI-generated and may vary ±15%. For reference only.
      </p>
    </motion.div>
  );
}
