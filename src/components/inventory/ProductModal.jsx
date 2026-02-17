import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Icons } from '../common/Icons';
import { Button } from '../common/Button';
import { CONFIG } from '../../constants/config';

// EXACTAMENTE IGUAL que en el original
const ProductModal = ({ isOpen, onClose, product }) => {
    const { products, setProducts, categories } = useContext(AppContext);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: categories[0] || '',
        emoji: '🍽️'
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price,
                stock: product.stock,
                category: product.category,
                emoji: product.emoji
            });
        } else {
            setFormData({
                name: '',
                price: '',
                stock: '',
                category: categories[0] || '',
                emoji: '🍽️'
            });
        }
    }, [product, categories]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (product) {
            setProducts(products.map(p =>
                p.id === product.id
                    ? { ...p, ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) }
                    : p
            ));
        } else {
            const newProduct = {
                id: Date.now(),
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                deleted: false
            };
            setProducts([...products, newProduct]);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 modal-overlay">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl modal-content">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                        <button onClick={onClose} className="touch-target p-2 hover:bg-gray-100 rounded-lg">
                            <Icons.X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Emoji del Producto</label>
                            <div className="mb-3 text-center">
                                <span className="text-6xl">{formData.emoji}</span>
                            </div>
                            <div className="emoji-grid max-h-48 overflow-y-auto border rounded-lg p-2">
                                {CONFIG.PRODUCT_EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, emoji })}
                                        className={`emoji-button ${formData.emoji === emoji ? 'selected' : ''}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre del Producto</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Precio</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Stock</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Categoría</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="success" fullWidth icon={<Icons.Check size={20} />}>
                                {product ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;