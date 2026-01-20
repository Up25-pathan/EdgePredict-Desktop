import React, { useState } from 'react';

// --- ICONS (Defined locally to prevent "Module Not Found" errors) ---
const ReportIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChipIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const DownloadIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
  </svg>
);


const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('simulations'); // 'simulations' or 'ai'

  // --- MOCK DATA FOR DEMO ---
  const simulationReports = [
    { id: 'SIM-001', name: 'Ti-6Al-4V High Speed Milling', date: '2024-03-10', status: 'Completed', type: 'Thermal' },
    { id: 'SIM-002', name: 'Inconel 718 Drill Test', date: '2024-03-12', status: 'Failed', type: 'Mechanical' },
  ];

  const aiReports = [
    { id: 'RPT-AI-882', toolId: 'EM-2024-X12', defect: 'Flank Wear (VB)', severity: 'Critical', date: '2024-03-14 10:42 AM', confidence: '98.2%' },
    { id: 'RPT-AI-883', toolId: 'DR-HSS-05', defect: 'Chipping', severity: 'Moderate', date: '2024-03-14 11:15 AM', confidence: '94.1%' },
  ];

  return (
    <div className="h-full flex flex-col bg-hud-surface p-6 text-gray-100">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports Library</h1>
          <p className="text-gray-400 text-sm mt-1">Access detailed records of simulations and AI inspections.</p>
        </div>
        
        {/* --- TAB SWITCHER --- */}
        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button 
                onClick={() => setActiveTab('simulations')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                ${activeTab === 'simulations' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <ReportIcon className="w-4 h-4" /> 
                Simulation Reports
            </button>
            <button 
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <ChipIcon className="w-4 h-4" /> 
                AI Inspection Reports
            </button>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
            <div className="absolute left-3 top-2.5 text-gray-500">
               <SearchIcon className="w-5 h-5" />
            </div>
            <input 
                type="text" 
                placeholder={activeTab === 'simulations' ? "Search by Simulation Name or ID..." : "Search by Tool ID or Defect Type..."}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
        </div>
        <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 flex items-center gap-2">
            <FilterIcon className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* --- CONTENT TABLE --- */}
      <div className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800/80 text-xs uppercase text-gray-400 font-semibold tracking-wider">
                <tr>
                    {activeTab === 'simulations' ? (
                        <>
                            <th className="p-4 border-b border-gray-700">Report ID</th>
                            <th className="p-4 border-b border-gray-700">Simulation Name</th>
                            <th className="p-4 border-b border-gray-700">Type</th>
                            <th className="p-4 border-b border-gray-700">Date</th>
                            <th className="p-4 border-b border-gray-700">Status</th>
                            <th className="p-4 border-b border-gray-700 text-right">Actions</th>
                        </>
                    ) : (
                        <>
                            <th className="p-4 border-b border-gray-700">Report ID</th>
                            <th className="p-4 border-b border-gray-700">Tool ID</th>
                            <th className="p-4 border-b border-gray-700">Defect Detected</th>
                            <th className="p-4 border-b border-gray-700">Severity</th>
                            <th className="p-4 border-b border-gray-700">Analysis Date</th>
                            <th className="p-4 border-b border-gray-700 text-right">Actions</th>
                        </>
                    )}
                </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-800">
                {activeTab === 'simulations' ? (
                    // SIMULATION ROWS
                    simulationReports.map(report => (
                        <tr key={report.id} className="hover:bg-gray-800/50 transition-colors">
                            <td className="p-4 font-mono text-gray-400">{report.id}</td>
                            <td className="p-4 font-bold text-white">{report.name}</td>
                            <td className="p-4 text-gray-300">{report.type}</td>
                            <td className="p-4 text-gray-400">{report.date}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${report.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {report.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-wide">View Report</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    // AI LAB ROWS
                    aiReports.map(report => (
                        <tr key={report.id} className="hover:bg-gray-800/50 transition-colors">
                            <td className="p-4 font-mono text-gray-400">{report.id}</td>
                            <td className="p-4 font-bold text-white">{report.toolId}</td>
                            <td className="p-4 text-indigo-300 font-medium">{report.defect}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold border 
                                    ${report.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                                    : report.severity === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                                    : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                                    {report.severity.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-4 text-gray-400">{report.date}</td>
                            <td className="p-4 text-right flex justify-end gap-3">
                                <button title="Download PDF" className="p-1 text-gray-400 hover:text-white"><DownloadIcon className="w-4 h-4"/></button>
                                <button className="text-cyan-400 hover:text-cyan-300 text-xs font-bold uppercase tracking-wide">Open Analysis</button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;