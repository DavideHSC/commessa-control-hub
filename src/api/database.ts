import { toast } from "sonner";

export const clearScrittureContabili = async (): Promise<void> => {
  try {
    const response = await fetch('/api/database/scritture', {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Errore durante la cancellazione');
    }

    toast.success('Tabella Scritture Contabili svuotata con successo!');
  } catch (error) {
    console.error('Errore nella chiamata API per svuotare le scritture:', error);
    toast.error(`Si è verificato un errore: ${error.message}`);
    throw error;
  }
}; 