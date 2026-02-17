import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Icons } from '../common/Icons';
import { Button } from '../common/Button';

// EXACTAMENTE IGUAL que en el original
const UserModal = ({ isOpen, onClose, user }) => {
    const { users, addUser, updateUser } = useContext(AppContext);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'cashier'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                password: user.password,
                name: user.name,
                role: user.role
            });
        } else {
            setFormData({
                username: '',
                password: '',
                name: '',
                role: 'cashier'
            });
        }
    }, [user]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password || !formData.name) {
            alert('Todos los campos son obligatorios');
            return;
        }

        if (!user && users.some(u => u.username === formData.username)) {
            alert('El nombre de usuario ya existe');
            return;
        }

        try {
            if (user) {
                await updateUser(user.id, { ...formData });
            } else {
                await addUser({ ...formData });
            }
            onClose();
        } catch (error) {
            alert('Error al guardar usuario: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 modal-overlay">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md modal-content">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <button onClick={onClose} className="touch-target p-2 hover:bg-gray-100 rounded-lg">
                            <Icons.X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre de Usuario</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Rol</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            >
                                <option value="cashier">Cajero</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="success" fullWidth icon={<Icons.Check size={20} />}>
                                {user ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserModal;