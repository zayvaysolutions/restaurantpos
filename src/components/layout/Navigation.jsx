import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Icons } from '../common/Icons';

// EXACTAMENTE IGUAL que en el original
const Navigation = ({ currentView, onViewChange }) => {
    const { currentUser } = useContext(AppContext);

    const navItems = [
        { id: 'sales', label: 'Ventas', icon: <Icons.ShoppingCart size={20} />, roles: ['admin', 'cashier'] },
        { id: 'reports', label: 'Reportes', icon: <Icons.BarChart size={20} />, roles: ['admin', 'cashier'] },
        { id: 'inventory', label: 'Inventario', icon: <Icons.Package size={20} />, roles: ['admin'] },
        { id: 'dashboard', label: 'Dashboard', icon: <Icons.Database size={20} />, roles: ['admin'] },
        { id: 'settings', label: 'Ajustes', icon: <Icons.Settings size={20} />, roles: ['admin'] },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-[72px] sm:top-[80px] z-30">
            <div className="container mx-auto px-2 sm:px-6">
                <div className="flex overflow-x-auto gap-1 sm:gap-2 py-2">
                    {navItems.filter(item => item.roles.includes(currentUser?.role)).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`
                                flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition whitespace-nowrap
                                ${currentView === item.id
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }
                            `}
                        >
                            {item.icon}
                            <span className="text-sm sm:text-base">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;