import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import { Icons } from '../common/Icons';
import { Button } from '../common/Button';
import { CONFIG } from '../../constants/config';
import UserModal from './UserModal';

// EXACTAMENTE IGUAL que en el original
const SettingsModule = () => {
    const { 
        businessName, setBusinessName, 
        businessLogo, setBusinessLogo,
        logoType, setLogoType,
        categories, addCategory, removeCategory,
        products, updateProduct,
        users,
        deleteUser,
        currentUser,
        exportData, importData
    } = useContext(AppContext);

    const [newCategory, setNewCategory] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const fileInputRef = useRef(null);

    const handleAddCategory = async () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            try {
                await addCategory(newCategory.trim());
                setNewCategory('');
            } catch (error) {
                alert('Error al agregar categoría: ' + error.message);
            }
        }
    };

    const handleRemoveCategory = async (category) => {
        if (confirm(`¿Eliminar la categoría "${category}"?`)) {
            const productsInCategory = products.filter(p => p.category === category);
            
            if (productsInCategory.length > 0) {
                const defaultCategory = categories.filter(c => c !== category)[0] || 'Sin Categoría';
                if (confirm(`Hay ${productsInCategory.length} producto(s) en esta categoría. Se moverán a "${defaultCategory}". ¿Continuar?`)) {
                    try {
                        for (const p of productsInCategory) {
                            await updateProduct(p.id, { ...p, category: defaultCategory });
                        }
                        await removeCategory(category);
                    } catch (error) {
                        alert('Error al eliminar categoría: ' + error.message);
                    }
                }
            } else {
                try {
                    await removeCategory(category);
                } catch (error) {
                    alert('Error al eliminar categoría: ' + error.message);
                }
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === currentUser?.id) {
            alert('No puedes eliminar tu propio usuario');
            return;
        }

        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await deleteUser(userId);
            } catch (error) {
                alert('Error al eliminar usuario: ' + error.message);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Configuración del Negocio</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nombre del Negocio</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Logo del Negocio</label>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setLogoType('emoji')}
                                className={`px-4 py-2 rounded-lg border-2 ${logoType === 'emoji' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}
                            >
                                Emoji
                            </button>
                            <button
                                onClick={() => setLogoType('image')}
                                className={`px-4 py-2 rounded-lg border-2 ${logoType === 'image' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}
                            >
                                Imagen
                            </button>
                        </div>

                        {logoType === 'emoji' ? (
                            <div>
                                <div className="text-center mb-3">
                                    <span className="text-6xl">{businessLogo}</span>
                                </div>
                                <div className="emoji-grid max-h-48 overflow-y-auto border rounded-lg p-2">
                                    {CONFIG.PRODUCT_EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setBusinessLogo(emoji)}
                                            className={`emoji-button ${businessLogo === emoji ? 'selected' : ''}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    value={businessLogo}
                                    onChange={(e) => setBusinessLogo(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="URL de la imagen"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Categorías de Productos</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCategory();
                                    }
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Nueva categoría"
                            />
                            <Button onClick={handleAddCategory} icon={<Icons.Plus size={20} />}>
                                Agregar
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <div key={category} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                                    <span>{category}</span>
                                    <button
                                        onClick={() => handleRemoveCategory(category)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Icons.X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">Administración de Usuarios</h2>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingUser(null);
                            setShowUserModal(true);
                        }}
                        icon={<Icons.User size={20} />}
                    >
                        Nuevo Usuario
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-2">Usuario</th>
                                <th className="text-left py-3 px-2">Nombre</th>
                                <th className="text-left py-3 px-2">Rol</th>
                                <th className="text-center py-3 px-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-2 font-medium">{user.username}</td>
                                    <td className="py-3 px-2">{user.name}</td>
                                    <td className="py-3 px-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            user.role === 'admin' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Cajero'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setShowUserModal(true);
                                                }}
                                                className="touch-target p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                                title="Editar Usuario"
                                            >
                                                <Icons.Edit size={16} />
                                            </button>
                                            {user.id !== currentUser?.id && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="touch-target p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                    title="Eliminar Usuario"
                                                >
                                                    <Icons.Trash size={16} />
                                                </button>
                                            )}
                                                </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Respaldo de Datos</h2>

                <div className="space-y-4">
                    <Button
                        variant="info"
                        onClick={exportData}
                        icon={<Icons.Download size={20} />}
                        fullWidth
                    >
                        Exportar Datos
                    </Button>

                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={importData}
                            className="hidden"
                        />
                        <Button
                            variant="warning"
                            onClick={() => fileInputRef.current?.click()}
                            icon={<Icons.Upload size={20} />}
                            fullWidth
                        >
                            Importar Datos
                        </Button>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        ⚠️ <strong>Importante:</strong> Los datos se guardan automáticamente en el navegador (localStorage). 
                        Realiza copias de seguridad regularmente exportando los datos.
                    </div>
                </div>
            </div>

            <UserModal
                isOpen={showUserModal}
                onClose={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                }}
                user={editingUser}
            />
        </div>
    );
};

export default SettingsModule;