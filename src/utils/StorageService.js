import { CONFIG } from '../constants/config';

// EXACTAMENTE IGUAL que en el original
export const StorageService = {
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            return false;
        }
    },
    
    load: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error cargando de localStorage:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error eliminando de localStorage:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
            return false;
        }
    }
};