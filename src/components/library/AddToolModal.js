import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

const AddToolModal = ({ isOpen, onClose, onToolAdded }) => {
    const [name, setName] = useState('');
    const [toolType, setToolType] = useState('End Mill'); // Default
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        
        if (!name.trim()) {
            setError('Tool name is required.');
            return;
        }
        if (!file) {
            setError('Please select a tool file.');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            // --- NEW: Send the tool type ---
            formData.append('tool_type', toolType); 
            formData.append('file', file);

            await api.createTool(formData);
            onToolAdded();
            
            // Reset form
            setName('');
            setToolType('End Mill');
            setFile(null);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to upload tool.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Tool">
            <div className="space-y-4">
                {/* Tool Name */}
                <div>
                    <label htmlFor="tool-name" className="block text-sm font-medium text-gray-300">
                        Tool Name
                    </label>
                    <input
                        type="text"
                        id="tool-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., 10mm Carbide End Mill"
                        className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white px-3 py-2 outline-none"
                    />
                </div>

                {/* --- NEW: Tool Type Dropdown --- */}
                <div>
                    <label htmlFor="tool-type" className="block text-sm font-medium text-gray-300">
                        Tool Type
                    </label>
                    <select
                        id="tool-type"
                        value={toolType}
                        onChange={(e) => setToolType(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white px-3 py-2 outline-none"
                    >
                        <option value="End Mill">End Mill (Milling)</option>
                        <option value="Drill">Drill (Drilling)</option>
                        <option value="Ball Nose">Ball Nose (Milling)</option>
                        <option value="Turning Insert">Turning Insert (Turning)</option>
                        <option value="Other">Other</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Helps the simulation engine select the correct physics strategy.</p>
                </div>

                {/* File Upload */}
                <div>
                    <label htmlFor="tool-file" className="block text-sm font-medium text-gray-300 mb-1">
                        Tool Geometry File (.step, .iges, .stl)
                    </label>
                    <input
                        type="file"
                        id="tool-file"
                        onChange={(e) => setFile(e.target.files[0])}
                        accept=".stl,.step,.iges,.stp,.igs"
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-all cursor-pointer"
                    />
                </div>

                {error && <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

                <div className="flex justify-end space-x-3 pt-4">
                    <Button onClick={onClose} variant="secondary" disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="primary" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Add to Library'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddToolModal;