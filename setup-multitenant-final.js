// setup-multitenant-final.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, Timestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbYxuLKGsNVktHRWonXBWqHJHx0Oi0loA",
  authDomain: "restaurantpos-multi.firebaseapp.com",
  projectId: "restaurantpos-multi",
  storageBucket: "restaurantpos-multi.firebasestorage.app",
  messagingSenderId: "13033221224",
  appId: "1:13033221224:web:375fda406b42b2472cdfdd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ⚠️ IMPORTANTE: CAMBIA ESTOS VALORES POR EL USUARIO QUE CREASTE
const USER_EMAIL = "test@test.com";  // ← CAMBIA AQUÍ
const USER_PASSWORD = "test123";       // ← CAMBIA AQUÍ

async function setupMultitenant() {
  console.log('\n🚀 CONFIGURANDO MULTI-TENANT PARA RESTAURANTPOS');
  console.log('==============================================\n');

  try {
    // 1. Autenticarse con el nuevo usuario
    console.log(`🔑 Autenticando con ${USER_EMAIL}...`);
    const userCredential = await signInWithEmailAndPassword(auth, USER_EMAIL, USER_PASSWORD);
    console.log('✅ Autenticación exitosa. UID:', userCredential.user.uid);

    // 2. Verificar colecciones
    console.log('\n📋 Verificando colecciones existentes...');
    const collections = ['business', 'categories', 'products', 'users'];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        console.log(`   - ${collectionName}: ${snapshot.size} documentos`);
      } catch (error) {
        console.log(`   - ${collectionName}: Error - ${error.message}`);
      }
    }

    // 3. Verificar si el usuario actual tiene documento en users
    console.log('\n👤 Verificando usuario actual...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let userDoc = null;
    let userExists = false;
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      if (data.email === USER_EMAIL) {
        userExists = true;
        userDoc = { id: doc.id, ...data };
        console.log('✅ Usuario encontrado en Firestore:', doc.id);
        break;
      }
    }

    if (!userExists) {
      console.log('⚠️ Usuario no encontrado en Firestore. Creando...');
      const newUser = {
        email: USER_EMAIL,
        name: 'Administrador',
        role: 'admin',
        tenantId: 'negocio-1',
        createdAt: Timestamp.now()
      };
      const newUserRef = await addDoc(collection(db, 'users'), newUser);
      console.log('✅ Usuario creado en Firestore:', newUserRef.id);
      userDoc = { id: newUserRef.id, ...newUser };
    }

    // 4. Configurar tenant para negocio 1
    console.log('\n🏢 Configurando NEGOCIO 1...');
    const tenantId1 = 'negocio-1';
    
    // Actualizar el documento del usuario
    if (userDoc) {
      await updateDoc(doc(db, 'users', userDoc.id), { 
        tenantId: tenantId1,
        role: 'admin'
      });
      console.log('✅ Usuario actualizado con tenantId');
    }

    // Actualizar business
    const businessSnapshot = await getDocs(collection(db, 'business'));
    if (!businessSnapshot.empty) {
      const businessDoc = businessSnapshot.docs[0];
      await updateDoc(doc(db, 'business', businessDoc.id), { 
        tenantId: tenantId1,
        name: 'Restaurante El Sazón',
        logo: '🍽️',
        logoType: 'emoji'
      });
      console.log('✅ business actualizado');
    } else {
      // Crear business si no existe
      const newBusiness = {
        name: 'Restaurante El Sazón',
        logo: '🍽️',
        logoType: 'emoji',
        tenantId: tenantId1,
        createdAt: Timestamp.now()
      };
      await addDoc(collection(db, 'business'), newBusiness);
      console.log('✅ business creado');
    }

    // Actualizar categories existentes
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    if (categoriesSnapshot.size > 0) {
      for (const catDoc of categoriesSnapshot.docs) {
        await updateDoc(doc(db, 'categories', catDoc.id), { tenantId: tenantId1 });
      }
      console.log(`✅ ${categoriesSnapshot.size} categorías actualizadas`);
    } else {
      // Crear categorías
      const categorias = ['Platos Principales', 'Ensaladas', 'Bebidas', 'Postres'];
      for (const cat of categorias) {
        await addDoc(collection(db, 'categories'), {
          name: cat,
          tenantId: tenantId1,
          createdAt: Timestamp.now()
        });
      }
      console.log('✅ Categorías creadas');
    }

    // Actualizar products existentes
    const productsSnapshot = await getDocs(collection(db, 'products'));
    if (productsSnapshot.size > 0) {
      for (const prodDoc of productsSnapshot.docs) {
        await updateDoc(doc(db, 'products', prodDoc.id), { tenantId: tenantId1 });
      }
      console.log(`✅ ${productsSnapshot.size} productos actualizados`);
    } else {
      // Crear productos
      const productos = [
        { name: 'Pizza Margherita', price: 12.99, stock: 20, emoji: '🍕', category: 'Platos Principales' },
        { name: 'Hamburguesa Clásica', price: 8.99, stock: 15, emoji: '🍔', category: 'Platos Principales' },
        { name: 'Ensalada César', price: 7.50, stock: 25, emoji: '🥗', category: 'Ensaladas' },
        { name: 'Café Americano', price: 2.50, stock: 50, emoji: '☕', category: 'Bebidas' }
      ];
      for (const prod of productos) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          deleted: false,
          tenantId: tenantId1,
          createdAt: Timestamp.now()
        });
      }
      console.log('✅ Productos creados');
    }

    // 5. Crear segundo negocio
    console.log('\n🏢 Creando NEGOCIO 2...');
    const tenantId2 = 'negocio-2';
    
    // Crear business para negocio 2
    await addDoc(collection(db, 'business'), {
      name: 'Pizzería Roma',
      logo: '🍕',
      logoType: 'emoji',
      tenantId: tenantId2,
      createdAt: Timestamp.now()
    });
    console.log('✅ business del negocio 2 creado');

    // Crear usuario para negocio 2
    await addDoc(collection(db, 'users'), {
      email: 'admin@laroma.com',
      name: 'Carlos Rodríguez',
      role: 'admin',
      tenantId: tenantId2,
      createdAt: Timestamp.now()
    });
    console.log('✅ usuario del negocio 2 creado');

    // Crear categorías para negocio 2
    const categorias2 = ['Platos Principales', 'Ensaladas', 'Bebidas', 'Postres'];
    for (const cat of categorias2) {
      await addDoc(collection(db, 'categories'), {
        name: cat,
        tenantId: tenantId2,
        createdAt: Timestamp.now()
      });
    }
    console.log('✅ categorías del negocio 2 creadas');

    // Crear productos para negocio 2
    const productos2 = [
      { name: 'Pizza Margherita', price: 12.99, stock: 20, emoji: '🍕', category: 'Platos Principales' },
      { name: 'Hamburguesa Clásica', price: 8.99, stock: 15, emoji: '🍔', category: 'Platos Principales' },
      { name: 'Ensalada César', price: 7.50, stock: 25, emoji: '🥗', category: 'Ensaladas' },
      { name: 'Café Americano', price: 2.50, stock: 50, emoji: '☕', category: 'Bebidas' }
    ];

    for (const prod of productos2) {
      await addDoc(collection(db, 'products'), {
        ...prod,
        deleted: false,
        tenantId: tenantId2,
        createdAt: Timestamp.now()
      });
    }
    console.log('✅ productos del negocio 2 creados');

    console.log('\n🎉 CONFIGURACIÓN COMPLETADA EXITOSAMENTE');
    console.log('=======================================');
    console.log('NEGOCIO 1: Restaurante El Sazón');
    console.log('Tenant ID: negocio-1');
    console.log(`Email: ${USER_EMAIL}`);
    console.log(`Password: ${USER_PASSWORD}`);
    console.log('---------------------------------------');
    console.log('NEGOCIO 2: Pizzería Roma');
    console.log('Tenant ID: negocio-2');
    console.log('Email: admin@laroma.com');
    console.log('Password: demo123');
    console.log('=======================================');

  } catch (error) {
    console.error('\n❌ ERROR DETALLADO:');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.error('\n⚠️ El usuario no existe en Authentication.');
      console.error('Ve a Firebase Console → Authentication y crea el usuario:');
      console.error(`Email: ${USER_EMAIL}`);
      console.error('Password: (la que quieras)');
    } else if (error.code === 'auth/wrong-password') {
      console.error('\n⚠️ Contraseña incorrecta');
    } else if (error.code === 'permission-denied') {
      console.error('\n⚠️ Las reglas de Firestore están bloqueando.');
      console.error('Ve a Firestore Database → Reglas y cambia temporalmente a:');
      console.error('allow read, write: if request.auth != null;');
    }
  }
}

// Ejecutar
setupMultitenant();