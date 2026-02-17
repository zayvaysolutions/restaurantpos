import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const SettingsModule = () => {
    const { businessName, setBusinessName, categories, setCategories } = useContext(AppContext);
    const [newCat, setNewCat] = useState('');

    const addCategory = () => {
        if (newCat.trim() && !categories.includes(newCat.trim())) {
            setCategories([...categories, newCat.trim()]);
            setNewCat('');
        }
    };

    const removeCategory = (cat) => {
        if (window.confirm(`¿Eliminar ${cat}?`)) {
            setCategories(categories.filter(c => c !== cat));
        }
    };

    return (
        <div className="p-4">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-2xl font-bold mb-4">Configuración</h2>
                
                <div className="mb-4">
                    <label className="block mb-2">Nombre del Negocio</label>
                    <input
                        type="text"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block mb-2">Categorías</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                            className="flex-1 p-2 border rounded"
                            placeholder="Nueva categoría"
                        />
                        <button onClick={addCategory} className="bg-orange-500 text-white px-4 py-2 rounded">
                            Agregar
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(c => (
                            <span key={c} className="bg-gray-100 px-3 py-1 rounded flex items-center gap-2">
                                {c}
                                <button onClick={() => removeCategory(c)} className="text-red-600">×</button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModule;