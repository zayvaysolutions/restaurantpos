import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Icons } from '../common/Icons';
import { Button } from '../common/Button';
import { Formatters } from '../../utils/Formatters';

// EXACTAMENTE IGUAL que en el original
const ReportsModule = () => {
    const { sales, products, currentUser, cancelSale, updateProduct } = useContext(AppContext);
    const [dateFilter, setDateFilter] = useState('today');
    const [showCancelled, setShowCancelled] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSaleDetails, setShowSaleDetails] = useState(false);

    const filterSales = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return sales.filter(sale => {
            if (sale.deleted) return false;
            
            if (!showCancelled && sale.cancelled) return false;
            
            const saleDate = new Date(sale.date);
            switch (dateFilter) {
                case 'today':
                    return saleDate >= today;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return saleDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return saleDate >= monthAgo;
                default:
                    return true;
            }
        });
    };

    const filteredSales = filterSales();
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;

    const handleCancelSale = (sale) => {
        setSelectedSale(sale);
        setShowCancelModal(true);
    };

    const confirmCancelSale = async () => {
        if (selectedSale) {
            try {
                const cancellationData = {
                    cancelledAt: new Date().toISOString(),
                    cancelledBy: currentUser?.name,
                    cancellationReason: 'Anulación manual',
                    originalTotal: selectedSale.total,
                    cancelledTotal: 0
                };

                await cancelSale(selectedSale.id, cancellationData);

                for (const item of selectedSale.items) {
                    const product = products.find(p => p.id === item.id);
                    if (product) {
                        await updateProduct(item.id, {
                            ...product,
                            stock: product.stock + item.quantity
                        });
                    }
                }

                alert('Venta anulada exitosamente. El stock ha sido restaurado.');
                setShowCancelModal(false);
                setSelectedSale(null);
            } catch (error) {
                alert('Error al anular la venta: ' + error.message);
            }
        }
    };

    const handleViewDetails = (sale) => {
        setSelectedSale(sale);
        setShowSaleDetails(true);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">Reportes de Ventas</h2>
                    <div className="flex gap-2">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="today">Hoy</option>
                            <option value="week">Última Semana</option>
                            <option value="month">Último Mes</option>
                            <option value="all">Todo</option>
                        </select>
                        <button
                            onClick={() => setShowCancelled(!showCancelled)}
                            className={`px-4 py-2 rounded-lg border-2 transition ${
                                showCancelled 
                                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                                    : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {showCancelled ? 'Ocultar Anuladas' : 'Mostrar Anuladas'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">
                            {showCancelled ? 'Total (incluye anuladas)' : 'Total Ventas'}
                        </div>
                        <div className="text-2xl font-bold text-orange-600">{Formatters.currency(totalSales)}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Transacciones</div>
                        <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Ticket Promedio</div>
                        <div className="text-2xl font-bold text-green-600">
                            {Formatters.currency(totalTransactions > 0 ? totalSales / totalTransactions : 0)}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-2">ID</th>
                                <th className="text-left py-3 px-2">Fecha</th>
                                <th className="text-left py-3 px-2">Hora</th>
                                <th className="text-left py-3 px-2">Cliente</th>
                                <th className="text-left py-3 px-2">Cajero</th>
                                <th className="text-right py-3 px-2">Total</th>
                                <th className="text-left py-3 px-2">Método</th>
                                <th className="text-center py-3 px-2">Estado</th>
                                <th className="text-center py-3 px-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-8 text-gray-500">
                                        No hay ventas en este período
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map(sale => (
                                    <tr 
                                        key={sale.id} 
                                        className={`border-b hover:bg-gray-50 ${
                                            sale.cancelled ? 'bg-red-50/30' : ''
                                        }`}
                                    >
                                        <td className="py-3 px-2 text-sm">#{sale.id}</td>
                                        <td className="py-3 px-2 text-sm">{Formatters.date(sale.date)}</td>
                                        <td className="py-3 px-2 text-sm">{sale.time}</td>
                                        <td className="py-3 px-2 text-sm">{sale.customerName}</td>
                                        <td className="py-3 px-2 text-sm">{sale.cashier}</td>
                                        <td className="py-3 px-2 text-sm text-right font-semibold">
                                            <span className={sale.cancelled ? 'line-through text-gray-500' : ''}>
                                                {Formatters.currency(sale.total)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-sm">
                                            {sale.paymentMethod === 'cash' ? 'Efectivo' : 
                                             sale.paymentMethod === 'card' ? 'Tarjeta' : 
                                             sale.paymentMethod === 'mixed' ? 'Mixto' : 'N/A'}
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            {sale.cancelled ? (
                                                <span className="badge-cancelled" title={`Anulado por: ${sale.cancelledBy || 'N/A'}`}>
                                                    Anulado
                                                </span>
                                            ) : (
                                                <span className="badge-active">Activo</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(sale)}
                                                    className="touch-target p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                                    title="Ver Detalles"
                                                >
                                                    <Icons.FileText size={16} />
                                                </button>
                                                {!sale.cancelled && (
                                                    <button
                                                        onClick={() => handleCancelSale(sale)}
                                                        className="touch-target p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                        title="Anular Pedido"
                                                    >
                                                        <Icons.Ban size={16} />
                                                    </button>
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

            {showCancelModal && selectedSale && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 modal-overlay">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <Icons.Ban size={24} className="text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold">Anular Venta</h3>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700 mb-4">
                                    ¿Estás seguro de que deseas anular esta venta?
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ticket:</span>
                                        <span className="font-semibold">#{selectedSale.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cliente:</span>
                                        <span className="font-semibold">{selectedSale.customerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total:</span>
                                        <span className="font-semibold">{Formatters.currency(selectedSale.total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fecha:</span>
                                        <span className="font-semibold">{Formatters.date(selectedSale.date)} {selectedSale.time}</span>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                    ⚠️ Esta acción devolverá el stock de los productos vendidos y la venta quedará registrada como ANULADA.
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button 
                                    variant="secondary" 
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setSelectedSale(null);
                                    }} 
                                    fullWidth
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    variant="danger" 
                                    onClick={confirmCancelSale}
                                    fullWidth
                                    icon={<Icons.Ban size={20} />}
                                >
                                    Anular Venta
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSaleDetails && selectedSale && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 modal-overlay">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl modal-content">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Detalles de la Venta #{selectedSale.id}</h3>
                                <button 
                                    onClick={() => {
                                        setShowSaleDetails(false);
                                        setSelectedSale(null);
                                    }} 
                                    className="touch-target p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <Icons.X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-600">Fecha y Hora</p>
                                        <p className="font-semibold">{Formatters.date(selectedSale.date)} {selectedSale.time}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Cliente</p>
                                        <p className="font-semibold">{selectedSale.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Cajero</p>
                                        <p className="font-semibold">{selectedSale.cashier}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Método de Pago</p>
                                        <p className="font-semibold">
                                            {selectedSale.paymentMethod === 'cash' ? 'Efectivo' : 
                                             selectedSale.paymentMethod === 'card' ? 'Tarjeta' : 
                                             selectedSale.paymentMethod === 'mixed' ? 'Mixto' : 'N/A'}
                                        </p>
                                    </div>
                                    {selectedSale.cancelled && (
                                        <>
                                            <div>
                                                <p className="text-sm text-gray-600">Anulado por</p>
                                                <p className="font-semibold text-red-600">{selectedSale.cancelledBy || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Fecha Anulación</p>
                                                <p className="font-semibold text-red-600">
                                                    {selectedSale.cancelledAt ? Formatters.date(selectedSale.cancelledAt) : 'N/A'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3">Productos</h4>
                                    <div className="space-y-2">
                                        {selectedSale.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{item.emoji}</span>
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {item.quantity} x {Formatters.currency(item.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="font-semibold">
                                                    {Formatters.currency(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="font-bold">Total:</span>
                                        <span className={`font-bold ${selectedSale.cancelled ? 'line-through text-gray-500' : 'text-orange-600'}`}>
                                            {Formatters.currency(selectedSale.total)}
                                        </span>
                                    </div>
                                    
                                    {selectedSale.paymentMethod === 'cash' && (
                                        <>
                                            <div className="flex justify-between text-sm mt-2">
                                                <span>Recibido:</span>
                                                <span>{Formatters.currency(selectedSale.amountReceived)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Cambio:</span>
                                                <span>{Formatters.currency(selectedSale.change)}</span>
                                            </div>
                                        </>
                                    )}
                                    
                                    {selectedSale.paymentMethod === 'mixed' && (
                                        <>
                                            <div className="flex justify-between text-sm mt-2">
                                                <span>Efectivo:</span>
                                                <span>{Formatters.currency(selectedSale.amountCash)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Transferencia:</span>
                                                <span>{Formatters.currency(selectedSale.amountTransfer)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        variant="info"
                                        icon={<Icons.Printer size={20} />}
                                        onClick={() => {
                                            window.print();
                                        }}
                                    >
                                        Imprimir
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowSaleDetails(false);
                                            setSelectedSale(null);
                                        }}
                                    >
                                        Cerrar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsModule;