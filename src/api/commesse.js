const API_BASE_URL = '/api/commesse';
export const getCommesse = async () => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error('Errore nel recupero delle commesse');
    }
    return response.json();
};
export const createCommessa = async (data) => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nella creazione della commessa');
    }
    return response.json();
};
export const updateCommessa = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento della commessa');
    }
    return response.json();
};
export const deleteCommessa = async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della commessa');
    }
};
