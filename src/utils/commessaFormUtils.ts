/**
 * Utility functions for preparing Commessa data for form components
 */

/**
 * Prepara i dati di una commessa per l'uso nel CommessaForm
 * Converte le date da oggetti Date a stringhe formato YYYY-MM-DD per input HTML
 * 
 * @param commessa - Dati commessa dal backend
 * @returns Dati formattati per il form
 */
export function prepareCommessaForForm(commessa: any): Record<string, unknown> {
  if (!commessa) return {};

  return {
    ...commessa,
    // Conversione date per input HTML
    dataInizio: commessa.dataInizio ? new Date(commessa.dataInizio).toISOString().split('T')[0] : undefined,
    dataFine: commessa.dataFine ? new Date(commessa.dataFine).toISOString().split('T')[0] : undefined,
    // Assicurati che il clienteId sia presente (per compatibilità)
    clienteId: commessa.clienteId || (commessa.cliente && 'id' in commessa.cliente ? commessa.cliente.id : '') || '',
  };
}

/**
 * Converte i dati dal form per l'invio al backend
 * Converte le date da stringhe YYYY-MM-DD a oggetti Date ISO
 * 
 * @param formData - Dati dal form
 * @returns Dati formattati per il backend
 */
export function prepareFormDataForApi(formData: Record<string, unknown>): Record<string, unknown> {
  const prepared = { ...formData };

  // Conversione date per API
  if (prepared.dataInizio) {
    prepared.dataInizio = new Date(prepared.dataInizio as string).toISOString();
  }
  if (prepared.dataFine) {
    prepared.dataFine = new Date(prepared.dataFine as string).toISOString();
  }

  return prepared;
}
