import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const SimulationCard = ({ simulation }) => {
    // 'input_parameters' comes from the new "smart" backend response
    const { id, name, status, created_at, input_parameters } = simulation;
    
    // Format the date
    const dateStr = new Date(created_at).toLocaleDateString() + ' ' + new Date(created_at).toLocaleTimeString();

    // Determine styles based on status
    const statusStyles = {
        COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/20',
        RUNNING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
        FAILED: 'bg-red-500/20 text-red-400 border-red-500/20',
        PENDING: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
    };
    const statusClass = statusStyles[status] || statusStyles.PENDING;

    // --- NEW: Determine Physics Strategy Label ---
    const machType = input_parameters?.machining_type || 'turning';
    const typeLabel = machType === 'milling' ? 'R&D Milling' : 'Legacy Turning';
    const typeColor = machType === 'milling' ? 'text-indigo-400' : 'text-orange-400';

    return (
        <Card className="flex flex-col justify-between h-full hover:border-indigo-500/30 transition-colors">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-white line-clamp-1" title={name}>{name}</h3>
                        
                        {/* --- NEW: Show Physics Strategy --- */}
                        <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${typeColor}`}>
                            {typeLabel}
                        </p>
                    </div>
                    
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${statusClass}`}>
                        {status}
                    </span>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">Run Date: {dateStr}</p>
            </div>
            
            <div className="mt-6 flex gap-3">
                <Link to={`/simulations/${id}`} className="flex-1">
                    <Button variant="primary" className="w-full text-sm py-2">
                        View Results
                    </Button>
                </Link>
                {/* Optional: Add a 'Delete' button here if desired */}
            </div>
        </Card>
    );
};

export default SimulationCard;