import React, { createContext, useState, useEffect, useCallback } from 'react';
import { productService, saleService, categoryService, userService, businessService } from '../firebase/services';
import { loginWithEmail, logout as firebaseLogout, onAuthChange } from '../firebase/auth';
import { Formatters } from '../utils/Formatters';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('sales');
    const [loading, setLoading] = useState(true);

    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [business, setBusiness] = useState({ name: 'Mi Restaurante', logo: '🍽️', logoType: 'emoji' });

    const [cart, setCart] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState(null);

    // Escuchar cambios en autenticación
    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                // Usuario autenticado
                setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || user.email.split('@')[0],
                    role: 'admin' // Por defecto admin, luego puedes cargar el rol desde Firestore
                });
                setIsLoggedIn(true);
                
                // Cargar todos los datos
                await loadAllData();
            } else {
                // Usuario no autenticado
                setCurrentUser(null);
                setIsLoggedIn(false);
                setProducts([]);
                setSales([]);
                setCategories([]);
                setUsers([]);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Cargar todos los datos desde Firebase
    const loadAllData = async () => {
        try {
            const [productsData, salesData, categoriesData, usersData, businessData] = await Promise.all([
                productService.getAll(),
                saleService.getAll(),
                categoryService.getAll(),
                userService.getAll(),
                businessService.get()
            ]);

            setProducts(productsData);
            setSales(salesData);
            setCategories(categoriesData.length ? categoriesData : ['Platos Principales', 'Ensaladas', 'Bebidas', 'Postres']);
            setUsers(usersData);
            setBusiness(businessData);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    };

    // Login
    const handleLogin = async (username, password) => {
        const result = await loginWithEmail(username, password);
        if (result.success) {
            // El onAuthChange se encargará de actualizar el estado
            return true;
        } else {
            alert('Usuario o contraseña incorrectos: ' + result.error);
            return false;
        }
    };

    // Logout
    const handleLogout = async () => {
        await firebaseLogout();
        setCart([]);
    };

    // Funciones del carrito (igual que antes)
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

    // Procesar venta (guardar en Firebase)
    const processSale = async (paymentData) => {
        try {
            const sale = {
                ...paymentData,
                date: new Date().toISOString(),
                time: Formatters.time(new Date()),
                cashier: currentUser?.name || 'Cajero',
                deleted: false,
                cancelled: false,
                status: 'completed'
            };

            // Guardar en Firebase
            const savedSale = await saleService.create(sale);

            // Actualizar stock de productos
            for (const item of paymentData.items) {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    await productService.update(item.id, {
                        ...product,
                        stock: product.stock - item.quantity
                    });
                }
            }

            // Actualizar estado local
            setProducts(products.map(p => {
                const soldItem = paymentData.items.find(i => i.id === p.id);
                if (soldItem) {
                    return { ...p, stock: p.stock - soldItem.quantity };
                }
                return p;
            }));

            setSales([savedSale, ...sales]);
            setLastSale(savedSale);
            setCart([]);
            setShowReceipt(true);
            setShowPaymentModal(false);
        } catch (error) {
            alert('Error al procesar la venta: ' + error.message);
        }
    };

    // Funciones para productos
    const addProduct = async (productData) => {
        const newProduct = await productService.create(productData);
        setProducts([...products, newProduct]);
    };

    const updateProduct = async (productId, productData) => {
        await productService.update(productId, productData);
        setProducts(products.map(p => 
            p.id === productId ? { ...p, ...productData } : p
        ));
    };

    const deleteProduct = async (productId) => {
        await productService.delete(productId);
        setProducts(products.map(p => 
            p.id === productId ? { ...p, deleted: true } : p
        ));
    };

    const restoreProduct = async (productId) => {
        await productService.restore(productId);
        setProducts(products.map(p => 
            p.id === productId ? { ...p, deleted: false } : p
        ));
    };

    // Funciones para categorías
    const addCategory = async (categoryName) => {
        await categoryService.add(categoryName);
        setCategories([...categories, categoryName]);
    };

    const removeCategory = async (categoryName) => {
        await categoryService.remove(categoryName);
        setCategories(categories.filter(c => c !== categoryName));
    };

    // Funciones para usuarios
    const addUser = async (userData) => {
        const newUser = await userService.create(userData);
        setUsers([...users, newUser]);
    };

    const updateUser = async (userId, userData) => {
        await userService.update(userId, userData);
        setUsers(users.map(u => 
            u.id === userId ? { ...u, ...userData } : u
        ));
    };

    const deleteUser = async (userId) => {
        await userService.delete(userId);
        setUsers(users.filter(u => u.id !== userId));
    };

    // Funciones para negocio
    const updateBusiness = async (businessData) => {
        const updated = await businessService.update(businessData);
        setBusiness(updated);
    };

    // Exportar/Importar datos (ahora desde Firebase)
    const exportData = () => {
        const data = {
            products,
            sales,
            businessName: business.name,
            businessLogo: business.logo,
            logoType: business.logoType,
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

    const importData = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (window.confirm('¿Estás seguro de importar estos datos? Se sobrescribirá la información actual en Firebase.')) {
                        // Aquí iría la lógica para importar a Firebase
                        alert('Función de importación en desarrollo');
                    }
                } catch (error) {
                    alert('Error al importar los datos. Verifica que el archivo sea válido.');
                }
            };
            reader.readAsText(file);
        }
    };

    // Anular venta
    const cancelSale = async (saleId, cancellationData) => {
        await saleService.cancel(saleId, cancellationData);
        setSales(sales.map(s => 
            s.id === saleId ? { ...s, cancelled: true, ...cancellationData } : s
        ));
    };

    const contextValue = {
        isLoggedIn,
        currentUser,
        currentView,
        setCurrentView,
        loading,
        products, 
        sales, 
        categories, 
        users,
        businessName: business.name,
        setBusinessName: (name) => updateBusiness({ ...business, name }),
        businessLogo: business.logo,
        setBusinessLogo: (logo) => updateBusiness({ ...business, logo }),
        logoType: business.logoType,
        setLogoType: (logoType) => updateBusiness({ ...business, logoType }),
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotal,
        setShowPaymentModal,
        showPaymentModal,
        showReceipt,
        setShowReceipt,
        lastSale,
        handleLogin,
        handleLogout,
        processSale,
        cancelSale,
        addProduct,
        updateProduct,
        deleteProduct,
        restoreProduct,
        addCategory,
        removeCategory,
        addUser,
        updateUser,
        deleteUser,
        exportData,
        importData
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-spin">⚙️</div>
                    <div className="text-xl">Conectando con Firebase...</div>
                </div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};