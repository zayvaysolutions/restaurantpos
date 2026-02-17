// EXACTAMENTE IGUAL que en el original
export const Formatters = {
    currency: (amount) => `$${Number(amount).toFixed(2)}`,
    date: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    },
    time: (date) => {
        return new Date(date).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};