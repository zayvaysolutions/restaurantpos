// setup-multitenant-auth.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, Timestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

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

async function setupMultitenant() {
  console.log('\n🚀 CONFIGURANDO MULTI-TENANT PARA RESTAURANTPOS');
  console.log('==============================================\n');

  try {
    // 1. Autenticarse
    console.log('🔑 Autenticando con Firebase...');
    await signInWithEmailAndPassword(auth, 'admin@demo.com', 'demo123');
    console.log('✅ Autenticación exitosa');

    // 2. Verificar colecciones
    console.log('\n📋 Verificando colecciones existentes...');
    const collections = ['business', 'categories', 'products', 'users'];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      console.log(`   - ${collectionName}: ${snapshot.size} documentos`);
    }

    // 3. Configurar tenant para negocio 1
    console.log('\n🏢 Configurando NEGOCIO 1...');
    const tenantId1 = 'negocio-1';
    
    // Actualizar business
    const businessSnapshot = await getDocs(collection(db, 'business'));
    if (!businessSnapshot.empty) {
      const businessDoc = businessSnapshot.docs[0];
      await updateDoc(doc(db, 'business', businessDoc.id), { 
        tenantId: tenantId1,
        name: 'Restaurante El Sazón'
      });
      console.log('✅ business actualizado');
    }

    // Actualizar users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), { 
        tenantId: tenantId1,
        name: 'Administrador',
        role: 'admin'
      });
      console.log('✅ usuario actualizado');
    }

    // 4. Crear negocio 2
    console.log('\n🏢 Creando NEGOCIO 2...');
    const tenantId2 = 'negocio-2';
    
    // Crear business
    await addDoc(collection(db, 'business'), {
      name: 'Pizzería Roma',
      logo: '🍕',
      logoType: 'emoji',
      tenantId: tenantId2,
      createdAt: Timestamp.now()
    });
    console.log('✅ business creado');

    // Crear usuario
    await addDoc(collection(db, 'users'), {
      email: 'admin@laroma.com',
      name: 'Carlos Rodríguez',
      role: 'admin',
      tenantId: tenantId2,
      createdAt: Timestamp.now()
    });
    console.log('✅ usuario creado');

    console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
    console.log('=======================================');
    console.log('NEGOCIO 1: Restaurante El Sazón');
    console.log('Tenant ID: negocio-1');
    console.log('Email: admin@demo.com');
    console.log('Password: demo123');
    console.log('---------------------------------------');
    console.log('NEGOCIO 2: Pizzería Roma');
    console.log('Tenant ID: negocio-2');
    console.log('Email: admin@laroma.com');
    console.log('Password: demo123');
    console.log('=======================================');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupMultitenant();