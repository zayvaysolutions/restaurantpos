// setup-simple.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, Timestamp } = require('firebase/firestore');

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

async function setup() {
  console.log('🚀 CONFIGURANDO...');
  
  try {
    // 1. Verificar conexión
    console.log('📡 Probando conexión...');
    const testSnapshot = await getDocs(collection(db, 'business'));
    console.log(`✅ Conexión exitosa. Business tiene ${testSnapshot.size} documentos.`);
    
    // 2. Crear segundo negocio directamente
    console.log('\n🏢 Creando segundo negocio...');
    
    const negocio2 = {
      name: 'Pizzería Roma',
      logo: '🍕',
      logoType: 'emoji',
      tenantId: 'negocio-2',
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'business'), negocio2);
    console.log('✅ Negocio creado con ID:', docRef.id);
    
    // 3. Crear usuario para negocio 2
    const usuario2 = {
      email: 'admin@laroma.com',
      name: 'Carlos Rodríguez',
      role: 'admin',
      tenantId: 'negocio-2',
      createdAt: Timestamp.now()
    };
    
    const userRef = await addDoc(collection(db, 'users'), usuario2);
    console.log('✅ Usuario creado con ID:', userRef.id);
    
    console.log('\n🎉 LISTO!');
    console.log('====================');
    console.log('Email: admin@laroma.com');
    console.log('Password: [CREAR EN AUTHENTICATION]');
    console.log('====================');
    
  } catch (error) {
    console.error('❌ ERROR DETALLADO:');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('Error completo:', error);
  }
}

setup();