const API_BASE_URL = '/api/voci-analitiche';
export const getVociAnalitiche = async () => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error('Errore nel recupero delle voci analitiche');
    }
    return response.json();
};
export const createVoceAnalitica = async (data) => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nella creazione della voce analitica');
    }
    return response.json();
};
export const updateVoceAnalitica = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento della voce analitica');
    }
    return response.json();
};
export const deleteVoceAnalitica = async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della voce analitica');
    }
};
