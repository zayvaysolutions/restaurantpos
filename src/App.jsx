import React, { useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Login from './components/layout/Login';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import SalesModule from './components/sales/SalesModule';
import ReportsModule from './components/reports/ReportsModule';
import InventoryModule from './components/inventory/InventoryModule';
import DashboardModule from './components/dashboard/DashboardModule';
import SettingsModule from './components/settings/SettingsModule';
import PaymentModal from './components/sales/PaymentModal';
import ThermalReceipt from './components/common/ThermalReceipt';
import { Icons } from './components/common/Icons';
import { Button } from './components/common/Button';

// Componente principal que usa el contexto
const RestaurantAppContent = () => {
    const { 
        isLoggedIn, 
        currentUser, 
        currentView, 
        setCurrentView,
        handleLogin,  // ← Ahora está definido
        handleLogout,
        showPaymentModal,
        setShowPaymentModal,
        showReceipt,
        setShowReceipt,
        lastSale,
        businessName,
        businessLogo,
        logoType,
        processSale
    } = useContext(AppContext);

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={currentUser} onLogout={handleLogout} />
            
            <Navigation 
                currentView={currentView} 
                onViewChange={setCurrentView} 
            />

            <main className="main-container container mx-auto px-3 sm:px-6 py-4 sm:py-6">
                {currentView === 'sales' && <SalesModule />}
                {currentView === 'reports' && <ReportsModule />}
                {currentView === 'dashboard' && currentUser?.role === 'admin' && <DashboardModule />}
                {currentView === 'inventory' && currentUser?.role === 'admin' && <InventoryModule />}
                {currentView === 'settings' && currentUser?.role === 'admin' && <SettingsModule />}
            </main>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={processSale}
            />

            {showReceipt && lastSale && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md modal-content">
                        <div className="p-4 sm:p-6 no-print">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Venta Completada</h3>
                                <button
                                    onClick={() => setShowReceipt(false)}
                                    className="touch-target p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <Icons.X size={24} />
                                </button>
                            </div>

                            <ThermalReceipt 
                                sale={lastSale} 
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
                                    onClick={() => setShowReceipt(false)}
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

// Componente raíz con el provider
const RestaurantApp = () => {
    return (
        <AppProvider>
            <RestaurantAppContent />
        </AppProvider>
    );
};

export default RestaurantApp;