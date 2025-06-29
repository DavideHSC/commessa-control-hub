import os
# import pandas as pd
from datetime import datetime
from collections import Counter

# LAYOUT CONTIGEN.TXT - Piano dei Conti Generale (388 bytes)
CONTIGEN_LAYOUT = {
    'TABELLA_ITALSTUDIO': (3, 4),       # pos 4 -> indice 3-4
    'LIVELLO': (4, 5),                  # pos 5 -> indice 4-5
    'CODIFICA': (5, 15),                # pos 6-15 -> indici 5-15
    'DESCRIZIONE': (15, 75),            # pos 16-75 -> indici 15-75
    'TIPO': (75, 76),                   # pos 76 -> indice 75-76
    'SIGLA': (76, 88),                  # pos 77-88 -> indici 76-88
    'CONTROLLO_SEGNO': (88, 89),        # pos 89 -> indice 88-89
    'CONTO_COSTI_RICAVI': (89, 99),     # pos 90-99 -> indici 89-99
    
    # Validità per tipo contabilità
    'VALIDO_IMPRESA_ORD': (99, 100),    # pos 100 -> indice 99-100
    'VALIDO_IMPRESA_SEMPL': (100, 101), # pos 101 -> indice 100-101
    'VALIDO_PROF_ORD': (101, 102),      # pos 102 -> indice 101-102
    'VALIDO_PROF_SEMPL': (102, 103),    # pos 103 -> indice 102-103
    
    # Validità per tipo dichiarazione
    'VALIDO_UNICO_PF': (103, 104),      # pos 104 -> indice 103-104
    'VALIDO_UNICO_SP': (104, 105),      # pos 105 -> indice 104-105
    'VALIDO_UNICO_SC': (105, 106),      # pos 106 -> indice 105-106
    'VALIDO_UNICO_ENC': (106, 107),     # pos 107 -> indice 106-107
    
    # Codici classi fiscali
    'CLASSE_IRPEF_IRES': (107, 117),    # pos 108-117 -> indici 107-117
    'CLASSE_IRAP': (117, 127),          # pos 118-127 -> indici 117-127
    'CLASSE_PROFESSIONISTA': (127, 137), # pos 128-137 -> indici 127-137
    'CLASSE_IRAP_PROF': (137, 147),     # pos 138-147 -> indici 137-147
    'CLASSE_IVA': (147, 157),           # pos 148-157 -> indici 147-157
    
    # Registro professionisti
    'COL_REG_CRONOLOGICO': (157, 161),  # pos 158-161 -> indici 157-161
    'COL_REG_INCASSI_PAG': (161, 165),  # pos 162-165 -> indici 161-165
    
    # Piano dei conti CEE
    'CONTO_DARE': (165, 177),           # pos 166-177 -> indici 165-177
    'CONTO_AVERE': (177, 189),          # pos 178-189 -> indici 177-189
    
    # Altri dati
    'NATURA_CONTO': (189, 193),         # pos 190-193 -> indici 189-193
    'GESTIONE_BENI_AMM': (193, 194),    # pos 194 -> indice 193-194
    'PERC_DED_MANUT': (194, 200),       # pos 195-200 -> indici 194-200
    
    'GRUPPO': (256, 257),               # pos 257 -> indice 256-257
    'CLASSE_DATI_EXTRACONTABILI': (257, 267), # pos 258-267 -> indici 257-267
    'DETTAGLIO_CLI_FOR': (267, 268),    # pos 268 -> indice 267-268
    
    # Descrizioni bilancio
    'DESC_BILANCIO_DARE': (268, 328),   # pos 269-328 -> indici 268-328
    'DESC_BILANCIO_AVERE': (328, 388)   # pos 329-388 -> indici 328-388
}

def parse_line_contigen(line, layout):
    """Estrae i campi dalla riga secondo il layout specificato"""
    record = {}
    for field, (start, end) in layout.items():
        if start < len(line):
            value = line[start:end].strip()
            record[field] = value
        else:
            record[field] = ""
    return record

def get_livello_descrizione(livello):
    """Restituisce la descrizione del livello"""
    livelli = {
        '1': 'Mastro',
        '2': 'Conto', 
        '3': 'Sottoconto'
    }
    return livelli.get(livello, f'Livello {livello}')

def get_tipo_descrizione(tipo):
    """Restituisce la descrizione del tipo conto"""
    tipi = {
        'P': 'Patrimoniale',
        'E': 'Economico',
        'O': "Conto d'ordine",
        'C': 'Cliente',
        'F': 'Fornitore'
    }
    return tipi.get(tipo, f'Tipo {tipo}')

def get_gruppo_descrizione(gruppo):
    """Restituisce la descrizione del gruppo"""
    gruppi = {
        'A': 'Attività',
        'C': 'Costo',
        'N': 'Patrimonio Netto',
        'P': 'Passività',
        'R': 'Ricavo',
        'V': 'Rettifiche di Costo',
        'Z': 'Rettifiche di Ricavo'
    }
    return gruppi.get(gruppo, f'Gruppo {gruppo}')

def get_controllo_segno_descrizione(segno):
    """Restituisce la descrizione del controllo segno"""
    segni = {
        'A': 'Avere',
        'D': 'Dare',
        '': 'Non specificato'
    }
    return segni.get(segno, f'Segno {segno}')

def format_codifica_gerarchica(codifica, livello):
    """Formatta la codifica in modo gerarchico per una migliore visualizzazione"""
    if not codifica:
        return ""
    
    clean_code = codifica.strip()
    if livello == '1':  # Mastro
        return clean_code[:2] if len(clean_code) >= 2 else clean_code
    elif livello == '2':  # Conto
        return clean_code[:4] if len(clean_code) >= 4 else clean_code
    else:  # Sottoconto
        return clean_code

def process_piano_conti():
    """Elabora il file CONTIGEN.TXT"""
    # Percorso corretto del file come da struttura del progetto
    filepath = '../dati_cliente/ContiGen.txt'
    filename = os.path.basename(filepath)
    
    # Prova diversi encoding per gestire file legacy
    encodings_to_try = ['utf-8-sig', 'latin1', 'cp1252', 'iso-8859-1']
    
    for encoding in encodings_to_try:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                lines = f.readlines()
                print(f"✓ Caricato {filename}: {len(lines)} righe (encoding: {encoding})")
                break
        except UnicodeDecodeError:
            continue
        except FileNotFoundError:
            print(f"✗ File {filename} non trovato nel percorso specificato: '{filepath}'")
            return []
        except Exception as e:
            print(f"✗ Errore nel caricamento di {filename}: {e}")
            return []
    else:
        print(f"✗ Impossibile decodificare il file {filename} con nessun encoding supportato")
        return []

    conti = []
    righe_elaborate = 0
    errori = 0
    
    print(f"\nElaborazione Piano dei Conti...")
    
    for i, line in enumerate(lines):
        if len(line.strip()) == 0:
            continue
            
        try:
            if len(line) < 100:  # Controllo lunghezza minima
                print(f"⚠ Riga {i+1} troppo corta: {len(line)} caratteri")
                errori += 1
                continue
                
            # Parsa la riga
            conto = parse_line_contigen(line, CONTIGEN_LAYOUT)
            
            # Arricchisce con descrizioni
            conto['LIVELLO_DESC'] = get_livello_descrizione(conto['LIVELLO'])
            conto['TIPO_DESC'] = get_tipo_descrizione(conto['TIPO'])
            conto['GRUPPO_DESC'] = get_gruppo_descrizione(conto['GRUPPO'])
            conto['CONTROLLO_SEGNO_DESC'] = get_controllo_segno_descrizione(conto['CONTROLLO_SEGNO'])
            conto['CODIFICA_FORMATTATA'] = format_codifica_gerarchica(conto['CODIFICA'], conto['LIVELLO'])
            
            # Flags di validità come boolean
            conto['VALIDO_IMP_ORD_BOOL'] = conto['VALIDO_IMPRESA_ORD'] == 'X'
            conto['VALIDO_IMP_SEMPL_BOOL'] = conto['VALIDO_IMPRESA_SEMPL'] == 'X'
            conto['VALIDO_PROF_ORD_BOOL'] = conto['VALIDO_PROF_ORD'] == 'X'
            conto['VALIDO_PROF_SEMPL_BOOL'] = conto['VALIDO_PROF_SEMPL'] == 'X'
            
            
            conti.append(conto)
            righe_elaborate += 1
            
        except Exception as e:
            print(f"✗ Errore nella riga {i+1}: {e}")
            errori += 1
            continue

    print(f"✓ Elaborate {righe_elaborate} voci del piano dei conti")
    if errori > 0:
        print(f"⚠ Errori riscontrati: {errori}")
    
    return conti

def export_piano_conti_to_excel(conti, filename="piano_dei_conti.xlsx"):
    """Esporta il piano dei conti in Excel con formattazione avanzata"""
    print("\n[INFO] Esportazione in Excel disabilitata per questa esecuzione.")
    return
    
    if not conti:
        print("[AVVISO] Nessun dato da esportare")
        return

    # Prepara i dati per Excel
    excel_data = []
    
    for conto in conti:
        row = {
            # Dati principali
            'Codifica': conto.get('CODIFICA', ''),
            'Codifica Formattata': conto.get('CODIFICA_FORMATTATA', ''),
            'Livello': conto.get('LIVELLO', ''),
            'Livello Descrizione': conto.get('LIVELLO_DESC', ''),
            'Descrizione': conto.get('DESCRIZIONE', ''),
            'Tipo': conto.get('TIPO', ''),
            'Tipo Descrizione': conto.get('TIPO_DESC', ''),
            'Sigla': conto.get('SIGLA', ''),
            'Gruppo': conto.get('GRUPPO', ''),
            'Gruppo Descrizione': conto.get('GRUPPO_DESC', ''),
            'Controllo Segno': conto.get('CONTROLLO_SEGNO', ''),
            'Controllo Segno Desc': conto.get('CONTROLLO_SEGNO_DESC', ''),
            
            # Conti collegati
            'Conto Costi/Ricavi': conto.get('CONTO_COSTI_RICAVI', ''),
            'Conto Dare CEE': conto.get('CONTO_DARE', ''),
            'Conto Avere CEE': conto.get('CONTO_AVERE', ''),
            
            # Validità per tipo contabilità
            'Valido Impresa Ordinaria': conto.get('VALIDO_IMP_ORD_BOOL', False),
            'Valido Impresa Semplificata': conto.get('VALIDO_IMP_SEMPL_BOOL', False),
            'Valido Professionista Ordinario': conto.get('VALIDO_PROF_ORD_BOOL', False),
            'Valido Professionista Semplificato': conto.get('VALIDO_PROF_SEMPL_BOOL', False),
            
            # Classi fiscali
            'Classe IRPEF/IRES': conto.get('CLASSE_IRPEF_IRES', ''),
            'Classe IRAP': conto.get('CLASSE_IRAP', ''),
            'Classe Professionista': conto.get('CLASSE_PROFESSIONISTA', ''),
            'Classe IRAP Professionista': conto.get('CLASSE_IRAP_PROF', ''),
            'Classe IVA': conto.get('CLASSE_IVA', ''),
            
            # Altri dati
            'Natura Conto': conto.get('NATURA_CONTO', ''),
            'Gestione Beni Ammortizzabili': conto.get('GESTIONE_BENI_AMM', ''),
            'Percentuale Deduzione Manutenzione': conto.get('PERC_DED_MANUT', ''),
            'Dettaglio Cliente/Fornitore': conto.get('DETTAGLIO_CLI_FOR', ''),
            
            # Descrizioni bilancio
            'Descrizione Bilancio Dare': conto.get('DESC_BILANCIO_DARE', ''),
            'Descrizione Bilancio Avere': conto.get('DESC_BILANCIO_AVERE', ''),
            
            # Dati extracontabili
            'Classe Dati Extracontabili': conto.get('CLASSE_DATI_EXTRACONTABILI', ''),
            
            # Registro professionisti
            'Colonna Registro Cronologico': conto.get('COL_REG_CRONOLOGICO', ''),
            'Colonna Registro Incassi/Pagamenti': conto.get('COL_REG_INCASSI_PAG', '')
        }
        excel_data.append(row)

    try:
        df = pd.DataFrame(excel_data)
        df.to_excel(filename, index=False, engine='openpyxl')
        
        print(f"\n✅ ESPORTAZIONE PIANO DEI CONTI COMPLETATA!")
        print(f"📁 File creato: {filename}")
        print(f"📊 Voci esportate: {len(excel_data)}")
        
        # Statistiche per livello
        livelli_stats = {}
        for conto in conti:
            livello = conto.get('LIVELLO_DESC', 'N/A')
            livelli_stats[livello] = livelli_stats.get(livello, 0) + 1
            
        print(f"📈 Distribuzione per livello:")
        for livello, count in livelli_stats.items():
            print(f"   - {livello}: {count}")
            
        # Statistiche per tipo
        tipi_stats = {}
        for conto in conti:
            tipo = conto.get('TIPO_DESC', 'N/A')
            tipi_stats[tipo] = tipi_stats.get(tipo, 0) + 1
            
        print(f"📈 Distribuzione per tipo:")
        for tipo, count in tipi_stats.items():
            print(f"   - {tipo}: {count}")
        
    except PermissionError:
        print(f"\n✗ ERRORE: Impossibile scrivere '{filename}'")
        print("  Il file potrebbe essere aperto in Excel. Chiuderlo e riprovare.")
    except Exception as e:
        print(f"\n✗ ERRORE durante la creazione del file Excel: {e}")

def print_summary_piano_conti(conti):
    """Stampa un riepilogo del piano dei conti"""
    if not conti:
        print("\nNessun conto elaborato.")
        return
        
    print(f"\n" + "="*70)
    print(f"📋 RIEPILOGO PIANO DEI CONTI")
    print(f"="*70)
    print(f"📊 Totale voci: {len(conti)}")
    
    # Esempi per livello
    print(f"\n📌 ESEMPI PER LIVELLO:")
    livelli_esempi = {}
    for conto in conti:
        livello = conto.get('LIVELLO_DESC', 'N/A')
        if livello not in livelli_esempi:
            livelli_esempi[livello] = []
        if len(livelli_esempi[livello]) < 3:
            livelli_esempi[livello].append(f"{conto.get('CODIFICA_FORMATTATA', '')} - {conto.get('DESCRIZIONE', '')[:40]}")
    
    for livello, esempi in livelli_esempi.items():
        print(f"\n   {livello}:")
        for esempio in esempi:
            print(f"      • {esempio}")

def find_and_print_duplicates(conti):
    """Trova e stampa i codici duplicati e il loro conteggio."""
    if not conti:
        return
        
    codici = [conto.get('CODIFICA', '') for conto in conti]
    counts = Counter(codici)
    
    duplicates = {codice: count for codice, count in counts.items() if count > 1}
    
    if not duplicates:
        print("\n" + "="*70)
        print("✅ ANALISI DUPLICATI: NESSUN CODICE DUPLICATO TROVATO NEL FILE.")
        print("="*70)
    else:
        print("\n" + "="*70)
        print(f"🚨 ANALISI DUPLICATI: {len(duplicates)} CODICI DUPLICATI TROVATI!")
        print("="*70)
        # Ordina i duplicati per conteggio, dal più alto al più basso
        sorted_duplicates = sorted(duplicates.items(), key=lambda item: item[1], reverse=True)
        for codice, count in sorted_duplicates:
            print(f"   - Codice: '{codice}' | Conteggio: {count}")
        print("-" * 70)
        print(f"   TOTALE Record Duplicati (somma occorrenze > 1): {sum(duplicates.values()) - len(duplicates)}")

# --- ESECUZIONE PRINCIPALE ---
if __name__ == "__main__":
    print("🏦 PARSER PIANO DEI CONTI (CONTIGEN.TXT)")
    print("=" * 60)
    
    conti = process_piano_conti()
    
    if conti:
        # Esegui l'analisi dei duplicati come primo passo dopo il processing
        find_and_print_duplicates(conti)
        
        print_summary_piano_conti(conti)
        print("\n" + "=" * 60)
        print("📊 Esportazione in Excel...")
        export_piano_conti_to_excel(conti)
        print("🎉 ELABORAZIONE COMPLETATA!")
    else:
        print("\n❌ Elaborazione terminata senza risultati.")
        print("Verificare che il file CONTIGEN.TXT sia presente nella cartella 'dati'")