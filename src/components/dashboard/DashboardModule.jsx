import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Icons } from '../common/Icons';
import { Button } from '../common/Button';
import { Formatters } from '../../utils/Formatters';
import ThermalReceipt from '../common/ThermalReceipt';

// EXACTAMENTE IGUAL que en el original
const DashboardModule = () => {
    const { sales, products, businessName, businessLogo, logoType } = useContext(AppContext);
    const [dateRange, setDateRange] = useState('today');
    const [showCutReport, setShowCutReport] = useState(false);

    const getFilteredSales = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return sales.filter(sale => {
            if (sale.deleted || sale.cancelled) return false;
            const saleDate = new Date(sale.date);
            switch (dateRange) {
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

    const filteredSales = getFilteredSales();

    const productSales = useMemo(() => {
        const salesMap = new Map();

        products.filter(p => !p.deleted).forEach(product => {
            salesMap.set(product.id, {
                id: product.id,
                name: product.name,
                emoji: product.emoji,
                category: product.category,
                quantity: 0,
                revenue: 0,
                price: product.price
            });
        });

        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const product = salesMap.get(item.id);
                if (product) {
                    product.quantity += item.quantity;
                    product.revenue += item.price * item.quantity;
                } else {
                    salesMap.set(item.id, {
                        id: item.id,
                        name: item.name,
                        emoji: item.emoji,
                        category: item.category || 'Sin categoría',
                        quantity: item.quantity,
                        revenue: item.price * item.quantity,
                        price: item.price
                    });
                }
            });
        });

        return Array.from(salesMap.values())
            .filter(p => p.quantity > 0)
            .sort((a, b) => b.quantity - a.quantity);
    }, [filteredSales, products]);

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const cutReportData = {
        date: new Date().toISOString(),
        range: dateRange,
        totalRevenue,
        totalTransactions,
        averageTicket,
        productSales,
        businessName,
        businessLogo,
        logoType
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">Dashboard de Ventas</h2>
                    <div className="flex gap-2">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="today">Hoy</option>
                            <option value="week">Última Semana</option>
                            <option value="month">Último Mes</option>
                            <option value="all">Todo</option>
                        </select>
                        <Button
                            variant="info"
                            icon={<Icons.Printer size={20} />}
                            onClick={() => setShowCutReport(true)}
                        >
                            Corte de Caja
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Ingresos Totales</div>
                        <div className="text-2xl font-bold text-orange-600">{Formatters.currency(totalRevenue)}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Transacciones</div>
                        <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Ticket Promedio</div>
                        <div className="text-2xl font-bold text-green-600">{Formatters.currency(averageTicket)}</div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Productos más vendidos</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-2">Producto</th>
                                    <th className="text-left py-3 px-2">Categoría</th>
                                    <th className="text-right py-3 px-2">Cantidad</th>
                                    <th className="text-right py-3 px-2">Precio Unit.</th>
                                    <th className="text-right py-3 px-2">Ingreso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productSales.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-gray-500">
                                            No hay ventas en este período
                                        </td>
                                    </tr>
                                ) : (
                                    productSales.map(product => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{product.emoji}</span>
                                                    <span className="font-medium">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">{product.category}</td>
                                            <td className="py-3 px-2 text-right font-semibold">{product.quantity}</td>
                                            <td className="py-3 px-2 text-right">{Formatters.currency(product.price)}</td>
                                            <td className="py-3 px-2 text-right font-semibold text-green-600">
                                                {Formatters.currency(product.revenue)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showCutReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md modal-content">
                        <div className="p-4 sm:p-6 no-print">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Corte de Caja</h3>
                                <button
                                    onClick={() => setShowCutReport(false)}
                                    className="touch-target p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <Icons.X size={24} />
                                </button>
                            </div>

                            <ThermalReceipt 
                                sale={{
                                    id: 'CORTE-' + Date.now(),
                                    date: new Date().toISOString(),
                                    time: Formatters.time(new Date()),
                                    cashier: 'Sistema',
                                    customerName: 'Corte de Caja',
                                    items: productSales.map(p => ({
                                        ...p,
                                        quantity: p.quantity,
                                        price: p.price
                                    })),
                                    total: totalRevenue,
                                    paymentMethod: 'mixed',
                                    amountCash: totalRevenue,
                                    amountTransfer: 0,
                                    amountReceived: totalRevenue,
                                    change: 0
                                }}
                                business={{ name: businessName, logo: businessLogo, logoType }}
                            />

                            <div className="flex gap-3 mt-4">
                                <Button
                                    variant="info"
                                    icon={<Icons.Printer size={20} />}
                                    onClick={() => window.print()}
                                    fullWidth
                                >
                                    Imprimir
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowCutReport(false)}
                                    fullWidth
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardModule;