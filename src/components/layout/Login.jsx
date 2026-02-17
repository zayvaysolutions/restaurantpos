import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Button } from '../common/Button';

const Login = () => {
    const { handleLogin } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin(email, password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md fade-in">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">RestaurantPOS v3.2</h1>
                    <p className="text-gray-600">Sistema de Punto de Venta con Firebase</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="admin@demo.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button type="submit" variant="primary" fullWidth>
                        Iniciar Sesión
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>Demo: admin@demo.com / demo123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;