const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyAbYxuLKGsNVktHRWonXBWqHJHx0Oi0loA",
    authDomain: "restaurantpos-multi.firebaseapp.com",
    projectId: "restaurantpos-multi"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const usuarios = [
    { email: 'admin@demo.com', password: 'demo123', nombre: 'Administrador' },
    { email: 'cajero@demo.com', password: 'cajero123', nombre: 'Cajero Principal' }
];

async function migrar() {
    for (const u of usuarios) {
        try {
            await createUserWithEmailAndPassword(auth, u.email, u.password);
            console.log(`✅ Usuario creado: ${u.email}`);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`⚠️ Usuario ya existe: ${u.email}`);
            } else {
                console.log(`❌ Error: ${u.email} - ${error.message}`);
            }
        }
    }
}

migrar();