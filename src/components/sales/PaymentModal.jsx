import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Icons } from '../common/Icons';
import { Button } from '../common/Button';
import { Formatters } from '../../utils/Formatters';

// EXACTAMENTE IGUAL que en el original
const PaymentModal = ({ isOpen, onClose, onConfirm }) => {
    const { cart, getTotal } = useContext(AppContext);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountCash, setAmountCash] = useState('');
    const [amountTransfer, setAmountTransfer] = useState('');
    const [customerName, setCustomerName] = useState('');

    const total = parseFloat(getTotal());
    
    const cashAmount = parseFloat(amountCash) || 0;
    const transferAmount = parseFloat(amountTransfer) || 0;
    const totalReceived = paymentMethod === 'mixed' ? cashAmount + transferAmount : (paymentMethod === 'cash' ? cashAmount : total);
    const change = paymentMethod === 'cash' ? totalReceived - total : 0;

    useEffect(() => {
        if (paymentMethod === 'mixed' && amountCash) {
            const cash = parseFloat(amountCash) || 0;
            const remaining = Math.max(0, total - cash);
            setAmountTransfer(remaining.toFixed(2));
        }
    }, [amountCash, paymentMethod, total]);

    if (!isOpen) return null;

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        setAmountCash('');
        setAmountTransfer('');
    };

    const handleConfirm = () => {
        if (paymentMethod === 'cash' && totalReceived < total) {
            alert('El monto recibido es insuficiente');
            return;
        }

        if (paymentMethod === 'mixed' && (cashAmount + transferAmount) < total) {
            alert('El monto total (efectivo + transferencia) es insuficiente');
            return;
        }

        const paymentData = {
            items: cart,
            total,
            paymentMethod,
            customerName: customerName || 'Cliente General'
        };

        if (paymentMethod === 'cash') {
            paymentData.amountReceived = totalReceived;
            paymentData.change = change;
        } else if (paymentMethod === 'mixed') {
            paymentData.amountCash = cashAmount;
            paymentData.amountTransfer = transferAmount;
            paymentData.amountReceived = cashAmount + transferAmount;
            paymentData.change = 0;
        } else {
            paymentData.amountReceived = total;
            paymentData.change = 0;
        }

        onConfirm(paymentData);

        setPaymentMethod('cash');
        setAmountCash('');
        setAmountTransfer('');
        setCustomerName('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 modal-overlay">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md modal-content">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Procesar Pago</h3>
                        <button onClick={onClose} className="touch-target p-2 hover:bg-gray-100 rounded-lg">
                            <Icons.X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre del Cliente (Opcional)</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Cliente General"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Método de Pago</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handlePaymentMethodChange('cash')}
                                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                                        paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                                    }`}
                                >
                                    <Icons.DollarSign size={20} />
                                    <span className="font-semibold text-xs">Efectivo</span>
                                </button>
                                <button
                                    onClick={() => handlePaymentMethodChange('card')}
                                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                                        paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                                    }`}
                                >
                                    <Icons.CreditCard size={20} />
                                    <span className="font-semibold text-xs">Tarjeta</span>
                                </button>
                                <button
                                    onClick={() => handlePaymentMethodChange('mixed')}
                                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                                        paymentMethod === 'mixed' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                                    }`}
                                >
                                    <div className="flex gap-1">
                                        <Icons.DollarSign size={16} />
                                        <Icons.CreditCard size={16} />
                                    </div>
                                    <span className="font-semibold text-xs">Mixto</span>
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'cash' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Monto Recibido</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amountCash}
                                    onChange={(e) => setAmountCash(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="0.00"
                                />
                            </div>
                        )}

                        {paymentMethod === 'mixed' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Efectivo</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amountCash}
                                        onChange={(e) => setAmountCash(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Transferencia</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amountTransfer}
                                        onChange={(e) => setAmountTransfer(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-50"
                                        placeholder="0.00"
                                        readOnly={amountCash !== ''}
                                    />
                                    {amountCash !== '' && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            * La transferencia se calcula automáticamente
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <span>Total:</span>
                                <span className="font-bold">{Formatters.currency(total)}</span>
                            </div>
                            {paymentMethod === 'cash' && amountCash && (
                                <>
                                    <div className="flex justify-between mb-2">
                                        <span>Recibido:</span>
                                        <span className="font-bold">{Formatters.currency(totalReceived)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg">
                                        <span>Cambio:</span>
                                        <span className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Formatters.currency(Math.max(0, change))}
                                        </span>
                                    </div>
                                </>
                            )}
                            {paymentMethod === 'mixed' && (
                                <>
                                    <div className="flex justify-between mb-2">
                                        <span>Efectivo:</span>
                                        <span className="font-bold">{Formatters.currency(cashAmount)}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span>Transferencia:</span>
                                        <span className="font-bold">{Formatters.currency(transferAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg border-t pt-2 mt-2">
                                        <span>Total Recibido:</span>
                                        <span className={`font-bold ${(cashAmount + transferAmount) >= total ? 'text-green-600' : 'text-red-600'}`}>
                                            {Formatters.currency(cashAmount + transferAmount)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={onClose} fullWidth>
                                Cancelar
                            </Button>
                            <Button 
                                variant="success" 
                                onClick={handleConfirm} 
                                fullWidth
                                icon={<Icons.Check size={20} />}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;