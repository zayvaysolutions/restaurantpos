import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';

// EXACTAMENTE IGUAL que en el original
const Header = ({ user, onLogout }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        const handleFullScreenChange = () => {
            setIsFullScreen(
                document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.msFullscreenElement
            );
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('msfullscreenchange', handleFullScreenChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('msfullscreenchange', handleFullScreenChange);
        };
    }, []);

    const toggleFullScreen = () => {
        const element = document.documentElement;
        
        if (!isFullScreen) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-3xl sm:text-4xl">🍽️</span>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-800">RestaurantPOS v3.2</h1>
                            <p className="text-xs sm:text-sm text-gray-600">
                                {user?.name} ({user?.role === 'admin' ? 'Administrador' : 'Cajero'})
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-semibold text-gray-800 time-update">
                                {currentTime.toLocaleTimeString('es-ES')}
                            </div>
                            <div className="text-xs text-gray-600">
                                {currentTime.toLocaleDateString('es-ES')}
                            </div>
                        </div>

                        <button
                            onClick={toggleFullScreen}
                            className="touch-target p-2 hover:bg-gray-100 rounded-lg transition"
                            title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
                        >
                            {isFullScreen ? (
                                <Icons.Minimize size={20} className="text-gray-600" />
                            ) : (
                                <Icons.FullScreen size={20} className="text-gray-600" />
                            )}
                        </button>

                        <button
                            onClick={onLogout}
                            className="touch-target p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Cerrar Sesión"
                        >
                            <Icons.LogOut size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;