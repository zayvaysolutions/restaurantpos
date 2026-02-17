// init-data.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// IMPORTANTE: Usa tus propias credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbYxuLKGsNVktHRWonXBWqHJHx0Oi0loA",
  authDomain: "restaurantpos-multi.firebaseapp.com",
  projectId: "restaurantpos-multi",
  storageBucket: "restaurantpos-multi.firebasestorage.app",
  messagingSenderId: "13033221224",
  appId: "1:13033221224:web:375fda406b42b2472cdfdd",
  measurementId: "G-SCQMDK5H4L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function initDatabase() {
  console.log('🚀 Inicializando base de datos...');
  console.log('Conectando a:', firebaseConfig.projectId);
  
  try {
    // 1. Crear usuario en Authentication
    try {
      console.log('Creando usuario en Authentication...');
      const userCredential = await createUserWithEmailAndPassword(auth, 'admin@demo.com', 'demo123');
      console.log('✅ Usuario creado en Authentication:', userCredential.user.email);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️ El usuario ya existe en Authentication');
      } else {
        console.error('❌ Error en Authentication:', error.message);
      }
    }

    // 2. Crear colección users
    try {
      console.log('Creando usuario en Firestore...');
      await addDoc(collection(db, 'users'), {
        email: 'admin@demo.com',
        name: 'Administrador',
        role: 'admin',
        createdAt: Timestamp.now()
      });
      console.log('✅ Usuario creado en Firestore');
    } catch (error) {
      console.log('⚠️ Error al crear usuario en Firestore:', error.message);
    }

    // 3. Crear colección products
    console.log('Creando productos...');
    const products = [
      { name: 'Pizza Margherita', price: 12.99, stock: 20, category: 'Platos Principales', emoji: '🍕', deleted: false },
      { name: 'Hamburguesa Clásica', price: 8.99, stock: 15, category: 'Platos Principales', emoji: '🍔', deleted: false },
      { name: 'Ensalada César', price: 7.50, stock: 25, category: 'Ensaladas', emoji: '🥗', deleted: false },
      { name: 'Café Americano', price: 2.50, stock: 50, category: 'Bebidas', emoji: '☕', deleted: false }
    ];

    for (const product of products) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: Timestamp.now()
      });
    }
    console.log('✅ Productos creados');

    // 4. Crear colección categories
    console.log('Creando categorías...');
    const categories = ['Platos Principales', 'Ensaladas', 'Bebidas', 'Postres'];
    for (const category of categories) {
      await addDoc(collection(db, 'categories'), {
        name: category,
        createdAt: Timestamp.now()
      });
    }
    console.log('✅ Categorías creadas');

    // 5. Crear colección business
    console.log('Creando configuración del negocio...');
    await addDoc(collection(db, 'business'), {
      name: 'Mi Restaurante',
      logo: '🍽️',
      logoType: 'emoji',
      updatedAt: Timestamp.now()
    });
    console.log('✅ Configuración del negocio creada');

    console.log('\n🎉 ¡BASE DE DATOS INICIALIZADA CON ÉXITO!');
    console.log('=================================');
    console.log('Email: admin@demo.com');
    console.log('Password: demo123');
    console.log('=================================');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la función
initDatabase();