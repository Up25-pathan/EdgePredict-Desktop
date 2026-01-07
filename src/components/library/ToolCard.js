import React from 'react';
import { Trash2, Download, Box, Circle, PenTool, Layers } from 'lucide-react';
import api from '../../services/api';

const ToolCard = ({ tool, onDelete }) => {
    
    // --- 1. Smart Icon Selection ---
    const getToolIcon = (type) => {
        switch(type) {
            case 'Drill': return <PenTool className="w-6 h-6 text-emerald-400" />;
            case 'End Mill': return <Box className="w-6 h-6 text-blue-400" />;
            case 'Turning Insert': return <Circle className="w-6 h-6 text-orange-400" />;
            default: return <Layers className="w-6 h-6 text-indigo-400" />;
        }
    };

    // --- 2. Smart Color Coding ---
    const getTypeColor = (type) => {
        switch(type) {
            case 'Drill': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'End Mill': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            case 'Turning Insert': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
            default: return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
        }
    };

    // --- 3. File Format Extraction ---
    const getFileFormat = (path) => {
        if (!path) return 'UNKNOWN';
        const ext = path.split('.').pop().toUpperCase();
        return ext;
    };
    
    const format = getFileFormat(tool.file_path);

    // --- 4. Handle Download ---
    const handleDownload = async () => {
        try {
            const response = await api.getToolFileById(tool.id);
            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', tool.file_path.split('/').pop() || `tool_${tool.id}.${format.toLowerCase()}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed:", error);
            alert("Could not download tool file.");
        }
    };

    return (
        <div className="group relative flex flex-col justify-between bg-gray-900/40 backdrop-blur-sm border border-gray-800 hover:border-indigo-500/40 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
            
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                    {/* Icon Box */}
                    <div className={`p-3 rounded-lg border ${getTypeColor(tool.tool_type)} bg-opacity-5`}>
                        {getToolIcon(tool.tool_type)}
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight line-clamp-1" title={tool.name}>
                            {tool.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            {/* Tool Type Badge */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeColor(tool.tool_type)}`}>
                                {tool.tool_type || "OTHER"}
                            </span>
                            {/* Format Badge */}
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-gray-800 border-gray-700 text-gray-400">
                                {format}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details / Footer */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Asset ID</span>
                    <span className="text-sm font-mono text-gray-300">#{tool.id.toString().padStart(4, '0')}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button 
                        onClick={handleDownload}
                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title="Download Geometry"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(tool.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Tool"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            {/* Decorative Status Dot */}
            <div className="absolute top-5 right-5">
                 <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            </div>
        </div>
    );
};

export default ToolCard;