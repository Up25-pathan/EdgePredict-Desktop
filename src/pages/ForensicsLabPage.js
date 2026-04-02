import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload, Zap, AlertTriangle, CheckCircle, Camera, Settings, Search,
  Microscope, FileText, BarChart3, Shield, Clock, Download, Trash2,
  ChevronRight, X, Activity, Layers, Thermometer, Droplets, Gauge,
  HelpCircle, ZoomIn, Image as ImageIcon, FlaskConical, Wrench,
  FileDown, ChevronDown, AlertCircle, Video, RefreshCw, CircleDot
} from 'lucide-react';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import FeatureGate from '../components/common/FeatureGate';
import { FEATURES } from '../config/permissions';
import { exportPDF, exportExcel, exportPowerPoint, exportXML } from '../services/ForensicExportService';

// ═══════════════════════════════════════════════════════════
//  MOCK DATA GENERATORS
// ═══════════════════════════════════════════════════════════
const FAILURE_TYPES = [
  { type: 'Chipping', icon: '🔴', actions: ['Reduce feed rate by 15%', 'Check tool rigidity', 'Verify coolant flow'] },
  { type: 'Flank Wear', icon: '🟡', actions: ['Decrease cutting speed by 10%', 'Check tool alignment', 'Inspect coolant nozzle position'] },
  { type: 'Crater Wear', icon: '🟠', actions: ['Reduce cutting speed', 'Switch to coated insert', 'Increase coolant concentration'] },
  { type: 'Thermal Cracking', icon: '🔴', actions: ['Use intermittent coolant', 'Reduce depth of cut', 'Switch to ceramic grade'] },
  { type: 'Built-Up Edge', icon: '🟡', actions: ['Increase cutting speed by 20%', 'Use sharper rake angle', 'Apply anti-friction coating'] },
  { type: 'Notch Wear', icon: '🟠', actions: ['Modify lead angle', 'Use round insert geometry', 'Reduce DOC at notch zone'] },
];

const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const generateQuickScan = () => {
  const primary = FAILURE_TYPES[Math.floor(Math.random() * FAILURE_TYPES.length)];
  const confidence = 75 + Math.floor(Math.random() * 23);
  const severityIdx = Math.floor(Math.random() * 4);
  return {
    primary: primary.type,
    icon: primary.icon,
    confidence,
    severity: SEVERITY_LEVELS[severityIdx],
    actions: primary.actions,
    costImpact: Math.floor(50 + Math.random() * 200)
  };
};

const generateDeepAnalysis = () => {
  const shuffled = [...FAILURE_TYPES].sort(() => Math.random() - 0.5);
  const probabilities = shuffled.slice(0, 4).map((f, i) => ({
    type: f.type,
    probability: Math.max(5, Math.floor(90 - i * 22 + (Math.random() * 15 - 7)))
  })).sort((a, b) => b.probability - a.probability);

  return {
    probabilities,
    correlations: [
      'Cutting speed exceeds recommended range for this material hardness',
      'Insufficient coolant flow detected at cutting edge region',
      'Feed rate variance suggests vibration-induced instability',
      'Coating integrity compromised — potential delamination at flank face'
    ].slice(0, 2 + Math.floor(Math.random() * 2)),
    hotspots: [
      { x: 35 + Math.random() * 30, y: 25 + Math.random() * 20, label: 'Primary wear zone', severity: 'high' },
      { x: 55 + Math.random() * 20, y: 50 + Math.random() * 15, label: 'Thermal damage', severity: 'medium' },
      { x: 20 + Math.random() * 15, y: 60 + Math.random() * 10, label: 'Chip adhesion', severity: 'low' },
    ],
    supplierAssessment: { name: 'ToolCo Inc.', quality: 'A-', similarFailures: Math.floor(Math.random() * 5) + 1 }
  };
};

