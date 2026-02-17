import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const SettingsModule = () => {
    const { 
        businessName, setBusinessName,
        categories, setCategories
    } = useContext(AppContext);

    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (cat) => {
        if (window.confirm(`¿Eliminar la categoría "${cat}"?`)) {
            setCategories(categories.filter(c => c !== cat));
        }
    };

    return (
        <div className="p-4">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-2xl font-bold mb-4">Configuración del Negocio</h2>
                
                <div className="mb-4">
                    <label className="block mb-2 font-medium">Nombre del Negocio</label>
                    <input
                        type="text"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Categorías de Productos</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-orange-500"
                            placeholder="Nueva categoría"
                        />
                        <button 
                            onClick={handleAddCategory}
                            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                        >
                            Agregar
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(c => (
                            <span key={c} className="bg-gray-100 px-3 py-1 rounded flex items-center gap-2">
                                {c}
                                <button 
                                    onClick={() => handleRemoveCategory(c)} 
                                    className="text-red-600 hover:text-red-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        {categories.length === 0 && (
                            <p className="text-gray-500">No hay categorías. Agrega una.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModule;