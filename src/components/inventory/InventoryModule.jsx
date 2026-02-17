import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const InventoryModule = () => {
    const { products, setProducts } = useContext(AppContext);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: '', stock: '' });

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({ name: product.name, price: product.price, stock: product.stock });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar producto?')) {
            setProducts(products.map(p => p.id === id ? { ...p, deleted: true } : p));
        }
    };

    const handleSave = () => {
        if (editingId) {
            setProducts(products.map(p => 
                p.id === editingId ? { ...p, ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) } : p
            ));
        } else {
            setProducts([...products, {
                id: Date.now(),
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                emoji: '📦',
                category: 'General',
                deleted: false
            }]);
        }
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', price: '', stock: '' });
    };

    const activeProducts = products.filter(p => !p.deleted);

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">Inventario</h2>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', price: '', stock: '' });
                        setShowForm(true);
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded"
                >
                    + Nuevo
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">
                            {editingId ? 'Editar' : 'Nuevo'} Producto
                        </h3>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full p-2 border mb-2 rounded"
                        />
                        <input
                            type="number"
                            placeholder="Precio"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            className="w-full p-2 border mb-2 rounded"
                        />
                        <input
                            type="number"
                            placeholder="Stock"
                            value={formData.stock}
                            onChange={e => setFormData({...formData, stock: e.target.value})}
                            className="w-full p-2 border mb-2 rounded"
                        />
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="flex-1 bg-green-500 text-white p-2 rounded">
                                Guardar
                            </button>
                            <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-500 text-white p-2 rounded">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">Nombre</th>
                        <th className="text-right">Precio</th>
                        <th className="text-right">Stock</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {activeProducts.map(p => (
                        <tr key={p.id} className="border-b">
                            <td className="py-2">{p.name}</td>
                            <td className="text-right">${p.price}</td>
                            <td className="text-right">{p.stock}</td>
                            <td className="text-center">
                                <button onClick={() => handleEdit(p)} className="text-blue-600 mr-2">✏️</button>
                                <button onClick={() => handleDelete(p.id)} className="text-red-600">🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryModule;