#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser per CODPAGAM.TXT - Codici Pagamento
Contabilità Evolution - File ASCII lunghezza fissa 70 bytes (68 + CRLF)

Struttura record:
- FILLER: pos 1-3 (3 caratteri) - SALTATO
- TABELLA ITALSTUDIO: pos 4 (1 carattere) - SALTATO  
- CODICE PAGAMENTO: pos 5-12 (8 caratteri)
- DESCRIZIONE: pos 13-52 (40 caratteri)
- CONTO INCASSO/PAGAMENTO: pos 53-62 (10 caratteri)
- CALCOLA CON GIORNI COMMERCIALI: pos 63 (1 carattere) - X = True
- CONSIDERA PERIODI DI CHIUSURA: pos 64 (1 carattere) - X = True
- SUDDIVISIONE: pos 65 (1 carattere) - D=Dettaglio importi, T=Totale documento
- INIZIO SCADENZA: pos 66 (1 carattere) - D=Data documento, F=Fine Mese, R=Data registrazione, P=Data registro Iva, N=Non determinata
- NUMERO RATE: pos 67-68 (2 caratteri numerici)
- CRLF: pos 69-70 (2 caratteri)
"""

import pandas as pd
import os
import logging

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('codpagam_parser.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

def parse_integer(value_str):
    """
    Converte stringa numerica in integer
    """
    if not value_str or value_str.strip() == '':
        return None
    
    try:
        return int(value_str.strip())
    except ValueError:
        return None

def decode_suddivisione(code):
    """Decodifica suddivisione"""
    mapping = {
        'D': 'Dettaglio importi',
        'T': 'Totale documento',
        '': 'Non specificato'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_inizio_scadenza(code):
    """Decodifica inizio scadenza"""
    mapping = {
        'D': 'Data documento',
        'F': 'Fine Mese',
        'R': 'Data registrazione',
        'P': 'Data registro IVA',
        'N': 'Non determinata',
        '': 'Non specificato'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def parse_boolean_flag(char):
    """Converte carattere in boolean (X = True, altro = False)"""
    return char.strip().upper() == 'X'

def parse_codpagam_file(file_path):
    """
    Parsing del file CODPAGAM.TXT
    """
    codici_pagamento_data = []
    total_records = 0
    error_records = 0
    
    # Prova diversi encoding
    encodings = ['utf-8', 'latin1', 'cp1252']
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as file:
                logging.info(f"File aperto con encoding: {encoding}")
                
                for line_num, line in enumerate(file, 1):
                    total_records += 1
                    
                    try:
                        # Rimuovi CRLF finale se presente
                        if line.endswith('\r\n'):
                            line = line[:-2]
                        elif line.endswith('\n'):
                            line = line[:-1]
                        
                        # Verifica lunghezza minima
                        if len(line) < 68:
                            logging.warning(f"Riga {line_num}: lunghezza insufficiente ({len(line)} < 68)")
                            continue
                            
                        # Estrazione campi (posizioni 1-based convertite in 0-based)
                        # Saltiamo FILLER (pos 1-3) e TABELLA_ITALSTUDIO (pos 4)
                        record = {
                            'codice_pagamento': line[4:12].strip(),
                            'descrizione': line[12:52].strip(),
                            'conto_incasso_pagamento': line[52:62].strip(),
                            'calcola_giorni_commerciali': parse_boolean_flag(line[62:63]),
                            'considera_periodi_chiusura': parse_boolean_flag(line[63:64]),
                            'suddivisione': line[64:65].strip(),
                            'suddivisione_desc': decode_suddivisione(line[64:65]),
                            'inizio_scadenza': line[65:66].strip(),
                            'inizio_scadenza_desc': decode_inizio_scadenza(line[65:66]),
                            'numero_rate': parse_integer(line[66:68]) if len(line) >= 68 else None
                        }
                        
                        # Filtra record vuoti (senza codice pagamento)
                        if record['codice_pagamento']:
                            codici_pagamento_data.append(record)
                        
                        # Log ogni 50 record
                        if len(codici_pagamento_data) % 50 == 0 and len(codici_pagamento_data) > 0:
                            logging.info(f"Elaborati {len(codici_pagamento_data)} record...")
                            
                    except Exception as e:
                        error_records += 1
                        logging.error(f"Errore elaborazione riga {line_num}: {e}")
                        continue
                
                break  # Se arriviamo qui, l'encoding ha funzionato
                
        except UnicodeDecodeError:
            logging.warning(f"Encoding {encoding} fallito, provo il prossimo...")
            continue
        except FileNotFoundError:
            logging.error(f"File non trovato: {file_path}")
            return None
        except Exception as e:
            logging.error(f"Errore lettura file con encoding {encoding}: {e}")
            continue
    
    if not codici_pagamento_data:
        logging.error("Nessun dato estratto da tutti gli encoding tentati")
        return None
    
    logging.info(f"Parsing completato:")
    logging.info(f"- Record totali letti: {total_records}")
    logging.info(f"- Record elaborati con successo: {len(codici_pagamento_data)}")
    logging.info(f"- Record con errori: {error_records}")
    
    return pd.DataFrame(codici_pagamento_data)

def create_summary_stats(df):
    """
    Crea statistiche di riepilogo
    """
    stats = {
        'Totale Codici Pagamento': len(df),
        'Codici Attivi': len(df[df['codice_pagamento'] != '']),
        'Con Conto Associato': len(df[df['conto_incasso_pagamento'] != '']),
        'Calcolo Giorni Commerciali': df['calcola_giorni_commerciali'].sum(),
        'Considera Periodi Chiusura': df['considera_periodi_chiusura'].sum(),
        'Suddivisione Dettaglio': len(df[df['suddivisione'] == 'D']),
        'Suddivisione Totale': len(df[df['suddivisione'] == 'T']),
        'Inizio da Data Documento': len(df[df['inizio_scadenza'] == 'D']),
        'Inizio da Fine Mese': len(df[df['inizio_scadenza'] == 'F']),
        'Inizio da Registrazione': len(df[df['inizio_scadenza'] == 'R']),
        'Pagamenti Rateali': len(df[df['numero_rate'].notna() & (df['numero_rate'] > 1)]),
        'Pagamenti Singoli': len(df[df['numero_rate'].notna() & (df['numero_rate'] == 1)])
    }
    
    # Statistiche numero rate
    if 'numero_rate' in df.columns:
        rate_counts = df['numero_rate'].value_counts().head(10)
        for rate, count in rate_counts.items():
            if pd.notna(rate) and rate > 1:
                stats[f'Pagamenti a {int(rate)} Rate'] = count
    
    return stats

def analyze_payment_methods(df):
    """
    Analizza i metodi di pagamento più comuni
    """
    # Analizza le descrizioni per identificare tipi di pagamento
    payment_types = {
        'Bonifico': df[df['descrizione'].str.contains('BONIF|bonif', case=False, na=False)],
        'Contanti': df[df['descrizione'].str.contains('CONTAN|contan', case=False, na=False)],
        'Assegno': df[df['descrizione'].str.contains('ASSEGN|assegn', case=False, na=False)],
        'Rimessa': df[df['descrizione'].str.contains('RIMESS|rimess', case=False, na=False)],
        'Rate': df[df['descrizione'].str.contains('RATE|rate|RAT', case=False, na=False)],
        'Come Convenuto': df[df['descrizione'].str.contains('COME|come|CONVEN|conven', case=False, na=False)]
    }
    
    analysis = {}
    for tipo, df_tipo in payment_types.items():
        if len(df_tipo) > 0:
            analysis[f'Metodo_{tipo}'] = len(df_tipo)
    
    return analysis

def main():
    """
    Funzione principale
    """
    # Percorso file di input
    input_file = "dati/CODPAGAM.TXT"
    output_file = "codici_pagamento.xlsx"
    
    if not os.path.exists(input_file):
        logging.error(f"File {input_file} non trovato")
        return
    
    logging.info(f"Inizio elaborazione file: {input_file}")
    
    # Parsing del file
    df_codici_pagamento = parse_codpagam_file(input_file)
    
    if df_codici_pagamento is None or df_codici_pagamento.empty:
        logging.error("Nessun dato da elaborare")
        return
    
    # Creazione statistiche
    stats = create_summary_stats(df_codici_pagamento)
    payment_analysis = analyze_payment_methods(df_codici_pagamento)
    
    # Unisci le statistiche
    all_stats = {**stats, **payment_analysis}
    
    # Salvataggio su Excel
    try:
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # Foglio principale con tutti i codici pagamento
            df_codici_pagamento.to_excel(writer, sheet_name='Codici_Pagamento', index=False)
            
            # Foglio statistiche
            stats_df = pd.DataFrame(list(all_stats.items()), columns=['Descrizione', 'Valore'])
            stats_df.to_excel(writer, sheet_name='Statistiche', index=False)
            
            # Fogli separati per caratteristiche
            
            # Per suddivisione
            for sudd, nome_foglio in [('D', 'Dettaglio_Importi'), ('T', 'Totale_Documento')]:
                df_sudd = df_codici_pagamento[df_codici_pagamento['suddivisione'] == sudd]
                if len(df_sudd) > 0:
                    df_sudd.to_excel(writer, sheet_name=nome_foglio, index=False)
            
            # Per inizio scadenza
            for inizio, nome_foglio in [('D', 'Data_Documento'), ('F', 'Fine_Mese'), ('R', 'Data_Registrazione')]:
                df_inizio = df_codici_pagamento[df_codici_pagamento['inizio_scadenza'] == inizio]
                if len(df_inizio) > 0:
                    df_inizio.to_excel(writer, sheet_name=f'Inizio_{nome_foglio}', index=False)
            
            # Pagamenti rateali
            df_rateali = df_codici_pagamento[df_codici_pagamento['numero_rate'].notna() & (df_codici_pagamento['numero_rate'] > 1)]
            if len(df_rateali) > 0:
                df_rateali.to_excel(writer, sheet_name='Pagamenti_Rateali', index=False)
            
            # Con conto associato
            df_con_conto = df_codici_pagamento[df_codici_pagamento['conto_incasso_pagamento'] != '']
            if len(df_con_conto) > 0:
                df_con_conto.to_excel(writer, sheet_name='Con_Conto_Associato', index=False)
            
            # Metodi di pagamento principali
            payment_methods = {
                'Bonifici': df_codici_pagamento[df_codici_pagamento['descrizione'].str.contains('BONIF|bonif', case=False, na=False)],
                'Contanti': df_codici_pagamento[df_codici_pagamento['descrizione'].str.contains('CONTAN|contan', case=False, na=False)],
                'Assegni': df_codici_pagamento[df_codici_pagamento['descrizione'].str.contains('ASSEGN|assegn', case=False, na=False)],
                'Rimesse': df_codici_pagamento[df_codici_pagamento['descrizione'].str.contains('RIMESS|rimess', case=False, na=False)]
            }
            
            for metodo, df_metodo in payment_methods.items():
                if len(df_metodo) > 0:
                    df_metodo.to_excel(writer, sheet_name=metodo, index=False)
        
        logging.info(f"File Excel creato: {output_file}")
        
        # Stampa statistiche finali
        print("\n" + "="*80)
        print("STATISTICHE CODICI PAGAMENTO")
        print("="*80)
        for desc, valore in all_stats.items():
            print(f"{desc:<35}: {valore:>10}")
        print("="*80)
        
        # Mostra alcuni esempi di codici pagamento
        print("\nESEMPI DI CODICI PAGAMENTO TROVATI:")
        print("-"*90)
        sample_codici = df_codici_pagamento.head(15)[['codice_pagamento', 'descrizione', 'suddivisione_desc', 'numero_rate']]
        for _, row in sample_codici.iterrows():
            rate = f"{int(row['numero_rate'])} rate" if pd.notna(row['numero_rate']) and row['numero_rate'] > 1 else "Singolo"
            if pd.notna(row['numero_rate']) and row['numero_rate'] == 1:
                rate = "1 rata"
            elif pd.isna(row['numero_rate']):
                rate = "N/A"
            print(f"{row['codice_pagamento']:<12} | {row['descrizione']:<35} | {row['suddivisione_desc']:<18} | {rate}")
        
        # Analisi metodi di pagamento
        print("\nANALISI METODI DI PAGAMENTO:")
        print("-"*50)
        for metodo, df_metodo in payment_methods.items():
            if len(df_metodo) > 0:
                print(f"{metodo:<15}: {len(df_metodo):>3} codici")
        
        logging.info("Elaborazione completata con successo!")
        
    except Exception as e:
        logging.error(f"Errore creazione file Excel: {e}")

if __name__ == "__main__":
    main()