const generateForensicReport = () => ({
  reportId: `AI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
  legalGrade: true,
  timeline: [
    { time: '0 min', event: 'Initial tool engagement — normal cutting forces', status: 'ok' },
    { time: '12 min', event: 'Temperature rise detected at rake face (+45°C)', status: 'warning' },
    { time: '28 min', event: 'Vibration amplitude increased 2.3x baseline', status: 'warning' },
    { time: '35 min', event: 'Coating delamination initiated at primary cutting edge', status: 'danger' },
    { time: '42 min', event: 'Catastrophic failure — edge fracture detected', status: 'danger' },
  ],
  compliance: [
    { standard: 'ISO 9001:2015', status: true, note: 'Quality Management System' },
    { standard: 'ISO 13399', status: true, note: 'Cutting Tool Data Standard' },
    { standard: 'OSHA Safety', status: true, note: 'Workplace Safety Requirements' },
    { standard: 'VDI 3208', status: false, note: 'Carbide Classification (non-conformance in wear resistance)' },
  ],
  materialAnalysis: {
    microstructure: 'WC-Co binder phase intact, grain boundary cracks at 12µm depth',
    hardnessProfile: 'Surface: 1650 HV30 → Core: 1580 HV30 (nominal range)',
    coatingIntegrity: 'TiAlN layer delaminated at 85% of rake face. Adhesion failure mode.'
  }
});

// ═══════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════
const ForensicsLabPage = () => {
  // ── State ──
  const [inputTab, setInputTab] = useState('visual');        // 'visual' | 'process' | 'material'
  const [images, setImages] = useState([]);                  // up to 5 uploaded images
  const [previewIdx, setPreviewIdx] = useState(null);        // index for zoom preview

  const [processParams, setProcessParams] = useState({
    cuttingSpeed: '', feedRate: '', depthOfCut: '', coolantFlow: '',
    spindleLoad: '', temperature: '', humidity: ''
  });
  const [gcodeFile, setGcodeFile] = useState(null);
  const [vibrationFile, setVibrationFile] = useState(null);

  const [materialParams, setMaterialParams] = useState({
    toolGrade: 'Carbide', coating: 'TiAlN', heatTreatment: 'Standard',
    supplier: '', workpieceMaterial: 'Steel AISI 1045', hardness: '',
    batchNumber: '', manufacturingDate: ''
  });

  const [analysisState, setAnalysisState] = useState('idle'); // 'idle' | 'scanning' | 'done'
  const [analysisTier, setAnalysisTier] = useState(null);     // 'quick' | 'deep' | 'report'
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState(null);

  const fileInputRef = useRef(null);
  const semInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ── Camera / Microscope state ──
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('webcam'); // 'webcam' | 'microscope'
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  // Enumerate camera devices
  const enumerateCameras = useCallback(async () => {
    try {
      // Need a temporary stream to get permissions first
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(t => t.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setCameraDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
      return videoDevices;
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions.');
      return [];
    }
  }, [selectedDeviceId]);

  // Start camera stream
  const startCamera = useCallback(async (deviceId) => {
    try {
      setCameraError(null);
      // Stop existing stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(`Failed to start camera: ${err.message}`);
    }
  }, [cameraStream]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [cameraStream]);

  // Open camera modal
  const openCamera = async (mode) => {
    setCameraMode(mode);
    setCameraOpen(true);
    setCameraError(null);
    const devices = await enumerateCameras();
    if (devices.length > 0) {
      // For microscope mode, try to pick a non-default device if available
      const deviceId = mode === 'microscope' && devices.length > 1
        ? devices[devices.length - 1].deviceId  // usually USB microscope is last
        : devices[0].deviceId;
      setSelectedDeviceId(deviceId);
      await startCamera(deviceId);
    }
  };

  // Close camera modal
  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCameraError(null);
  };

  // Capture snapshot from video
  const captureSnapshot = () => {
    if (!videoRef.current || images.length >= 5) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const source = cameraMode === 'microscope' ? 'MICRO' : 'CAM';
      const fileName = `${source}_capture_${timestamp}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      const newImage = {
        file,
        url: URL.createObjectURL(blob),
        name: fileName,
        size: (blob.size / 1024).toFixed(1) + ' KB',
        quality: Math.floor(80 + Math.random() * 18)
      };
      setImages(prev => [...prev, newImage].slice(0, 5));
    }, 'image/png');
  };

  // Switch camera device
  const switchDevice = async (deviceId) => {
    setSelectedDeviceId(deviceId);
    await startCamera(deviceId);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  // SEM file import handler
  const handleSemImport = () => {
    semInputRef.current?.click();
  };

  // ── Image handling ──
  const addImages = useCallback((files) => {
    const newImages = Array.from(files).slice(0, 5 - images.length).map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      quality: Math.floor(70 + Math.random() * 28) // mock quality score
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 5));
  }, [images.length]);

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    if (previewIdx === idx) setPreviewIdx(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
  }, [addImages]);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };

  // ── Analysis runner ──
  const runAnalysis = (tier) => {
    if (images.length === 0) return;
    setAnalysisTier(tier);
    setAnalysisState('scanning');
    setResults(null);
    setAnalysisProgress(0);

    const duration = tier === 'quick' ? 3000 : tier === 'deep' ? 6000 : 9000;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setAnalysisProgress(Math.min(100, Math.round((step / steps) * 100)));
      if (step >= steps) {
        clearInterval(timer);
        setAnalysisState('done');
        if (tier === 'quick') setResults(generateQuickScan());
        else if (tier === 'deep') setResults(generateDeepAnalysis());
        else setResults(generateForensicReport());
      }
    }, interval);
  };

  const resetAnalysis = () => {
    setAnalysisState('idle');
    setAnalysisTier(null);
    setResults(null);
    setAnalysisProgress(0);
  };

  // ── Render ──
  return (
    <FeatureGate feature={FEATURES.FORENSICS_LAB} showLock={true}>
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">

        {/* ─── HEADER BAR ─── */}
        <div className="shrink-0 px-6 py-4 border-b border-studio-border bg-studio-panel/60 backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg border border-purple-500/30">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-studio-text-main tracking-tight">AI LAB — Tool Failure Analysis Center</h1>
              <p className="text-[10px] text-studio-text-dim font-mono uppercase tracking-wider">Powered by EdgePredict Forensic AI Model v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-studio-text-muted hover:text-studio-text-main hover:bg-studio-surface rounded-lg transition-colors" title="Help">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="p-2 text-studio-text-muted hover:text-studio-text-main hover:bg-studio-surface rounded-lg transition-colors" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* ─── INPUT TABS ─── */}
          <div className="flex gap-3">
            {[
              { key: 'visual', label: 'Visual Analysis', icon: Camera, color: 'purple' },
              { key: 'process', label: 'Process Parameters', icon: Settings, color: 'blue' },
              { key: 'material', label: 'Material Science', icon: Microscope, color: 'emerald' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setInputTab(tab.key)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${inputTab === tab.key
                  ? 'bg-studio-primary/10 border-studio-primary/40 text-studio-primary shadow-sm shadow-studio-primary/10'
                  : 'bg-studio-panel/60 border-studio-border/50 text-studio-text-muted hover:text-studio-text-main hover:border-studio-border'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'visual' && images.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-studio-primary/20 text-studio-primary">{images.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* ─── PANEL CONTENT ─── */}
          <div className="min-h-[320px]">

            {/* ── VISUAL ANALYSIS TAB ── */}
            {inputTab === 'visual' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Upload Zone */}
                <div className="lg:col-span-2">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => images.length < 5 && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer min-h-[280px] flex flex-col items-center justify-center ${images.length > 0
                      ? 'border-studio-border/40 bg-studio-panel/40'
                      : 'border-studio-primary/30 bg-studio-primary/5 hover:border-studio-primary/50 hover:bg-studio-primary/10'
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => addImages(e.target.files)}
                    />

                    {images.length === 0 ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-studio-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-studio-primary/20">
                          <Upload className="w-7 h-7 text-studio-primary" />
                        </div>
                        <h3 className="text-base font-bold text-studio-text-main mb-1">Upload Tool Images</h3>
                        <p className="text-sm text-studio-text-muted mb-4">Drag & drop or click to upload</p>
                        <div className="flex items-center justify-center gap-4 text-[11px] text-studio-text-dim">
                          <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> Tool photos</span>
                          <span className="flex items-center gap-1"><Microscope className="w-3 h-3" /> Microscopy</span>
                          <span className="flex items-center gap-1"><Search className="w-3 h-3" /> SEM images</span>
                        </div>
                        <p className="text-[10px] text-studio-text-dim mt-3">Up to 5 images • JPG, PNG, TIFF</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-studio-text-main uppercase tracking-wider">Uploaded Specimens ({images.length}/5)</h3>
                          {images.length < 5 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                              className="text-[11px] text-studio-primary hover:text-studio-primary/80 font-semibold flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" /> Add More
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" onClick={(e) => e.stopPropagation()}>
                          {images.map((img, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-studio-border/50 bg-studio-canvas aspect-square">
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button onClick={() => setPreviewIdx(idx)} className="p-1.5 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30">
                                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                                </button>
                                <button onClick={() => removeImage(idx)} className="p-1.5 bg-red-500/30 backdrop-blur rounded-lg hover:bg-red-500/50">
                                  <Trash2 className="w-3.5 h-3.5 text-white" />
                                </button>
                              </div>
                              {/* Quality badge */}
                              <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${img.quality > 85 ? 'bg-emerald-500/80 text-white' : img.quality > 70 ? 'bg-amber-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                                Q:{img.quality}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar: Image Info & Camera */}
                <div className="space-y-4">
                  <Panel title="Camera Integration">
                    <div className="space-y-3">
                      <button
                        onClick={() => openCamera('webcam')}
                        disabled={images.length >= 5}
                        className="w-full flex items-center gap-3 p-3 bg-studio-surface/60 border border-studio-border/40 rounded-lg hover:bg-studio-surface transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                      >
                        <div className="p-1.5 rounded-md bg-studio-primary/10 group-hover:bg-studio-primary/20 transition-colors">
                          <Camera className="w-4 h-4 text-studio-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-studio-text-main">Live Capture</div>
                          <div className="text-[10px] text-studio-text-dim">Webcam / USB Camera</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-studio-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button
                        onClick={() => openCamera('microscope')}
                        disabled={images.length >= 5}
                        className="w-full flex items-center gap-3 p-3 bg-studio-surface/60 border border-studio-border/40 rounded-lg hover:bg-studio-surface transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                      >
                        <div className="p-1.5 rounded-md bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                          <Microscope className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-studio-text-main">Microscope Link</div>
                          <div className="text-[10px] text-studio-text-dim">Connect optical microscope</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-studio-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button
                        onClick={handleSemImport}
                        disabled={images.length >= 5}
                        className="w-full flex items-center gap-3 p-3 bg-studio-surface/60 border border-studio-border/40 rounded-lg hover:bg-studio-surface transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                      >
                        <div className="p-1.5 rounded-md bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                          <Search className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-studio-text-main">SEM Import</div>
                          <div className="text-[10px] text-studio-text-dim">Import SEM imagery</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-studio-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <input
                        ref={semInputRef}
                        type="file"
                        accept="image/*,.tif,.tiff,.bmp,.dm3"
                        multiple
                        className="hidden"
                        onChange={(e) => { addImages(e.target.files); e.target.value = ''; }}
                      />
                    </div>
                  </Panel>
                  {images.length > 0 && (
                    <Panel title="Image Details">
                      <div className="space-y-2">
                        {images.map((img, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] py-1.5 border-b border-studio-border/30 last:border-0">
                            <span className="text-studio-text-muted truncate max-w-[140px]">{img.name}</span>
                            <span className="text-studio-text-dim">{img.size}</span>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  )}
                </div>
              </div>
            )}

            {/* ── PROCESS PARAMETERS TAB ── */}
            {inputTab === 'process' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Cutting Parameters */}
                <Panel title={<><Wrench className="w-3.5 h-3.5 text-blue-400 mr-2 inline" />Cutting Parameters</>}>
                  <div className="space-y-4">
                    <ParamInput label="Cutting Speed" unit="m/min" value={processParams.cuttingSpeed}
                      onChange={v => setProcessParams(p => ({ ...p, cuttingSpeed: v }))} icon={Gauge} />
                    <ParamInput label="Feed Rate" unit="mm/rev" value={processParams.feedRate}
                      onChange={v => setProcessParams(p => ({ ...p, feedRate: v }))} icon={Activity} />
                    <ParamInput label="Depth of Cut" unit="mm" value={processParams.depthOfCut}
                      onChange={v => setProcessParams(p => ({ ...p, depthOfCut: v }))} icon={Layers} />
                    <ParamInput label="Coolant Flow" unit="L/min" value={processParams.coolantFlow}
                      onChange={v => setProcessParams(p => ({ ...p, coolantFlow: v }))} icon={Droplets} />
                  </div>
                </Panel>

                {/* Machine Data */}
                <Panel title={<><FileText className="w-3.5 h-3.5 text-amber-400 mr-2 inline" />Machine Data</>}>
                  <div className="space-y-4">
                    <FileUploadField label="Upload G-Code" file={gcodeFile} onFile={setGcodeFile} accept=".nc,.gcode,.ngc,.tap" />
                    <FileUploadField label="Vibration Log" file={vibrationFile} onFile={setVibrationFile} accept=".csv,.log,.txt" />
                    <ParamInput label="Spindle Load" unit="%" value={processParams.spindleLoad}
                      onChange={v => setProcessParams(p => ({ ...p, spindleLoad: v }))} icon={Gauge} />
                  </div>
                </Panel>

                {/* Environment */}
                <Panel title={<><Thermometer className="w-3.5 h-3.5 text-red-400 mr-2 inline" />Environment</>}>
                  <div className="space-y-4">
                    <ParamInput label="Temperature" unit="°C" value={processParams.temperature}
                      onChange={v => setProcessParams(p => ({ ...p, temperature: v }))} icon={Thermometer} />
                    <ParamInput label="Humidity" unit="%" value={processParams.humidity}
                      onChange={v => setProcessParams(p => ({ ...p, humidity: v }))} icon={Droplets} />
                  </div>
                  <div className="mt-6 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <p className="text-[10px] text-blue-400 leading-relaxed">
                      <strong>Tip:</strong> Environmental conditions affect coolant efficiency and thermal stability. Always record ambient conditions for accurate analysis.
                    </p>
                  </div>
                </Panel>
              </div>
            )}

            {/* ── MATERIAL SCIENCE TAB ── */}
            {inputTab === 'material' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Tool Material */}
                <Panel title={<><Shield className="w-3.5 h-3.5 text-emerald-400 mr-2 inline" />Tool Material</>}>
                  <div className="space-y-4">
                    <SelectField label="Grade" value={materialParams.toolGrade}
                      onChange={v => setMaterialParams(p => ({ ...p, toolGrade: v }))}
                      options={['Carbide', 'Cermet', 'CBN', 'PCD', 'HSS', 'HSS-Co', 'Ceramic']} />
                    <SelectField label="Coating" value={materialParams.coating}
                      onChange={v => setMaterialParams(p => ({ ...p, coating: v }))}
                      options={['TiAlN', 'TiN', 'AlCrN', 'DLC', 'CVD Diamond', 'None']} />
                    <SelectField label="Heat Treatment" value={materialParams.heatTreatment}
                      onChange={v => setMaterialParams(p => ({ ...p, heatTreatment: v }))}
                      options={['Standard', 'Cryo-Treated', 'Double Tempered', 'Induction Hardened']} />
                    <ParamInput label="Supplier" value={materialParams.supplier}
                      onChange={v => setMaterialParams(p => ({ ...p, supplier: v }))} icon={Shield} unit="" />
                  </div>
                </Panel>

                {/* Workpiece */}
                <Panel title={<><FlaskConical className="w-3.5 h-3.5 text-purple-400 mr-2 inline" />Workpiece</>}>
                  <div className="space-y-4">
                    <SelectField label="Material" value={materialParams.workpieceMaterial}
                      onChange={v => setMaterialParams(p => ({ ...p, workpieceMaterial: v }))}
                      options={['Steel AISI 1045', 'Steel AISI 4340', 'Aluminum 6061-T6', 'Ti-6Al-4V', 'Inconel 718', 'Stainless 316L']} />
                    <ParamInput label="Hardness" unit="HRC" value={materialParams.hardness}
                      onChange={v => setMaterialParams(p => ({ ...p, hardness: v }))} icon={Shield} />
                  </div>
                </Panel>

                {/* History / Traceability */}
                <Panel title={<><Clock className="w-3.5 h-3.5 text-amber-400 mr-2 inline" />History & Traceability</>}>
                  <div className="space-y-4">
                    <ParamInput label="Batch Number" value={materialParams.batchNumber}
                      onChange={v => setMaterialParams(p => ({ ...p, batchNumber: v }))} icon={FileText} unit="" />
                    <div>
                      <label className="text-[10px] font-bold text-studio-text-muted uppercase tracking-wider mb-1.5 block">Manufacturing Date</label>
                      <input
                        type="date"
                        value={materialParams.manufacturingDate}
                        onChange={e => setMaterialParams(p => ({ ...p, manufacturingDate: e.target.value }))}
                        className="w-full bg-studio-surface/60 border border-studio-border/50 rounded-lg p-2.5 text-sm text-studio-text-main focus:border-studio-primary outline-none transition-colors"
                      />
                    </div>
                  </div>
                </Panel>
              </div>
            )}
          </div>

          {/* ─── ANALYSIS TIER BUTTONS ─── */}
          <div className="border-t border-studio-border/40 pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                icon={Zap}
                size="lg"
                disabled={images.length === 0 || analysisState === 'scanning'}
                onClick={() => runAnalysis('quick')}
                className="min-w-[180px]"
              >
                Quick Scan
              </Button>
              <Button
                variant="secondary"
                icon={Microscope}
                size="lg"
                disabled={images.length === 0 || analysisState === 'scanning'}
                onClick={() => runAnalysis('deep')}
                className="min-w-[180px]"
              >
                Deep Analysis
              </Button>
              <Button
                variant="secondary"
                icon={BarChart3}
                size="lg"
                disabled={images.length === 0 || analysisState === 'scanning'}
                onClick={() => runAnalysis('report')}
                className="min-w-[180px]"
              >
                Full Report
              </Button>

              {images.length === 0 && (
                <span className="text-[11px] text-studio-text-dim flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Upload at least one image to begin analysis
                </span>
              )}

              {analysisState === 'done' && (
                <button onClick={resetAnalysis} className="ml-auto text-xs text-studio-text-dim hover:text-studio-text-main flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Clear Results
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {analysisState === 'scanning' && (
              <div className="mt-4 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-studio-text-main flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-studio-primary animate-pulse" />
                    {analysisTier === 'quick' ? 'Running Quick Scan...' : analysisTier === 'deep' ? 'Running Deep Analysis...' : 'Generating Forensic Report...'}
                  </span>
                  <span className="text-xs font-mono text-studio-text-dim">{analysisProgress}%</span>
                </div>
                <div className="w-full h-2 bg-studio-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-studio-primary to-studio-accent rounded-full transition-all duration-200"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {['Image Processing', 'Pattern Recognition', 'Report Generation'].map((step, i) => (
                    <div key={i} className={`flex items-center gap-1.5 text-[10px] ${analysisProgress > (i + 1) * 30 ? 'text-emerald-400' : 'text-studio-text-dim'}`}>
                      {analysisProgress > (i + 1) * 30 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── RESULTS AREA ─── */}
          {analysisState === 'done' && results && (
            <div className="animate-fadeIn">
              {analysisTier === 'quick' && <QuickScanResult data={results} onDeepDive={() => runAnalysis('deep')} />}
              {analysisTier === 'deep' && <DeepAnalysisResult data={results} images={images} />}
              {analysisTier === 'report' && <ForensicReportResult data={results} images={images} processParams={processParams} materialParams={materialParams} />}
            </div>
          )}
        </div>

        {/* ─── IMAGE PREVIEW MODAL ─── */}
        {previewIdx !== null && images[previewIdx] && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setPreviewIdx(null)}>
            <div className="relative max-w-4xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
              <img src={images[previewIdx].url} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
              <button onClick={() => setPreviewIdx(null)} className="absolute -top-3 -right-3 p-2 bg-studio-panel rounded-full border border-studio-border shadow-lg hover:bg-studio-surface transition-colors">
                <X className="w-4 h-4 text-studio-text-main" />
              </button>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur rounded-lg px-3 py-1.5">
                <p className="text-white text-xs font-mono">{images[previewIdx].name}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── CAMERA CAPTURE MODAL ─── */}
        {cameraOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-studio-panel border border-studio-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-studio-border bg-studio-surface/60">
                <div className="flex items-center gap-2">
                  {cameraMode === 'microscope'
                    ? <Microscope className="w-4 h-4 text-emerald-400" />
                    : <Camera className="w-4 h-4 text-studio-primary" />
                  }
                  <h3 className="text-sm font-bold text-studio-text-main">
                    {cameraMode === 'microscope' ? 'Microscope Link' : 'Live Capture'}
                  </h3>
                  <span className="ml-2 px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    LIVE
                  </span>
                </div>
                <button onClick={closeCamera} className="p-1.5 hover:bg-studio-surface rounded-lg transition-colors">
                  <X className="w-4 h-4 text-studio-text-muted" />
                </button>
              </div>

              {/* Video Feed */}
              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                {/* Hidden canvas for snapshot */}
                <canvas ref={canvasRef} className="hidden" />

                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center p-6">
                      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                      <p className="text-sm text-red-300 max-w-xs">{cameraError}</p>
                      <button
                        onClick={() => startCamera(selectedDeviceId)}
                        className="mt-3 px-4 py-2 text-xs font-semibold bg-studio-primary/20 text-studio-primary border border-studio-primary/30 rounded-lg hover:bg-studio-primary/30 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3 inline mr-1.5" />Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Crosshair overlay for microscope mode */}
                {cameraMode === 'microscope' && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/30" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/30" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-emerald-400/40 rounded-full" />
                  </div>
                )}

                {/* Image count badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] text-white font-mono">
                  {images.length}/5 images
                </div>
              </div>

              {/* Controls */}
              <div className="px-5 py-4 border-t border-studio-border space-y-3">
                {/* Device selector (especially useful for microscope) */}
                {cameraDevices.length > 1 && (
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider shrink-0">Device:</label>
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => switchDevice(e.target.value)}
                      className="flex-1 bg-studio-surface/60 border border-studio-border/50 rounded-lg p-2 text-xs text-studio-text-main focus:border-studio-primary outline-none"
                    >
                      {cameraDevices.map((dev, i) => (
                        <option key={dev.deviceId} value={dev.deviceId}>
                          {dev.label || `Camera ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-studio-text-dim">
                    {cameraMode === 'microscope'
                      ? 'Select your USB microscope from the device list above'
                      : 'Position your tool specimen in frame and capture'
                    }
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={closeCamera}
                      className="px-4 py-2 text-xs font-semibold text-studio-text-muted bg-studio-surface border border-studio-border rounded-lg hover:bg-studio-panel transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={captureSnapshot}
                      disabled={!cameraStream || images.length >= 5}
                      className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-studio-primary to-studio-accent rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CircleDot className="w-3.5 h-3.5" />
                      Capture
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  );
};

// ═══════════════════════════════════════════════════════════
//  TIER 1: QUICK SCAN RESULT
// ═══════════════════════════════════════════════════════════
const QuickScanResult = ({ data, onDeepDive }) => {
  const severityColors = {
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30'
  };

  return (
    <div className="bg-studio-panel/80 border border-studio-border/60 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-5 h-5 text-studio-primary" />
        <h2 className="text-sm font-bold text-studio-text-main uppercase tracking-wider">Quick Scan Results</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primary Diagnosis */}
        <div className="md:col-span-1 p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40 text-center">
          <div className="text-4xl mb-3">{data.icon}</div>
          <div className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-1">Primary Issue</div>
          <div className="text-xl font-bold text-studio-text-main mb-3">{data.primary}</div>
          <div className="flex items-center justify-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${severityColors[data.severity]}`}>
              {data.severity}
            </span>
            <span className="text-sm font-mono text-emerald-400 font-bold">{data.confidence}%</span>
          </div>
        </div>

        {/* Immediate Actions */}
        <div className="md:col-span-1 p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40">
          <div className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-3">Immediate Actions</div>
          <div className="space-y-2.5">
            {data.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-studio-text-muted">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost & Actions */}
        <div className="md:col-span-1 p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-2">Est. Cost Impact</div>
            <div className="text-3xl font-bold text-studio-text-main font-mono">${data.costImpact}</div>
            <p className="text-[10px] text-studio-text-dim mt-1">per failure incident</p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" size="sm" icon={FileText}>Details</Button>
            <Button variant="primary" size="sm" icon={Microscope} onClick={onDeepDive}>Deep Dive</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  TIER 2: DEEP ANALYSIS
// ═══════════════════════════════════════════════════════════
const DeepAnalysisResult = ({ data, images }) => (
  <div className="bg-studio-panel/80 border border-studio-border/60 rounded-2xl p-6 shadow-lg space-y-6">
    <div className="flex items-center gap-2">
      <Microscope className="w-5 h-5 text-purple-400" />
      <h2 className="text-sm font-bold text-studio-text-main uppercase tracking-wider">Comprehensive Analysis</h2>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Failure Probability Matrix */}
      <div className="p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40">
        <h3 className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="w-3 h-3" /> Failure Probability Matrix
        </h3>
        <div className="space-y-3">
          {data.probabilities.map((p, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-studio-text-muted font-medium">{p.type}</span>
                <span className="font-mono font-bold text-studio-text-main">{p.probability}%</span>
              </div>
              <div className="w-full h-3 bg-studio-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${p.probability > 60 ? 'bg-red-500' : p.probability > 30 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                  style={{ width: `${p.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annotated Image with Hotspots */}
      <div className="p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40">
        <h3 className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-4 flex items-center gap-2">
          <Search className="w-3 h-3" /> Microstructure Analysis
        </h3>
        <div className="relative rounded-lg overflow-hidden border border-studio-border/50 bg-black aspect-video">
          {images[0] && <img src={images[0].url} alt="Annotated" className="w-full h-full object-cover opacity-80" />}
          {data.hotspots.map((hs, i) => (
            <div key={i} className="absolute group" style={{ left: `${hs.x}%`, top: `${hs.y}%` }}>
              <div className={`w-5 h-5 rounded-full border-2 animate-pulse ${hs.severity === 'high' ? 'border-red-500 bg-red-500/30' : hs.severity === 'medium' ? 'border-amber-500 bg-amber-500/30' : 'border-blue-500 bg-blue-500/30'
                }`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 backdrop-blur rounded text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {hs.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Parameter Correlations */}
      <div className="p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40">
        <h3 className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="w-3 h-3" /> Parameter Correlations
        </h3>
        <div className="space-y-2">
          {data.correlations.map((c, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-studio-text-muted leading-relaxed">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Assessment */}
      <div className="p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40">
        <h3 className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
          <Shield className="w-3 h-3" /> Supplier Assessment
        </h3>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-lg font-bold text-studio-text-main">{data.supplierAssessment.name}</div>
            <div className="text-xs text-studio-text-dim mt-1">Registered supplier</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 font-mono">{data.supplierAssessment.quality}</div>
            <div className="text-[10px] text-studio-text-dim uppercase">Quality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400 font-mono">{data.supplierAssessment.similarFailures}</div>
            <div className="text-[10px] text-studio-text-dim uppercase">Similar this month</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
//  TIER 3: FORENSIC REPORT
// ═══════════════════════════════════════════════════════════
const ForensicReportResult = ({ data, images = [], processParams = {}, materialParams = {} }) => {
  const [exporting, setExporting] = React.useState(null);
  const [exportDone, setExportDone] = React.useState(null);

  const exportContext = { ...data, images, processParams, materialParams };

  const handleExport = async (format) => {
    setExporting(format);
    setExportDone(null);
    try {
      if (format === 'PDF') await exportPDF(exportContext);
      else if (format === 'Excel') await exportExcel(exportContext);
      else if (format === 'PowerPoint') await exportPowerPoint(exportContext);
      else if (format === 'XML') await exportXML(exportContext);
      setExportDone(format);
      setTimeout(() => setExportDone(null), 3000);
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-studio-panel/80 border border-studio-border/60 rounded-2xl p-6 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-studio-text-main uppercase tracking-wider">Forensic Analysis Report</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-studio-text-dim">Report ID: {data.reportId}</span>
          {data.legalGrade && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <CheckCircle className="w-3 h-3" /> Certified
            </span>
          )}
        </div>
      </div>

      {/* Failure Timeline */}
      <div className="p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40">
        <h3 className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-3 h-3" /> Failure Timeline
        </h3>
        <div className="relative pl-6">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-studio-border/60" />
          {data.timeline.map((event, i) => (
            <div key={i} className="relative flex items-start gap-4 pb-4 last:pb-0">
              <div className={`absolute left-[-16px] w-3 h-3 rounded-full border-2 ${event.status === 'ok' ? 'border-emerald-500 bg-emerald-500/30' :
                event.status === 'warning' ? 'border-amber-500 bg-amber-500/30' :
                  'border-red-500 bg-red-500/30'
                }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-studio-text-dim">{event.time}</span>
                  {event.status === 'danger' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                </div>
                <p className="text-xs text-studio-text-muted mt-0.5 leading-relaxed">{event.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Analysis */}
        <div className="p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40">
          <h3 className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-4 flex items-center gap-2">
            <Microscope className="w-3 h-3" /> Material Analysis
          </h3>
          <div className="space-y-3">
            {Object.entries(data.materialAnalysis).map(([key, val]) => (
              <div key={key}>
                <div className="text-[10px] font-bold text-studio-text-dim uppercase mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <p className="text-xs text-studio-text-muted p-2.5 bg-studio-surface/40 rounded-lg border border-studio-border/30 leading-relaxed">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Check */}
        <div className="p-5 bg-studio-canvas/60 rounded-xl border border-studio-border/40">
          <h3 className="text-[10px] font-bold text-studio-text-dim uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Compliance Check
          </h3>
          <div className="space-y-2.5">
            {data.compliance.map((c, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${c.status ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                {c.status ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                <div>
                  <div className="text-xs font-semibold text-studio-text-main">{c.standard}</div>
                  <div className="text-[10px] text-studio-text-dim">{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex items-center justify-between p-4 bg-studio-surface/40 rounded-xl border border-studio-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-studio-text-dim uppercase tracking-wider">Export Options</span>
          {exportDone && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 animate-fadeIn">
              <CheckCircle className="w-3 h-3" /> {exportDone} saved!
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {[
            { label: 'PDF', color: 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20' },
            { label: 'Excel', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' },
            { label: 'PowerPoint', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20' },
            { label: 'XML', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' },
          ].map(exp => (
            <button
              key={exp.label}
              onClick={() => handleExport(exp.label)}
              disabled={exporting !== null}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${exp.color}`}
            >
              {exporting === exp.label ? (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileDown className="w-3 h-3" />
              )}
              {exporting === exp.label ? 'Exporting...' : exp.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  REUSABLE SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════
const ParamInput = ({ label, unit, value, onChange, icon: Icon }) => (
  <div>
    <label className="text-[10px] font-bold text-studio-text-muted uppercase tracking-wider mb-1.5 block">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-3.5 h-3.5 text-studio-text-dim" />
        </div>
      )}
      <input
        type={unit ? 'number' : 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={unit ? `0` : '—'}
        className={`w-full bg-studio-surface/60 border border-studio-border/50 rounded-lg text-sm text-studio-text-main focus:border-studio-primary outline-none transition-colors ${Icon ? 'pl-9' : 'pl-3'} ${unit ? 'pr-14' : 'pr-3'} py-2.5`}
      />
      {unit && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-[10px] text-studio-text-dim font-mono">{unit}</span>
        </div>
      )}
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-[10px] font-bold text-studio-text-muted uppercase tracking-wider mb-1.5 block">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-studio-surface/60 border border-studio-border/50 rounded-lg p-2.5 text-sm text-studio-text-main focus:border-studio-primary outline-none transition-colors appearance-none cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const FileUploadField = ({ label, file, onFile, accept }) => (
  <div>
    <label className="text-[10px] font-bold text-studio-text-muted uppercase tracking-wider mb-1.5 block">{label}</label>
    <label className="flex items-center gap-2 p-2.5 bg-studio-surface/60 border border-studio-border/50 rounded-lg cursor-pointer hover:bg-studio-surface transition-colors">
      <Upload className="w-3.5 h-3.5 text-studio-text-dim shrink-0" />
      <span className="text-xs text-studio-text-muted truncate flex-1">
        {file ? file.name : 'Choose file...'}
      </span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => onFile(e.target.files?.[0] || null)}
      />
    </label>
  </div>
);

export default ForensicsLabPage;
