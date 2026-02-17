// setup-multitenant.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where, Timestamp } = require('firebase/firestore');

// Configuración de Firebase (TUS DATOS)
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

async function setupMultitenant() {
  console.log('\n🚀 CONFIGURANDO MULTI-TENANT PARA RESTAURANTPOS');
  console.log('==============================================\n');

  try {
    // 1. Verificar qué colecciones existen
    console.log('📋 Verificando colecciones existentes...');
    const collections = ['business', 'categories', 'products', 'users'];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      console.log(`   - ${collectionName}: ${snapshot.size} documentos`);
    }

    // 2. Preguntar qué hacer
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const preguntar = (pregunta) => new Promise(resolve => readline.question(pregunta, resolve));

    const opcion = await preguntar(`
¿Qué deseas hacer?

1. Configurar un SOLO negocio (recomendado para empezar)
2. Configurar DOS negocios (para probar multi-tenant)
3. Salir

Elige una opción (1, 2 o 3): `);

    if (opcion === '1') {
      await configurarUnNegocio(db);
    } else if (opcion === '2') {
      await configurarDosNegocios(db);
    } else {
      console.log('👋 Hasta luego!');
      readline.close();
      return;
    }

    readline.close();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function configurarUnNegocio(db) {
  console.log('\n🏢 CONFIGURANDO UN SOLO NEGOCIO\n');

  const tenantId = 'negocio-1';
  
  // Actualizar business
  const businessSnapshot = await getDocs(collection(db, 'business'));
  if (!businessSnapshot.empty) {
    const businessDoc = businessSnapshot.docs[0];
    await updateDoc(doc(db, 'business', businessDoc.id), { tenantId });
    console.log('✅ business actualizado');
  }

  // Actualizar users
  const usersSnapshot = await getDocs(collection(db, 'users'));
  for (const userDoc of usersSnapshot.docs) {
    await updateDoc(doc(db, 'users', userDoc.id), { tenantId });
  }
  console.log(`✅ ${usersSnapshot.size} usuarios actualizados`);

  // Actualizar categories
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  for (const catDoc of categoriesSnapshot.docs) {
    await updateDoc(doc(db, 'categories', catDoc.id), { tenantId });
  }
  console.log(`✅ ${categoriesSnapshot.size} categorías actualizadas`);

  // Actualizar products
  const productsSnapshot = await getDocs(collection(db, 'products'));
  for (const prodDoc of productsSnapshot.docs) {
    await updateDoc(doc(db, 'products', prodDoc.id), { tenantId });
  }
  console.log(`✅ ${productsSnapshot.size} productos actualizados`);

  console.log('\n🎉 ¡NEGOCIO CONFIGURADO!');
  console.log('========================');
  console.log('Tenant ID: negocio-1');
  console.log('Email: admin@demo.com');
  console.log('Password: demo123');
  console.log('========================');
}

async function configurarDosNegocios(db) {
  console.log('\n🏢🏢 CONFIGURANDO DOS NEGOCIOS\n');

  // NEGOCIO 1
  const tenantId1 = 'negocio-1';
  
  // Actualizar documentos existentes al negocio 1
  const businessSnapshot = await getDocs(collection(db, 'business'));
  if (!businessSnapshot.empty) {
    const businessDoc = businessSnapshot.docs[0];
    await updateDoc(doc(db, 'business', businessDoc.id), { 
      name: 'Restaurante El Sazón',
      tenantId: tenantId1 
    });
    console.log('✅ Negocio 1: business configurado');
  }

  const usersSnapshot = await getDocs(collection(db, 'users'));
  if (!usersSnapshot.empty) {
    const userDoc = usersSnapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), { 
      name: 'Administrador',
      role: 'admin',
      tenantId: tenantId1 
    });
    console.log('✅ Negocio 1: usuario configurado');
  }

  // NEGOCIO 2 - Crear nuevos documentos
  const tenantId2 = 'negocio-2';
  
  // Crear business para negocio 2
  await addDoc(collection(db, 'business'), {
    name: 'Pizzería Roma',
    logo: '🍕',
    logoType: 'emoji',
    tenantId: tenantId2,
    createdAt: Timestamp.now()
  });
  console.log('✅ Negocio 2: business creado');

  // Crear usuario para negocio 2
  await addDoc(collection(db, 'users'), {
    email: 'admin@laroma.com',
    name: 'Carlos Rodríguez',
    role: 'admin',
    tenantId: tenantId2,
    createdAt: Timestamp.now()
  });
  console.log('✅ Negocio 2: usuario creado');

  // Crear categorías para negocio 2
  const categorias = ['Platos Principales', 'Ensaladas', 'Bebidas', 'Postres'];
  for (const cat of categorias) {
    await addDoc(collection(db, 'categories'), {
      name: cat,
      tenantId: tenantId2,
      createdAt: Timestamp.now()
    });
  }
  console.log('✅ Negocio 2: categorías creadas');

  // Crear productos para negocio 2
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
      tenantId: tenantId2,
      createdAt: Timestamp.now()
    });
  }
  console.log('✅ Negocio 2: productos creados');

  console.log('\n🎉 ¡DOS NEGOCIOS CONFIGURADOS!');
  console.log('====================================');
  console.log('NEGOCIO 1: Restaurante El Sazón');
  console.log('Tenant ID: negocio-1');
  console.log('Email: admin@demo.com');
  console.log('Password: demo123');
  console.log('------------------------------------');
  console.log('NEGOCIO 2: Pizzería Roma');
  console.log('Tenant ID: negocio-2');
  console.log('Email: admin@laroma.com');
  console.log('Password: Roma2024!');
  console.log('====================================');
}

// Ejecutar
setupMultitenant();