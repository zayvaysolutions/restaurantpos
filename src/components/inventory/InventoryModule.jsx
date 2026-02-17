import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Icons } from '../common/Icons';
import { Button } from '../common/Button';
import { Formatters } from '../../utils/Formatters';
import ProductModal from './ProductModal';

// EXACTAMENTE IGUAL que en el original
const InventoryModule = () => {
    const { products, categories, deleteProduct, restoreProduct } = useContext(AppContext);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeletedProducts, setShowDeletedProducts] = useState(false);

    const handleDeleteProduct = async (productId) => {
        if (confirm('¿Estás seguro de que deseas eliminar este producto? El producto se marcará como eliminado pero no se perderá el registro.')) {
            try {
                await deleteProduct(productId);
            } catch (error) {
                alert('Error al eliminar el producto: ' + error.message);
            }
        }
    };

    const handleRestoreProduct = async (productId) => {
        if (confirm('¿Deseas restaurar este producto?')) {
            try {
                await restoreProduct(productId);
            } catch (error) {
                alert('Error al restaurar el producto: ' + error.message);
            }
        }
    };

    const handlePermanentDelete = async (productId) => {
        if (confirm('⚠️ ADVERTENCIA: Esto eliminará permanentemente el producto. Esta acción no se puede deshacer. ¿Continuar?')) {
            try {
                await deleteProduct(productId);
            } catch (error) {
                alert('Error al eliminar el producto: ' + error.message);
            }
        }
    };

    const displayProducts = showDeletedProducts 
        ? products.filter(p => p.deleted) 
        : products.filter(p => !p.deleted);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">Gestión de Inventario</h2>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={showDeletedProducts ? "secondary" : "info"}
                            onClick={() => setShowDeletedProducts(!showDeletedProducts)}
                            icon={<Icons.Archive size={20} />}
                        >
                            {showDeletedProducts ? 'Ver Activos' : 'Ver Eliminados'}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setEditingProduct(null);
                                setShowProductModal(true);
                            }}
                            icon={<Icons.Plus size={20} />}
                        >
                            Nuevo Producto
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-2">Producto</th>
                                <th className="text-left py-3 px-2">Categoría</th>
                                <th className="text-right py-3 px-2">Precio</th>
                                <th className="text-right py-3 px-2">Stock</th>
                                <th className="text-center py-3 px-2">Estado</th>
                                <th className="text-center py-3 px-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        {showDeletedProducts ? 'No hay productos eliminados' : 'No hay productos'}
                                    </td>
                                </tr>
                            ) : (
                                displayProducts.map(product => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{product.emoji}</span>
                                                <span className="font-medium">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">{product.category}</td>
                                        <td className="py-3 px-2 text-right font-semibold">{Formatters.currency(product.price)}</td>
                                        <td className="py-3 px-2 text-right">
                                            <span className={product.stock < 5 ? 'text-red-600 font-semibold' : ''}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            {product.deleted ? (
                                                <span className="badge-deleted">Eliminado</span>
                                            ) : (
                                                <span className="badge-active">Activo</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="flex justify-center gap-2">
                                                {!product.deleted ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingProduct(product);
                                                                setShowProductModal(true);
                                                            }}
                                                            className="touch-target p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                                            title="Editar"
                                                        >
                                                            <Icons.Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="touch-target p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                            title="Eliminar"
                                                        >
                                                            <Icons.Trash size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleRestoreProduct(product.id)}
                                                            className="touch-target p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                                            title="Restaurar"
                                                        >
                                                            <Icons.RefreshCw size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePermanentDelete(product.id)}
                                                            className="touch-target p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                            title="Eliminar Permanentemente"
                                                        >
                                                            <Icons.X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductModal
                isOpen={showProductModal}
                onClose={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
            />
        </div>
    );
};

export default InventoryModule;