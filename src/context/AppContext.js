import React, { createContext, useState, useEffect, useCallback } from 'react';
import { StorageService } from '../utils/StorageService';
import { CONFIG } from '../constants/config';
import { Formatters } from '../utils/Formatters';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Estados de autenticación
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('sales');

    // Estados de datos
    const [products, setProducts] = useState(() => 
        StorageService.load(CONFIG.STORAGE_KEYS.PRODUCTS, [
            { id: 1, name: 'Pizza Margherita', price: 12.99, stock: 20, category: 'Platos Principales', emoji: '🍕', deleted: false },
            { id: 2, name: 'Hamburguesa Clásica', price: 8.99, stock: 15, category: 'Platos Principales', emoji: '🍔', deleted: false },
            { id: 3, name: 'Ensalada César', price: 7.50, stock: 25, category: 'Ensaladas', emoji: '🥗', deleted: false },
            { id: 4, name: 'Café Americano', price: 2.50, stock: 50, category: 'Bebidas', emoji: '☕', deleted: false },
        ])
    );

    const [sales, setSales] = useState(() => 
        StorageService.load(CONFIG.STORAGE_KEYS.SALES, [])
    );

    const [categories, setCategories] = useState(() =>
        StorageService.load(CONFIG.STORAGE_KEYS.CATEGORIES, [
            'Platos Principales',
            'Ensaladas',
            'Bebidas',
            'Postres'
        ])
    );

    const [users, setUsers] = useState(() =>
        StorageService.load(CONFIG.STORAGE_KEYS.USERS, [
            { id: 1, username: 'admin', password: 'admin123', name: 'Administrador', role: 'admin' },
            { id: 2, username: 'cajero', password: 'cajero123', name: 'Cajero Principal', role: 'cashier' }
        ])
    );

    // Configuración del negocio
    const businessData = StorageService.load(CONFIG.STORAGE_KEYS.BUSINESS, CONFIG.DEFAULT_BUSINESS);
    const [businessName, setBusinessName] = useState(businessData.name);
    const [businessLogo, setBusinessLogo] = useState(businessData.logo);
    const [logoType, setLogoType] = useState(businessData.logoType);

    // Estados del carrito
    const [cart, setCart] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState(null);

    // ===== PERSISTENCIA EN LOCALSTORAGE =====
    useEffect(() => {
        StorageService.save(CONFIG.STORAGE_KEYS.PRODUCTS, products);
    }, [products]);

    useEffect(() => {
        StorageService.save(CONFIG.STORAGE_KEYS.SALES, sales);
    }, [sales]);

    useEffect(() => {
        StorageService.save(CONFIG.STORAGE_KEYS.CATEGORIES, categories);
    }, [categories]);

    useEffect(() => {
        StorageService.save(CONFIG.STORAGE_KEYS.USERS, users);
    }, [users]);

    useEffect(() => {
        StorageService.save(CONFIG.STORAGE_KEYS.BUSINESS, {
            name: businessName,
            logo: businessLogo,
            logoType: logoType
        });
    }, [businessName, businessLogo, logoType]);

    // ===== FUNCIONES DEL CARRITO =====
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCart(cart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                alert('Stock insuficiente');
            }
        } else {
            if (product.stock > 0) {
                setCart([...cart, { ...product, quantity: 1 }]);
            } else {
                alert('Producto sin stock');
            }
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQuantity = (id, change) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQuantity = item.quantity + change;
                if (newQuantity > 0 && newQuantity <= item.stock) {
                    return { ...item, quantity: newQuantity };
                }
            }
            return item;
        }));
    };

    const getTotal = useCallback(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    }, [cart]);

    // ===== FUNCIONES DE AUTENTICACIÓN =====
    const handleLogin = (username, password) => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            setIsLoggedIn(true);
            setCurrentUser(user);
            setCurrentView('sales');
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setCurrentView('login');
        setCart([]);
    };

    // ===== FUNCIONES PARA INVENTARIO =====
    const addProduct = (productData) => {
        const newProduct = {
            id: Date.now(),
            ...productData,
            deleted: false
        };
        setProducts([...products, newProduct]);
    };

    const updateProduct = (productId, productData) => {
        setProducts(products.map(p =>
            p.id === productId ? { ...p, ...productData } : p
        ));
    };

    const deleteProduct = (productId) => {
        setProducts(products.map(p =>
            p.id === productId ? { ...p, deleted: true } : p
        ));
    };

    const restoreProduct = (productId) => {
        setProducts(products.map(p =>
            p.id === productId ? { ...p, deleted: false } : p
        ));
    };

    // ===== FUNCIONES PARA CATEGORÍAS =====
    const addCategory = (categoryName) => {
        if (!categories.includes(categoryName)) {
            setCategories([...categories, categoryName]);
        }
    };

    const removeCategory = (categoryName) => {
        setCategories(categories.filter(c => c !== categoryName));
    };

    // ===== FUNCIONES PARA USUARIOS =====
    const addUser = (userData) => {
        const newUser = {
            id: Date.now(),
            ...userData
        };
        setUsers([...users, newUser]);
    };

    const updateUser = (userId, userData) => {
        setUsers(users.map(u =>
            u.id === userId ? { ...u, ...userData } : u
        ));
    };

    const deleteUser = (userId) => {
        setUsers(users.filter(u => u.id !== userId));
    };

    // ===== PROCESAR VENTA =====
    const processSale = (paymentData) => {
        const sale = {
            id: Date.now(),
            ...paymentData,
            date: new Date().toISOString(),
            time: Formatters.time(new Date()),
            cashier: currentUser?.name || 'Cajero',
            deleted: false,
            cancelled: false,
            cancelledAt: null,
            cancelledBy: null,
            cancellationReason: null,
            originalTotal: paymentData.total,
            status: 'completed'
        };

        // Actualizar stock
        paymentData.items.forEach(item => {
            setProducts(products.map(p =>
                p.id === item.id
                    ? { ...p, stock: p.stock - item.quantity }
                    : p
            ));
        });

        setSales([...sales, sale]);
        setLastSale(sale);
        setCart([]);
        setShowReceipt(true);
        setShowPaymentModal(false);
    };

    // ===== EXPORTAR/IMPORTAR DATOS =====
    const exportData = () => {
        const data = {
            products,
            sales,
            businessName,
            businessLogo,
            logoType,
            categories,
            users,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `restaurantpos_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const importData = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (window.confirm('¿Estás seguro de importar estos datos? Se sobrescribirá la información actual.')) {
                        setProducts(data.products || []);
                        setSales(data.sales || []);
                        setBusinessName(data.businessName || CONFIG.DEFAULT_BUSINESS.name);
                        setBusinessLogo(data.businessLogo || CONFIG.DEFAULT_BUSINESS.logo);
                        setLogoType(data.logoType || CONFIG.DEFAULT_BUSINESS.logoType);
                        if (data.categories) setCategories(data.categories);
                        if (data.users) setUsers(data.users);
                        alert('Datos importados exitosamente');
                    }
                } catch (error) {
                    alert('Error al importar los datos. Verifica que el archivo sea válido.');
                }
            };
            reader.readAsText(file);
        }
    };

    // ===== CONTEXTO EXPORTADO =====
    const contextValue = {
        // Estados de autenticación
        isLoggedIn,
        setIsLoggedIn,
        currentUser,
        setCurrentUser,
        currentView,
        setCurrentView,
        
        // Datos principales
        products, 
        setProducts,
        sales, 
        setSales,
        categories, 
        setCategories,
        users, 
        setUsers,
        
        // Configuración del negocio
        businessName, 
        setBusinessName,
        businessLogo, 
        setBusinessLogo,
        logoType, 
        setLogoType,
        
        // Carrito
        cart, 
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotal,
        showPaymentModal,
        setShowPaymentModal,
        showReceipt,
        setShowReceipt,
        lastSale,
        
        // Autenticación
        handleLogin,
        handleLogout,
        
        // Funciones para productos (inventario)
        addProduct,
        updateProduct,
        deleteProduct,
        restoreProduct,
        
        // Funciones para categorías
        addCategory,
        removeCategory,
        
        // Funciones para usuarios
        addUser,
        updateUser,
        deleteUser,
        
        // Ventas
        processSale,
        
        // Exportar/Importar
        exportData,
        importData
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};