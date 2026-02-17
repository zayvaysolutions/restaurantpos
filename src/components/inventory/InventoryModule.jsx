import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Formatters } from '../../utils/Formatters';

const InventoryModule = () => {
    const { products, setProducts, categories } = useContext(AppContext);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            setProducts(products.map(p => 
                p.id === id ? { ...p, deleted: true } : p
            ));
        }
    };

    const handleSave = (productData) => {
        if (editingProduct) {
            // Editar existente
            setProducts(products.map(p => 
                p.id === editingProduct.id ? { ...p, ...productData } : p
            ));
        } else {
            // Crear nuevo
            const newProduct = {
                id: Date.now(),
                ...productData,
                deleted: false
            };
            setProducts([...products, newProduct]);
        }
        setShowModal(false);
        setEditingProduct(null);
    };

    const activeProducts = products.filter(p => !p.deleted);

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">Inventario</h2>
                <button 
                    onClick={() => {
                        setEditingProduct(null);
                        setShowModal(true);
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                    + Nuevo Producto
                </button>
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">Producto</th>
                        <th className="text-left">Categoría</th>
                        <th className="text-right">Precio</th>
                        <th className="text-right">Stock</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {activeProducts.map(p => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="py-2">
                                <span className="text-2xl mr-2">{p.emoji || '📦'}</span>
                                {p.name}
                            </td>
                            <td>{p.category}</td>
                            <td className="text-right">{Formatters.currency(p.price)}</td>
                            <td className="text-right">{p.stock}</td>
                            <td className="text-center">
                                <button 
                                    onClick={() => {
                                        setEditingProduct(p);
                                        setShowModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 mr-2"
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button 
                                    onClick={() => handleDelete(p.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Eliminar"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                    {activeProducts.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center py-4 text-gray-500">
                                No hay productos. ¡Agrega uno!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showModal && (
                <ProductModal 
                    product={editingProduct}
                    categories={categories}
                    onSave={handleSave}
                    onClose={() => {
                        setShowModal(false);
                        setEditingProduct(null);
                    }}
                />
            )}
        </div>
    );
};

const ProductModal = ({ product, categories, onSave, onClose }) => {
    const [formData, setFormData] = useState(
        product || {
            name: '',
            price: '',
            stock: '',
            category: categories?.[0] || 'General',
            emoji: '📦'
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            price: parseFloat(formData.price) || 0,
            stock: parseInt(formData.stock) || 0
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-w-lg">
                <h3 className="text-xl font-bold mb-4">
                    {product ? 'Editar' : 'Nuevo'} Producto
                </h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-2 border mb-2 rounded"
                        required
                    />
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Precio"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full p-2 border mb-2 rounded"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Stock"
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: e.target.value})}
                        className="w-full p-2 border mb-2 rounded"
                        required
                    />
                    <select
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full p-2 border mb-2 rounded"
                    >
                        {categories?.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <div className="flex gap-2 mt-4">
                        <button 
                            type="submit" 
                            className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
                        >
                            Guardar
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryModule;