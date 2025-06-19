import { Commessa, DashboardData, ScritturaContabile, VoceAnalitica, CommessaDashboard } from "@/types";
import { getCommesse } from ".";
import { getRegistrazioni } from "./registrazioni";
import { getVociAnalitiche } from "./index";

/**
 * Simula una chiamata API per recuperare e aggregare i dati necessari
 * per la dashboard di controllo di gestione.
 * @returns Una Promise che risolve con l'oggetto `DashboardData`.
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  console.log("Inizio aggregazione dati per la dashboard...");

  // 1. Recupera tutti i dati di base
  const commesse: Commessa[] = await getCommesse();
  const registrazioni: ScritturaContabile[] = await getRegistrazioni();
  const vociAnalitiche: VoceAnalitica[] = await getVociAnalitiche();

  // Struttura per mappare facilmente id a nome
  const mappaVociAnalitiche = new Map(vociAnalitiche.map(v => [v.id, v.nome]));

  // 2. Calcola i dati per ogni commessa
  const commesseDashboard = commesse.map((commessa) => {
    // Calcolo Budget Totale per la commessa
    const budgetTotale = Object.values(commessa.budget).reduce((acc, valore) => acc + valore, 0);

    // Calcolo Consuntivo Totale e per Voce Analitica
    const consuntivoPerVoce: { [voceId: string]: number } = {};
    let consuntivoTotale = 0;

    registrazioni.forEach(reg => {
      reg.righe.forEach(riga => {
        riga.allocazioni.forEach(alloc => {
          if (alloc.commessaId === commessa.id) {
            const importo = alloc.importo;
            consuntivoTotale += importo;
            
            consuntivoPerVoce[alloc.voceAnaliticaId] = (consuntivoPerVoce[alloc.voceAnaliticaId] || 0) + importo;
          }
        });
      });
    });

    // Creazione dei dettagli analitici
    const dettagli = Object.keys(commessa.budget).map(voceId => {
      const budget = commessa.budget[voceId] || 0;
      const consuntivo = consuntivoPerVoce[voceId] || 0;
      return {
        voceAnaliticaId: voceId,
        voceAnaliticaNome: mappaVociAnalitiche.get(voceId) || 'Non definita',
        budget,
        consuntivo,
        scostamento: budget - consuntivo
      };
    });

    // Aggiungiamo anche le voci di costo a consuntivo che non erano a budget
    Object.keys(consuntivoPerVoce).forEach(voceId => {
        if (!commessa.budget[voceId]) {
            const consuntivo = consuntivoPerVoce[voceId];
            dettagli.push({
                voceAnaliticaId: voceId,
                voceAnaliticaNome: mappaVociAnalitiche.get(voceId) || 'Non definita',
                budget: 0,
                consuntivo,
                scostamento: -consuntivo
            });
        }
    });


    return {
      commessaId: commessa.id,
      commessaNome: commessa.nome,
      budgetTotale,
      consuntivoTotale,
      scostamento: budgetTotale - consuntivoTotale,
      avanzamentoPercentuale: budgetTotale > 0 ? (consuntivoTotale / budgetTotale) * 100 : 0,
      dettagli
    };
  });

  // 3. Calcola i totali generali
  const totaleGenerale = {
    budget: commesseDashboard.reduce((acc, c) => acc + c.budgetTotale, 0),
    consuntivo: commesseDashboard.reduce((acc, c) => acc + c.consuntivoTotale, 0),
    scostamento: 0
  };
  totaleGenerale.scostamento = totaleGenerale.budget - totaleGenerale.consuntivo;

  const dashboardData: DashboardData = {
    commesse: commesseDashboard,
    totaleGenerale
  };

  console.log("Dati dashboard aggregati:", dashboardData);

  // Simula il ritardo di una chiamata di rete
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(dashboardData);
    }, 500);
  });
}; 