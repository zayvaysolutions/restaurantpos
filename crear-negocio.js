// crear-negocio.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

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

async function crearNegocio() {
  console.log('\n🏢 CREAR NUEVO NEGOCIO');
  console.log('=======================\n');

  // Preguntar datos
  const nombre = await preguntar('Nombre del negocio: ');
  const email = await preguntar('Email del administrador: ');
  const password = await preguntar('Contraseña del administrador: ');
  const adminNombre = await preguntar('Nombre del administrador: ');
  const telefono = await preguntar('Teléfono (opcional): ') || '';
  const direccion = await preguntar('Dirección (opcional): ') || '';

  console.log('\n🚀 Creando negocio...');

  try {
    // Generar ID único para el negocio
    const tenantId = `negocio-${Date.now()}`;
    
    // 1. Crear usuario en Authentication
    console.log('📧 Creando usuario...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    console.log('✅ Usuario creado');

    // 2. Guardar usuario en Firestore
    await addDoc(collection(db, 'users'), {
      uid,
      email,
      name: adminNombre,
      role: 'admin',
      tenantId,
      phone: telefono,
      address: direccion,
      isActive: true,
      createdAt: Timestamp.now()
    });
    console.log('✅ Usuario guardado');

    // 3. Guardar información del negocio
    await addDoc(collection(db, 'business'), {
      name: nombre,
      logo: '🍽️',
      logoType: 'emoji',
      tenantId,
      phone: telefono,
      address: direccion,
      email,
      createdAt: Timestamp.now()
    });
    console.log('✅ Negocio guardado');

    // 4. Crear categorías por defecto
    const categorias = ['Platos Principales', 'Ensaladas', 'Bebidas', 'Postres'];
    for (const cat of categorias) {
      await addDoc(collection(db, 'categories'), {
        name: cat,
        tenantId,
        createdAt: Timestamp.now()
      });
    }
    console.log('✅ Categorías creadas');

    // 5. Crear productos de ejemplo
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
        tenantId,
        createdAt: Timestamp.now()
      });
    }
    console.log('✅ Productos de ejemplo creados');

    console.log('\n🎉 ¡NEGOCIO CREADO CON ÉXITO!');
    console.log('=================================');
    console.log(`🏢 Negocio: ${nombre}`);
    console.log(`🆔 Tenant ID: ${tenantId}`);
    console.log(`📧 Admin: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('=================================');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ El email ya está registrado. Usa otro email.');
    }
  }

  readline.close();
}

function preguntar(pregunta) {
  return new Promise(resolve => readline.question(pregunta, resolve));
}

crearNegocio();