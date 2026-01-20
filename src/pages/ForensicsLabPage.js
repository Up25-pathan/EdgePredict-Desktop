import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForensicsLabPage = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [specimenData, setSpecimenData] = useState({
    toolId: '',
    toolType: 'End Mill',
    material: 'Carbide',
    operationTime: '' // e.g., "45 mins"
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSpecimenData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setResults(null);
      setIsSaved(false);
    }
  };

  const startAnalysis = () => {
    if (!selectedImage || !specimenData.toolId) return;

    setIsAnalyzing(true);
    
    // Simulate AI Processing
    setTimeout(() => {
      setIsAnalyzing(false);
      setResults({
        timestamp: new Date().toISOString(),
        wearType: "Flank Wear (VB)",
        severity: "Critical",
        wearValue: "0.45 mm",
        confidence: "98.2%",
        recommendation: "Replace tool immediately. Surface finish risk detected."
      });
    }, 2500);
  };

  const saveReport = () => {
    setIsSaved(true);
    // In a real app, you would POST this to your API
    console.log("Saving Report:", { ...specimenData, ...results });
    
    // Optional: Auto-redirect to reports after save
    // navigate('/reports'); 
  };

  return (
    <div className="h-full flex flex-col bg-hud-surface text-gray-100 p-6 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Forensics Lab</h1>
          <p className="text-gray-400 text-sm mt-1">Defect Analysis & Tool Metrology</p>
        </div>
        <div className="flex gap-4 text-xs font-mono text-gray-500">
          <div>STATION: <span className="text-indigo-400">LAB-01</span></div>
          <div>ENGINE: <span className="text-green-400">ONLINE</span></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* === LEFT COLUMN: INPUTS & IMAGE (8 Cols) === */}
        <div className="col-span-8 flex flex-col gap-4 h-full min-h-0">
          
          {/* 1. SPECIMEN FORM (The New Part) */}
          <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700 flex gap-4 items-end">
            <div className="flex-1">
               <label className="block text-xs font-bold text-gray-400 mb-1">TOOL ID / SERIAL</label>
               <input 
                 type="text" 
                 name="toolId"
                 value={specimenData.toolId}
                 onChange={handleInputChange}
                 placeholder="e.g. EM-2024-X12"
                 className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
               />
            </div>
            <div className="w-40">
               <label className="block text-xs font-bold text-gray-400 mb-1">TOOL TYPE</label>
               <select 
                 name="toolType"
                 value={specimenData.toolType}
                 onChange={handleInputChange}
                 className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
               >
                 <option>End Mill</option>
                 <option>Drill Bit</option>
                 <option>Turning Insert</option>
                 <option>Face Mill</option>
               </select>
            </div>
             <div className="w-40">
               <label className="block text-xs font-bold text-gray-400 mb-1">MATERIAL</label>
               <select 
                 name="material"
                 value={specimenData.material}
                 onChange={handleInputChange}
                 className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
               >
                 <option>Carbide</option>
                 <option>HSS</option>
                 <option>Ceramic</option>
                 <option>Diamond (PCD)</option>
               </select>
            </div>
          </div>

          {/* 2. IMAGE STAGE */}
          <div className="flex-1 min-h-0 bg-gray-900/50 rounded-xl border border-gray-700 relative overflow-hidden group flex items-center justify-center">
             {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-10 z-0" 
                 style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {selectedImage ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black z-10">
                <img 
                  src={selectedImage} 
                  alt="Specimen" 
                  className={`max-w-full max-h-full object-contain ${isAnalyzing ? 'opacity-50' : 'opacity-100'}`} 
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 z-20 border-b-2 border-cyan-500 animate-scan pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent"></div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 z-10">
                <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-sm uppercase tracking-wider">Awaiting Specimen Image</p>
              </div>
            )}
          </div>

          {/* 3. ACTION BAR */}
          <div className="h-16 shrink-0 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center px-4 justify-between z-20">
            <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all border border-gray-600 text-sm">
                <span>Upload Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>

            <button 
              onClick={startAnalysis}
              disabled={!selectedImage || !specimenData.toolId || isAnalyzing}
              className={`px-6 py-2 rounded-md font-bold text-sm tracking-wide transition-all shadow-lg flex items-center gap-2
                ${(!selectedImage || !specimenData.toolId)
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : isAnalyzing 
                    ? 'bg-amber-600/20 text-amber-500 border border-amber-500/50 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                }`}
            >
              {isAnalyzing ? 'PROCESSING...' : 'RUN DIAGNOSTICS'}
            </button>
          </div>
        </div>

        {/* === RIGHT COLUMN: RESULTS (4 Cols) === */}
        <div className="col-span-4 flex flex-col gap-4 h-full min-h-0">
          
          <div className="flex-1 bg-gray-900/50 border border-gray-700 p-5 rounded-xl flex flex-col relative overflow-hidden min-h-0">
            {!results ? (
               <div className="flex-1 flex items-center justify-center text-gray-600 text-sm italic">
                 {specimenData.toolId ? `Ready to analyze ${specimenData.toolId}` : "Enter tool details to begin"}
               </div>
            ) : (
               <div className="space-y-6 overflow-y-auto pr-2 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                 
                 {/* Specimen Info Block */}
                 <div className="bg-gray-800/50 p-3 rounded border border-gray-600/50">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>SPECIMEN ID</span>
                        <span>{new Date(results.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-white">{specimenData.toolId}</div>
                    <div className="text-xs text-indigo-400">{specimenData.toolType} • {specimenData.material}</div>
                 </div>

                 {/* Defect Block */}
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold">Detected Defect</label>
                    <div className="text-2xl font-bold text-white mt-1 border-l-4 border-indigo-500 pl-3">
                      {results.wearType}
                    </div>
                 </div>

                 {/* Metrics */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                       <label className="text-[10px] text-gray-400 uppercase">Wear Value</label>
                       <div className="text-xl font-mono text-cyan-400">{results.wearValue}</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                       <label className="text-[10px] text-gray-400 uppercase">Confidence</label>
                       <div className="text-xl font-mono text-green-400">{results.confidence}</div>
                    </div>
                 </div>

                 {/* Save Button (Pushes to bottom) */}
                 <div className="mt-auto pt-6">
                    <button 
                        onClick={saveReport}
                        disabled={isSaved}
                        className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2
                        ${isSaved 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                    >
                        {isSaved ? (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                SAVED TO REPORTS
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                SAVE REPORT
                            </>
                        )}
                    </button>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
        .animate-scan { animation: scan 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default ForensicsLabPage;