import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const DeleteUserModal = ({ isOpen, onClose, onUserDeleted, user }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setError('');
        setIsLoading(true);

        try {
            await api.adminDeleteUser(user.id);
            onUserDeleted(); // Refresh the list
            onClose();       // Close modal
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete user.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete User">
            <div className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> {error}
                    </div>
                )}

                <p className="text-gray-300">
                    Are you sure you want to permanently delete the user <strong className="text-white">{user?.email}</strong>?
                </p>
                <p className="text-yellow-400 bg-yellow-500/10 p-3 rounded-lg text-sm">
                    This action is irreversible. All associated simulations, tools, and materials for this user will also be affected.
                </p>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" type="button" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Yes, Delete User
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteUserModal;