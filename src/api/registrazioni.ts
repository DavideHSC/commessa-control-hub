import { ScritturaContabile } from "@/types";

// Database in memoria per le scritture contabili.
// In un'applicazione reale, questo sarebbe gestito da un server e un database.
let scrittureInMemoria: ScritturaContabile[] = [];

/**
 * Salva una nuova scrittura contabile nel nostro store in memoria.
 * Simula una chiamata API POST.
 * @param scrittura La scrittura contabile da salvare.
 * @returns Una Promise che si risolve con la scrittura salvata.
 */
export const salvaRegistrazione = (scrittura: ScritturaContabile): Promise<ScritturaContabile> => {
    return new Promise((resolve) => {
        // Simula un ritardo di rete
        setTimeout(() => {
            const nuovaScrittura = { ...scrittura, id: `reg-${Date.now()}` };
            scrittureInMemoria.push(nuovaScrittura);
            console.log("Database in memoria aggiornato:", scrittureInMemoria);
            resolve(nuovaScrittura);
        }, 500);
    });
};

/**
 * Recupera tutte le scritture contabili dallo store in memoria.
 * Simula una chiamata API GET.
 * @returns Una Promise che si risolve con l'array di tutte le scritture.
 */
export const getRegistrazioni = (): Promise<ScritturaContabile[]> => {
    return new Promise((resolve) => {
        // Simula un ritardo di rete
        setTimeout(() => {
            // Restituisce una copia per evitare mutazioni dirette dell'array
            resolve([...scrittureInMemoria]);
        }, 300);
    });
}; 