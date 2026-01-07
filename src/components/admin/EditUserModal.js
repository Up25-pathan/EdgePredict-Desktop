import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const EditUserModal = ({ isOpen, onClose, onUserUpdated, user }) => {
    const [subscriptionExpiry, setSubscriptionExpiry] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            // Pre-fill the form with the user's current data
            setSubscriptionExpiry(user.subscription_expiry ? user.subscription_expiry.split('T')[0] : '');
            setIsAdmin(user.is_admin);
        } else {
            // Reset form when no user is selected or modal is closed
            setSubscriptionExpiry('');
            setIsAdmin(false);
        }
        setError('');
        setSuccess('');
    }, [user, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const updateData = {
                // If date is empty string, set it to null
                subscription_expiry: subscriptionExpiry ? new Date(subscriptionExpiry).toISOString() : null,
                is_admin: isAdmin
            };

            await api.adminUpdateUser(user.id, updateData);
            setSuccess('User updated successfully!');
            setTimeout(() => {
                onUserUpdated(); // Refresh the list
                onClose();       // Close modal
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update user.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${user?.email}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 rounded text-emerald-400 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" /> {success}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Subscription Expiry Date</label>
                    <input
                        type="date"
                        value={subscriptionExpiry}
                        onChange={(e) => setSubscriptionExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank for an unlimited (non-expiring) subscription.</p>
                </div>

                <div className="flex items-center mt-4">
                    <input
                        type="checkbox"
                        id="editIsAdmin"
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500"
                        disabled={user?.email === 'admin@edgepredict.com'} // Safety check
                    />
                    <label htmlFor="editIsAdmin" className="ml-2 text-sm text-gray-300">
                        Grant Admin Privileges
                    </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserModal;