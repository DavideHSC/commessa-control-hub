#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser per CAUSALI.TXT - Causali Contabili
Contabilità Evolution - File ASCII lunghezza fissa 173 bytes (171 + CRLF)

Struttura record:
- FILLER: pos 1-3 (3 caratteri)
- TABELLA ITALSTUDIO: pos 4 (1 carattere)
- CODICE CAUSALE: pos 5-10 (6 caratteri)
- DESCRIZIONE CAUSALE: pos 11-50 (40 caratteri)
- TIPO MOVIMENTO: pos 51 (1 carattere) - C=Contabile, I=Contabile/Iva
- TIPO AGGIORNAMENTO: pos 52 (1 carattere) - I=Iniziale, P=Progressivo, F=Finale
- DATA INIZIO VALIDITA': pos 53-60 (8 caratteri numerici)
- DATA FINE VALIDITA': pos 61-68 (8 caratteri numerici)
- TIPO REGISTRO IVA: pos 69 (1 carattere) - A=Acquisti, C=Corrispettivi, V=Vendite
- SEGNO MOVIMENTO IVA: pos 70 (1 carattere) - I=Incrementa, D=Decrementa
- CONTO IVA: pos 71-80 (10 caratteri)
- GENERAZIONE AUTOFATTURA: pos 81 (1 carattere)
- TIPO AUTOFATTURA GENERATA: pos 82 (1 carattere) - A=Altre, C=Cee, E=Reverse, R=Rsm
- CONTO IVA VENDITE: pos 83-92 (10 caratteri)
- FATTURA IMPORTO 0: pos 93 (1 carattere)
- FATTURA IN VALUTA ESTERA: pos 94 (1 carattere)
- NON CONSIDERARE IN LIQUIDAZIONE IVA: pos 95 (1 carattere)
- IVA ESIGIBILITA' DIFFERITA: pos 96 (1 carattere) - N=Nessuna, E=Emessa/Ricevuta, I=Incasso/Pagamento
- FAT. EMESSA SU REG. CORRISPETTIVI: pos 97 (1 carattere)
- GESTIONE PARTITE: pos 98 (1 carattere) - N=Nessuna, A=Creazione+Chiusura, C=Creazione, H=Creazione+Chiusura
- GESTIONE INTRASTAT: pos 99 (1 carattere)
- GESTIONE RITENUTE/ENASARCO: pos 100 (1 carattere) - R=Ritenuta, E=Enasarco, T=Ritenuta/Enasarco
- VERSAMENTO RITENUTE: pos 101 (1 carattere)
- NOTE MOVIMENTO: pos 102-161 (60 caratteri)
- DESCRIZIONE DOCUMENTO: pos 162-166 (5 caratteri)
- ST. IDENTIFICATIVO ESTERO: pos 167 (1 carattere)
- SCRITTURA RETTIFICA/ASSESTAMENTO: pos 168 (1 carattere)
- NON STAMPARE SU REG. CRON./INC. PAG.: pos 169 (1 carattere)
- MOV. SU REG.IVA NON RIL. AI FINI IVA: pos 170 (1 carattere)
- TIPO MOVIMENTO: pos 171 (1 carattere) - C=Costi, R=Ricavi
- CRLF: pos 172-173 (2 caratteri)
"""

import pandas as pd
import os
from datetime import datetime
import logging

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('causali_parser.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

def parse_date(date_str):
    """
    Converte stringa data DDMMAAAA in formato datetime
    """
    if not date_str or date_str.strip() == '' or date_str == '00000000':
        return None
    
    try:
        date_str = date_str.strip()
        if len(date_str) == 8:
            return datetime.strptime(date_str, '%d%m%Y').date()
        return None
    except ValueError:
        return None

def decode_tipo_movimento(code):
    """Decodifica tipo movimento"""
    mapping = {
        'C': 'Contabile',
        'I': 'Contabile/Iva',
        '': 'Non specificato'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_tipo_aggiornamento(code):
    """Decodifica tipo aggiornamento"""
    mapping = {
        'I': 'Saldo Iniziale',
        'P': 'Saldo Progressivo', 
        'F': 'Saldo Finale',
        '': 'Non specificato'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_tipo_registro_iva(code):
    """Decodifica tipo registro IVA"""
    mapping = {
        'A': 'Acquisti',
        'C': 'Corrispettivi',
        'V': 'Vendite',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_segno_movimento_iva(code):
    """Decodifica segno movimento IVA"""
    mapping = {
        'I': 'Incrementa (+)',
        'D': 'Decrementa (-)',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_tipo_autofattura(code):
    """Decodifica tipo autofattura generata"""
    mapping = {
        'A': 'Altre Gestioni',
        'C': 'CEE',
        'E': 'Reverse Charge',
        'R': 'RSM',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_iva_esigibilita_differita(code):
    """Decodifica IVA esigibilità differita"""
    mapping = {
        'N': 'Nessuna',
        'E': 'Emessa/Ricevuta Fattura',
        'I': 'Incasso/Pagamento Fattura',
        '': 'Non specificato'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_gestione_partite(code):
    """Decodifica gestione partite"""
    mapping = {
        'N': 'Nessuna',
        'A': 'Creazione + Chiusura automatica',
        'C': 'Creazione',
        'H': 'Creazione + Chiusura',
        '': 'Non specificato'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_gestione_ritenute_enasarco(code):
    """Decodifica gestione ritenute/enasarco"""
    mapping = {
        'R': 'Ritenuta',
        'E': 'Enasarco',
        'T': 'Ritenuta/Enasarco',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_tipo_movimento_semplificata(code):
    """Decodifica tipo movimento contabilità semplificata"""
    mapping = {
        'C': 'Costi',
        'R': 'Ricavi',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def parse_boolean_flag(char):
    """Converte carattere in boolean (X = True, altro = False)"""
    return char.strip().upper() == 'X'

def parse_causali_file(file_path):
    """
    Parsing del file CAUSALI.TXT
    """
    causali_data = []
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
                        if len(line) < 171:
                            logging.warning(f"Riga {line_num}: lunghezza insufficiente ({len(line)} < 171)")
                            continue
                            
                        # Estrazione campi (posizioni 1-based convertite in 0-based)
                        # Saltiamo FILLER (pos 1-3) e TABELLA_ITALSTUDIO (pos 4) come negli altri parser
                        record = {
                            'codice_causale': line[4:10].strip(),
                            'descrizione_causale': line[10:50].strip(),
                            'tipo_movimento': line[50:51].strip(),
                            'tipo_movimento_desc': decode_tipo_movimento(line[50:51]),
                            'tipo_aggiornamento': line[51:52].strip(),
                            'tipo_aggiornamento_desc': decode_tipo_aggiornamento(line[51:52]),
                            'data_inizio_validita': parse_date(line[52:60]),
                            'data_fine_validita': parse_date(line[60:68]),
                            'tipo_registro_iva': line[68:69].strip(),
                            'tipo_registro_iva_desc': decode_tipo_registro_iva(line[68:69]),
                            'segno_movimento_iva': line[69:70].strip(),
                            'segno_movimento_iva_desc': decode_segno_movimento_iva(line[69:70]),
                            'conto_iva': line[70:80].strip(),
                            'generazione_autofattura': parse_boolean_flag(line[80:81]),
                            'tipo_autofattura_generata': line[81:82].strip(),
                            'tipo_autofattura_desc': decode_tipo_autofattura(line[81:82]),
                            'conto_iva_vendite': line[82:92].strip(),
                            'fattura_importo_0': parse_boolean_flag(line[92:93]),
                            'fattura_valuta_estera': parse_boolean_flag(line[93:94]),
                            'non_considerare_liquidazione_iva': parse_boolean_flag(line[94:95]),
                            'iva_esigibilita_differita': line[95:96].strip(),
                            'iva_esigibilita_differita_desc': decode_iva_esigibilita_differita(line[95:96]),
                            'fattura_emessa_reg_corrispettivi': parse_boolean_flag(line[96:97]),
                            'gestione_partite': line[97:98].strip(),
                            'gestione_partite_desc': decode_gestione_partite(line[97:98]),
                            'gestione_intrastat': parse_boolean_flag(line[98:99]),
                            'gestione_ritenute_enasarco': line[99:100].strip(),
                            'gestione_ritenute_enasarco_desc': decode_gestione_ritenute_enasarco(line[99:100]),
                            'versamento_ritenute': parse_boolean_flag(line[100:101]),
                            'note_movimento': line[101:161].strip(),
                            'descrizione_documento': line[161:166].strip(),
                            'identificativo_estero_clifor': parse_boolean_flag(line[166:167]),
                            'scrittura_rettifica_assestamento': parse_boolean_flag(line[167:168]),
                            'non_stampare_reg_cronologico': parse_boolean_flag(line[168:169]),
                            'movimento_reg_iva_non_rilevante': parse_boolean_flag(line[169:170]),
                            'tipo_movimento_semplificata': line[170:171].strip() if len(line) > 170 else '',
                            'tipo_movimento_semplificata_desc': decode_tipo_movimento_semplificata(line[170:171]) if len(line) > 170 else 'Non disponibile'
                        }
                        
                        causali_data.append(record)
                        
                        # Log ogni 100 record
                        if len(causali_data) % 100 == 0:
                            logging.info(f"Elaborati {len(causali_data)} record...")
                            
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
    
    if not causali_data:
        logging.error("Nessun dato estratto da tutti gli encoding tentati")
        return None
    
    logging.info(f"Parsing completato:")
    logging.info(f"- Record totali letti: {total_records}")
    logging.info(f"- Record elaborati con successo: {len(causali_data)}")
    logging.info(f"- Record con errori: {error_records}")
    
    return pd.DataFrame(causali_data)

def create_summary_stats(df):
    """
    Crea statistiche di riepilogo
    """
    stats = {
        'Totale Causali': len(df),
        'Causali con Codice': len(df[df['codice_causale'] != '']),
        'Causali Contabili': len(df[df['tipo_movimento'] == 'C']),
        'Causali Contabili/IVA': len(df[df['tipo_movimento'] == 'I']),
        'Causali Acquisti': len(df[df['tipo_registro_iva'] == 'A']),
        'Causali Vendite': len(df[df['tipo_registro_iva'] == 'V']),
        'Causali Corrispettivi': len(df[df['tipo_registro_iva'] == 'C']),
        'Con Autofattura': df['generazione_autofattura'].sum(),
        'Con Gestione Partite': len(df[df['gestione_partite'].isin(['A', 'C', 'H'])]),
        'Con Ritenute/Enasarco': len(df[df['gestione_ritenute_enasarco'].isin(['R', 'E', 'T'])]),
        'Con Gestione Intrastat': df['gestione_intrastat'].sum(),
        'IVA Esigibilità Differita': len(df[df['iva_esigibilita_differita'].isin(['E', 'I'])]),
        'Fatture Importo Zero': df['fattura_importo_0'].sum(),
        'Fatture Valuta Estera': df['fattura_valuta_estera'].sum()
    }
    
    return stats

def main():
    """
    Funzione principale
    """
    # Percorso file di input
    input_file = "dati/CAUSALI.TXT"  # File nella cartella dati
    output_file = "causali_contabili.xlsx"
    
    if not os.path.exists(input_file):
        logging.error(f"File {input_file} non trovato nella directory corrente")
        return
    
    logging.info(f"Inizio elaborazione file: {input_file}")
    
    # Parsing del file
    df_causali = parse_causali_file(input_file)
    
    if df_causali is None or df_causali.empty:
        logging.error("Nessun dato da elaborare")
        return
    
    # Creazione statistiche
    stats = create_summary_stats(df_causali)
    
    # Salvataggio su Excel
    try:
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # Foglio principale con tutte le causali
            df_causali.to_excel(writer, sheet_name='Causali_Contabili', index=False)
            
            # Foglio statistiche
            stats_df = pd.DataFrame(list(stats.items()), columns=['Descrizione', 'Valore'])
            stats_df.to_excel(writer, sheet_name='Statistiche', index=False)
            
            # Fogli separati per tipo
            if len(df_causali[df_causali['tipo_movimento'] == 'C']) > 0:
                df_contabili = df_causali[df_causali['tipo_movimento'] == 'C']
                df_contabili.to_excel(writer, sheet_name='Causali_Solo_Contabili', index=False)
                
            if len(df_causali[df_causali['tipo_movimento'] == 'I']) > 0:
                df_iva = df_causali[df_causali['tipo_movimento'] == 'I']
                df_iva.to_excel(writer, sheet_name='Causali_Contabili_IVA', index=False)
            
            # Causali per registro IVA
            for tipo_reg, nome_foglio in [('A', 'Acquisti'), ('V', 'Vendite'), ('C', 'Corrispettivi')]:
                df_tipo = df_causali[df_causali['tipo_registro_iva'] == tipo_reg]
                if len(df_tipo) > 0:
                    df_tipo.to_excel(writer, sheet_name=f'Reg_IVA_{nome_foglio}', index=False)
                    
            # Causali con gestioni speciali
            df_autofattura = df_causali[df_causali['generazione_autofattura'] == True]
            if len(df_autofattura) > 0:
                df_autofattura.to_excel(writer, sheet_name='Con_Autofattura', index=False)
                
            df_partite = df_causali[df_causali['gestione_partite'].isin(['A', 'C', 'H'])]
            if len(df_partite) > 0:
                df_partite.to_excel(writer, sheet_name='Con_Gestione_Partite', index=False)
                
            df_ritenute = df_causali[df_causali['gestione_ritenute_enasarco'].isin(['R', 'E', 'T'])]
            if len(df_ritenute) > 0:
                df_ritenute.to_excel(writer, sheet_name='Con_Ritenute_Enasarco', index=False)
        
        logging.info(f"File Excel creato: {output_file}")
        
        # Stampa statistiche finali
        print("\n" + "="*80)
        print("STATISTICHE CAUSALI CONTABILI")
        print("="*80)
        for desc, valore in stats.items():
            print(f"{desc:<35}: {valore:>10}")
        print("="*80)
        
        # Mostra alcuni esempi di causali
        print("\nESEMPI DI CAUSALI TROVATE:")
        print("-"*80)
        sample_causali = df_causali.head(10)[['codice_causale', 'descrizione_causale', 'tipo_movimento_desc', 'tipo_registro_iva_desc']]
        for _, row in sample_causali.iterrows():
            print(f"{row['codice_causale']:<8} | {row['descrizione_causale']:<30} | {row['tipo_movimento_desc']:<15} | {row['tipo_registro_iva_desc']}")
        
        logging.info("Elaborazione completata con successo!")
        
    except Exception as e:
        logging.error(f"Errore creazione file Excel: {e}")

if __name__ == "__main__":
    main()