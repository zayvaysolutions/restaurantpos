import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Icons } from '../common/Icons';
import { Button } from '../common/Button';
import { Formatters } from '../../utils/Formatters';

// EXACTAMENTE IGUAL que en el original
const SalesModule = () => {
    const { products, cart, addToCart, removeFromCart, updateQuantity, getTotal, setShowPaymentModal } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const activeProducts = products.filter(p => !p.deleted);

    const filteredProducts = activeProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory && product.stock > 0;
    });

    const categories = ['all', ...new Set(activeProducts.map(p => p.category))];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="flex-1 relative">
                            <Icons.Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">Todas las categorías</option>
                            {categories.filter(c => c !== 'all').map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div className="product-grid">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 hover:border-orange-500 hover:shadow-lg transition text-left"
                            >
                                <div className="text-3xl sm:text-4xl mb-2">{product.emoji}</div>
                                <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-1">{product.name}</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-600 font-bold text-sm sm:text-base">{Formatters.currency(product.price)}</span>
                                    <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 sticky top-32">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Icons.ShoppingCart size={24} />
                        Carrito
                    </h2>

                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Carrito vacío</p>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{item.name}</h4>
                                        <p className="text-orange-600 font-bold text-sm">{Formatters.currency(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="touch-target p-1 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            <Icons.Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="touch-target p-1 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            <Icons.Plus size={16} />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="touch-target p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 ml-2"
                                        >
                                            <Icons.Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold">Total:</span>
                            <span className="text-2xl font-bold text-orange-600">{Formatters.currency(getTotal())}</span>
                        </div>

                        <Button
                            variant="primary"
                            fullWidth
                            disabled={cart.length === 0}
                            onClick={() => setShowPaymentModal(true)}
                            icon={<Icons.DollarSign size={20} />}
                        >
                            Procesar Pago
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesModule;