// src/firebase/services.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

// Servicio de Productos
export const productService = {
  // Obtener todos los productos activos
  getAll: async () => {
    const q = query(
      collection(db, 'products'),
      where('deleted', '==', false),
      orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  },

  // Obtener productos eliminados
  getDeleted: async () => {
    const q = query(
      collection(db, 'products'),
      where('deleted', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Crear producto
  create: async (productData) => {
    const newProduct = {
      ...productData,
      deleted: false,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'products'), newProduct);
    return { id: docRef.id, ...newProduct };
  },

  // Actualizar producto
  update: async (productId, productData) => {
    const docRef = doc(db, 'products', productId.toString());
    await updateDoc(docRef, { 
      ...productData, 
      updatedAt: Timestamp.now() 
    });
  },

  // Eliminar (soft delete)
  delete: async (productId) => {
    const docRef = doc(db, 'products', productId.toString());
    await updateDoc(docRef, { 
      deleted: true, 
      deletedAt: Timestamp.now() 
    });
  },

  // Restaurar producto
  restore: async (productId) => {
    const docRef = doc(db, 'products', productId.toString());
    await updateDoc(docRef, { 
      deleted: false, 
      deletedAt: null 
    });
  }
};

// Servicio de Ventas
export const saleService = {
  // Obtener todas las ventas
  getAll: async () => {
    const q = query(
      collection(db, 'sales'),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  },

  // Crear venta
  create: async (saleData) => {
    const newSale = {
      ...saleData,
      date: Timestamp.fromDate(new Date(saleData.date)),
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'sales'), newSale);
    return { id: docRef.id, ...newSale };
  },

  // Anular venta
  cancel: async (saleId, cancellationData) => {
    const docRef = doc(db, 'sales', saleId.toString());
    await updateDoc(docRef, {
      cancelled: true,
      cancelledAt: Timestamp.now(),
      ...cancellationData
    });
  }
};

// Servicio de Categorías
export const categoryService = {
  getAll: async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(doc => doc.data().name);
  },

  add: async (categoryName) => {
    await addDoc(collection(db, 'categories'), {
      name: categoryName,
      createdAt: Timestamp.now()
    });
  },

  remove: async (categoryName) => {
    const q = query(collection(db, 'categories'), where('name', '==', categoryName));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  }
};

// Servicio de Usuarios
export const userService = {
  getAll: async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  },

  create: async (userData) => {
    const newUser = {
      ...userData,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'users'), newUser);
    return { id: docRef.id, ...newUser };
  },

  update: async (userId, userData) => {
    const docRef = doc(db, 'users', userId.toString());
    await updateDoc(docRef, { 
      ...userData, 
      updatedAt: Timestamp.now() 
    });
  },

  delete: async (userId) => {
    const docRef = doc(db, 'users', userId.toString());
    await deleteDoc(docRef);
  }
};

// Servicio de Configuración del Negocio
export const businessService = {
  get: async () => {
    const snapshot = await getDocs(collection(db, 'business'));
    if (snapshot.empty) {
      return { name: 'Mi Restaurante', logo: '🍽️', logoType: 'emoji' };
    }
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  },

  update: async (businessData) => {
    const snapshot = await getDocs(collection(db, 'business'));
    if (snapshot.empty) {
      const docRef = await addDoc(collection(db, 'business'), {
        ...businessData,
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...businessData };
    } else {
      const docRef = doc(db, 'business', snapshot.docs[0].id);
      await updateDoc(docRef, {
        ...businessData,
        updatedAt: Timestamp.now()
      });
      return { id: snapshot.docs[0].id, ...businessData };
    }
  }
};