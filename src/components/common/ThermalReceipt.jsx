import React from 'react';
import { Formatters } from '../../utils/Formatters';

const ThermalReceipt = ({ sale, business }) => {
    return (
        <div className="thermal-receipt">
            <div className="text-center mb-4">
                {business.logoType === 'emoji' ? (
                    <div className="text-4xl mb-2">{business.logo}</div>
                ) : (
                    <img src={business.logo} alt="Logo" className="w-16 h-16 mx-auto mb-2" />
                )}
                <div className="font-bold text-lg">{business.name}</div>
                <div className="text-xs">================================</div>
            </div>

            <div className="text-xs mb-3">
                <div>Fecha: {Formatters.date(sale.date)}</div>
                <div>Hora: {sale.time}</div>
                <div>Cajero: {sale.cashier}</div>
                <div>Cliente: {sale.customerName}</div>
                <div className="border-t border-dashed mt-2 pt-2">Ticket #{sale.id}</div>
            </div>

            <div className="text-xs mb-3">
                <div className="border-t border-dashed pt-2">
                    {sale.items.map((item, index) => (
                        <div key={index} className="mb-2">
                            <div className="flex justify-between">
                                <span>{item.emoji} {item.name}</span>
                            </div>
                            <div className="flex justify-between pl-4">
                                <span>{item.quantity} x {Formatters.currency(item.price)}</span>
                                <span>{Formatters.currency(item.price * item.quantity)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-xs border-t border-dashed pt-2">
                <div className="flex justify-between font-bold text-base">
                    <span>TOTAL:</span>
                    <span>{Formatters.currency(sale.total)}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Método de Pago:</span>
                    <span>
                        {sale.paymentMethod === 'cash' ? 'Efectivo' : 
                         sale.paymentMethod === 'card' ? 'Tarjeta' : 
                         sale.paymentMethod === 'mixed' ? 'Mixto' : 'N/A'}
                    </span>
                </div>
                {sale.paymentMethod === 'cash' && (
                    <>
                        <div className="flex justify-between">
                            <span>Recibido:</span>
                            <span>{Formatters.currency(sale.amountReceived)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cambio:</span>
                            <span>{Formatters.currency(sale.change)}</span>
                        </div>
                    </>
                )}
                {sale.paymentMethod === 'mixed' && (
                    <>
                        <div className="flex justify-between">
                            <span>Efectivo:</span>
                            <span>{Formatters.currency(sale.amountCash)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Transferencia:</span>
                            <span>{Formatters.currency(sale.amountTransfer)}</span>
                        </div>
                    </>
                )}
                {sale.cancelled && (
                    <div className="text-center mt-2 font-bold text-red-600">
                        *** VENTA ANULADA ***
                    </div>
                )}
            </div>

            <div className="text-center text-xs mt-4 border-t border-dashed pt-3">
                <div>¡Gracias por su compra!</div>
                <div className="mt-2">www.mirestaurante.com</div>
            </div>
        </div>
    );
};

export default ThermalReceipt;