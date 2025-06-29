#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser per CODICIVA.TXT - Codici IVA
Contabilità Evolution - File ASCII lunghezza fissa 164 bytes (162 + CRLF)

Struttura record:
- FILLER: pos 1-3 (3 caratteri) - SALTATO
- TABELLA ITALSTUDIO: pos 4 (1 carattere) - SALTATO
- CODICE IVA: pos 5-8 (4 caratteri)
- DESCRIZIONE: pos 9-48 (40 caratteri)
- TIPO CALCOLO: pos 49 (1 carattere) - N=Nessuno, O=Normale, A=Solo imposta, I=Imposta non assolta, S=Scorporo, T=Scorporo intrattenimento, E=Esente/Non imponibile/Escluso, V=Ventilazione corrispettivi
- ALIQUOTA IVA: pos 50-55 (6 caratteri numerici - formato 999.99)
- PERCENTUALE INDETRAIBILITA': pos 56-58 (3 caratteri numerici)
- NOTE: pos 59-98 (40 caratteri)
- DATA INIZIO VALIDITA': pos 99-106 (8 caratteri - GGMMAAAA)
- DATA FINE VALIDITA': pos 107-114 (8 caratteri - GGMMAAAA)
- IMPONIBILE 50% CORRISPETTIVI: pos 115 (1 carattere)
- IMPOSTA INTRATTENIMENTI: pos 116-117 (2 caratteri)
- VENTILAZIONE ALIQUOTA DIVERSA: pos 118 (1 carattere)
- ALIQUOTA DIVERSA: pos 119-124 (6 caratteri - formato 999.99)
- PLAFOND ACQUISTI: pos 125 (1 carattere) - I=Interno/Intra, E=Importazioni
- MONTE ACQUISTI: pos 126 (1 carattere)
- PLAFOND VENDITE: pos 127 (1 carattere) - E=Esportazioni
- NO VOLUME D'AFFARI PLAFOND: pos 128 (1 carattere)
- GESTIONE PRO RATA: pos 129 (1 carattere) - D=Volume d'affari, E=Esente, N=Escluso
- ACQ. OPERAZ. IMPONIBILI OCCASIONALI: pos 130 (1 carattere)
- COMUNICAZIONE DATI IVA VENDITE: pos 131 (1 carattere)
- AGEVOLAZIONI SUBFORNITURE: pos 132 (1 carattere)
- COMUNICAZIONE DATI IVA ACQUISTI: pos 133 (1 carattere)
- AUTOFATTURA REVERSE CHARGE: pos 134 (1 carattere)
- OPERAZIONE ESENTE OCCASIONALE: pos 135 (1 carattere)
- CES. ART.38 QUATER C.2 (STORNO IVA): pos 136 (1 carattere)
- PERC. DA DETRARRE SU EXPORT: pos 137-142 (6 caratteri - formato 999.99)
- ACQUISTI/CESSIONI: pos 143 (1 carattere) - A=Tabella A1, B=Beni Attività connesse
- PERCENTUALE DI COMPENSAZIONE: pos 144-149 (6 caratteri - formato 999.99)
- BENI AMMORTIZZABILI: pos 150 (1 carattere)
- INDICATORE TERRITORIALE VENDITE: pos 151-152 (2 caratteri)
- PROVVIGIONI DM 340/99 ART.7 C.3: pos 153 (1 carattere)
- INDICATORE TERRITORIALE ACQUISTI: pos 154-155 (2 caratteri)
- METODO DA APPLICARE: pos 156 (1 carattere) - T=Analitico/Globale, F=Forfetario
- PERCENTUALE FORFETARIA: pos 157-158 (2 caratteri)
- ANALITICO (BENI AMMORTIZZABILI): pos 159 (1 carattere)
- QUOTA FORFETARIA: pos 160 (1 carattere)
- ACQUISTI INTRACOMUNITARI: pos 161 (1 carattere)
- CESSIONE PRODOTTI EDITORIALI: pos 162 (1 carattere)
- CRLF: pos 163-164 (2 caratteri)
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
        logging.FileHandler('codiciva_parser.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

def parse_date(date_str):
    """
    Converte stringa data GGMMAAAA in formato datetime
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

def parse_decimal(value_str, decimals=2):
    """
    Converte stringa numerica in float con decimali
    """
    if not value_str or value_str.strip() == '':
        return None
    
    try:
        value_str = value_str.strip()
        if decimals == 2:
            # Formato 999.99 -> inserisce punto prima delle ultime 2 cifre
            if len(value_str) >= 3:
                integer_part = value_str[:-2]
                decimal_part = value_str[-2:]
                return float(f"{integer_part}.{decimal_part}")
        return float(value_str)
    except ValueError:
        return None

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

def decode_tipo_calcolo(code):
    """Decodifica tipo calcolo"""
    mapping = {
        'N': 'Nessuno',
        'O': 'Normale',
        'A': 'Solo imposta',
        'I': 'Imposta non assolta',
        'S': 'Scorporo',
        'T': 'Scorporo per intrattenimento',
        'E': 'Esente/Non imponibile/Escluso',
        'V': 'Ventilazione corrispettivi',
        '': 'Non specificato'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_plafond_acquisti(code):
    """Decodifica plafond acquisti"""
    mapping = {
        'I': 'Interno/Intra',
        'E': 'Importazioni',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_plafond_vendite(code):
    """Decodifica plafond vendite"""
    mapping = {
        'E': 'Esportazioni',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_gestione_pro_rata(code):
    """Decodifica gestione pro rata"""
    mapping = {
        'D': "Volume d'affari",
        'E': 'Esente',
        'N': 'Escluso',
        '': 'Non specificato'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_comunicazione_vendite(code):
    """Decodifica comunicazione dati IVA vendite"""
    mapping = {
        '1': 'Op.Attive CD1.1',
        '2': 'Op.Attive (di cui intra) CD1.4',
        '3': 'Op.Attive (di cui non impon.) CD1.2',
        '4': 'Op.Attive (di cui esenti) CD1.3',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_comunicazione_acquisti(code):
    """Decodifica comunicazione dati IVA acquisti"""
    mapping = {
        '1': 'Op.Passive CD2.1',
        '2': 'Op.Passive (di cui intra) CD2.4',
        '3': 'Importazioni oro/argento CD3.1 CD3.2',
        '4': 'Op.Passive (di cui non impon.) CD2.2',
        '5': 'Op.Passive (di cui esenti) CD2.3',
        '6': 'Importazioni rottami CD3.3 CD3.4',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_acquisti_cessioni(code):
    """Decodifica acquisti/cessioni"""
    mapping = {
        'A': 'Tabella A1',
        'B': 'Beni Attività connesse',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_indicatore_territoriale_vendite(code):
    """Decodifica indicatore territoriale vendite"""
    mapping = {
        'VC': 'Vendita CEE',
        'VX': 'Vendita Extra CEE',
        'VM': 'Vendita Mista CEE/Extra CEE',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_indicatore_territoriale_acquisti(code):
    """Decodifica indicatore territoriale acquisti"""
    mapping = {
        'AC': 'Acquisto CEE',
        'AX': 'Acquisto Extra CEE',
        'MC': 'Acquisto misto parte CEE',
        'MX': 'Acquisto misto parte Extra CEE',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_metodo_applicare(code):
    """Decodifica metodo da applicare"""
    mapping = {
        'T': 'Analitico/Globale',
        'F': 'Forfetario',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_percentuale_forfetaria(code):
    """Decodifica percentuale forfetaria"""
    mapping = {
        '25': '25%',
        '50': '50%',
        '60': '60%',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_quota_forfetaria(code):
    """Decodifica quota forfetaria"""
    mapping = {
        '1': "1/10 dell'imposta",
        '2': "1/2 dell'imposta",
        '3': "1/3 dell'imposta",
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def decode_imposta_intrattenimenti(code):
    """Decodifica imposta intrattenimenti"""
    mapping = {
        '6': '6%',
        '8': '8%',
        '10': '10%',
        '16': '16%',
        '60': '60%',
        '': 'Non applicabile'
    }
    return mapping.get(code.strip(), f'Codice sconosciuto: {code}')

def parse_boolean_flag(char):
    """Converte carattere in boolean (X = True, altro = False)"""
    return char.strip().upper() == 'X'

def parse_codiciva_file(file_path):
    """
    Parsing del file CODICIVA.TXT
    """
    codici_iva_data = []
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
                        if len(line) < 162:
                            logging.warning(f"Riga {line_num}: lunghezza insufficiente ({len(line)} < 162)")
                            continue
                            
                        # Estrazione campi (posizioni 1-based convertite in 0-based)
                        # Saltiamo FILLER (pos 1-3) e TABELLA_ITALSTUDIO (pos 4)
                        record = {
                            'codice_iva': line[4:8].strip(),
                            'descrizione': line[8:48].strip(),
                            'tipo_calcolo': line[48:49].strip(),
                            'tipo_calcolo_desc': decode_tipo_calcolo(line[48:49]),
                            'aliquota_iva': parse_decimal(line[49:55]),
                            'percentuale_indetraibilita': parse_integer(line[55:58]),
                            'note': line[58:98].strip(),
                            'data_inizio_validita': parse_date(line[98:106]),
                            'data_fine_validita': parse_date(line[106:114]),
                            'imponibile_50_corrispettivi': parse_boolean_flag(line[114:115]),
                            'imposta_intrattenimenti': line[115:117].strip(),
                            'imposta_intrattenimenti_desc': decode_imposta_intrattenimenti(line[115:117]),
                            'ventilazione_aliquota_diversa': parse_boolean_flag(line[117:118]),
                            'aliquota_diversa': parse_decimal(line[118:124]),
                            'plafond_acquisti': line[124:125].strip(),
                            'plafond_acquisti_desc': decode_plafond_acquisti(line[124:125]),
                            'monte_acquisti': parse_boolean_flag(line[125:126]),
                            'plafond_vendite': line[126:127].strip(),
                            'plafond_vendite_desc': decode_plafond_vendite(line[126:127]),
                            'no_volume_affari_plafond': parse_boolean_flag(line[127:128]),
                            'gestione_pro_rata': line[128:129].strip(),
                            'gestione_pro_rata_desc': decode_gestione_pro_rata(line[128:129]),
                            'acq_operaz_imponibili_occasionali': parse_boolean_flag(line[129:130]),
                            'comunicazione_dati_iva_vendite': line[130:131].strip(),
                            'comunicazione_dati_iva_vendite_desc': decode_comunicazione_vendite(line[130:131]),
                            'agevolazioni_subforniture': parse_boolean_flag(line[131:132]),
                            'comunicazione_dati_iva_acquisti': line[132:133].strip(),
                            'comunicazione_dati_iva_acquisti_desc': decode_comunicazione_acquisti(line[132:133]),
                            'autofattura_reverse_charge': parse_boolean_flag(line[133:134]),
                            'operazione_esente_occasionale': parse_boolean_flag(line[134:135]),
                            'ces_art38_quater_storno_iva': parse_boolean_flag(line[135:136]),
                            'perc_detrarre_export': parse_decimal(line[136:142]),
                            'acquisti_cessioni': line[142:143].strip(),
                            'acquisti_cessioni_desc': decode_acquisti_cessioni(line[142:143]),
                            'percentuale_compensazione': parse_decimal(line[143:149]),
                            'beni_ammortizzabili': parse_boolean_flag(line[149:150]),
                            'indicatore_territoriale_vendite': line[150:152].strip(),
                            'indicatore_territoriale_vendite_desc': decode_indicatore_territoriale_vendite(line[150:152]),
                            'provvigioni_dm340_99': parse_boolean_flag(line[152:153]),
                            'indicatore_territoriale_acquisti': line[153:155].strip(),
                            'indicatore_territoriale_acquisti_desc': decode_indicatore_territoriale_acquisti(line[153:155]),
                            'metodo_da_applicare': line[155:156].strip(),
                            'metodo_da_applicare_desc': decode_metodo_applicare(line[155:156]),
                            'percentuale_forfetaria': line[156:158].strip(),
                            'percentuale_forfetaria_desc': decode_percentuale_forfetaria(line[156:158]),
                            'analitico_beni_ammortizzabili': parse_boolean_flag(line[158:159]),
                            'quota_forfetaria': line[159:160].strip(),
                            'quota_forfetaria_desc': decode_quota_forfetaria(line[159:160]),
                            'acquisti_intracomunitari': parse_boolean_flag(line[160:161]),
                            'cessione_prodotti_editoriali': parse_boolean_flag(line[161:162]) if len(line) > 161 else False
                        }
                        
                        codici_iva_data.append(record)
                        
                        # Log ogni 100 record
                        if len(codici_iva_data) % 100 == 0:
                            logging.info(f"Elaborati {len(codici_iva_data)} record...")
                            
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
    
    if not codici_iva_data:
        logging.error("Nessun dato estratto da tutti gli encoding tentati")
        return None
    
    logging.info(f"Parsing completato:")
    logging.info(f"- Record totali letti: {total_records}")
    logging.info(f"- Record elaborati con successo: {len(codici_iva_data)}")
    logging.info(f"- Record con errori: {error_records}")
    
    return pd.DataFrame(codici_iva_data)

def create_summary_stats(df):
    """
    Crea statistiche di riepilogo
    """
    stats = {
        'Totale Codici IVA': len(df),
        'Codici Attivi': len(df[df['codice_iva'] != '']),
        'Tipo Normale': len(df[df['tipo_calcolo'] == 'O']),
        'Tipo Scorporo': len(df[df['tipo_calcolo'] == 'S']),
        'Tipo Esente/Non imponibile': len(df[df['tipo_calcolo'] == 'E']),
        'Tipo Solo Imposta': len(df[df['tipo_calcolo'] == 'A']),
        'Con Indetraibilità': len(df[df['percentuale_indetraibilita'].notna() & (df['percentuale_indetraibilita'] > 0)]),
        'Reverse Charge': df['autofattura_reverse_charge'].sum(),
        'Plafond Acquisti': len(df[df['plafond_acquisti'] != '']),
        'Plafond Vendite': len(df[df['plafond_vendite'] != '']),
        'Operazioni Intracomunitarie': df['acquisti_intracomunitari'].sum(),
        'Beni Ammortizzabili': df['beni_ammortizzabili'].sum(),
        'Agevolazioni Subforniture': df['agevolazioni_subforniture'].sum(),
        'Cessione Prodotti Editoriali': df['cessione_prodotti_editoriali'].sum()
    }
    
    # Statistiche aliquote
    aliquote_freq = df['aliquota_iva'].value_counts().head(10)
    for i, (aliquota, count) in enumerate(aliquote_freq.items()):
        if pd.notna(aliquota):
            stats[f'Aliquota {aliquota}%'] = count
    
    return stats

def main():
    """
    Funzione principale
    """
    # Percorso file di input
    input_file = "dati/CODICIVA.TXT"
    output_file = "codici_iva.xlsx"
    
    if not os.path.exists(input_file):
        logging.error(f"File {input_file} non trovato")
        return
    
    logging.info(f"Inizio elaborazione file: {input_file}")
    
    # Parsing del file
    df_codici_iva = parse_codiciva_file(input_file)
    
    if df_codici_iva is None or df_codici_iva.empty:
        logging.error("Nessun dato da elaborare")
        return
    
    # Creazione statistiche
    stats = create_summary_stats(df_codici_iva)
    
    # Salvataggio su Excel
    try:
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # Foglio principale con tutti i codici IVA
            df_codici_iva.to_excel(writer, sheet_name='Codici_IVA', index=False)
            
            # Foglio statistiche
            stats_df = pd.DataFrame(list(stats.items()), columns=['Descrizione', 'Valore'])
            stats_df.to_excel(writer, sheet_name='Statistiche', index=False)
            
            # Fogli separati per tipo calcolo
            for tipo, nome_foglio in [('O', 'Normale'), ('S', 'Scorporo'), ('E', 'Esente'), ('A', 'Solo_Imposta'), ('V', 'Ventilazione')]:
                df_tipo = df_codici_iva[df_codici_iva['tipo_calcolo'] == tipo]
                if len(df_tipo) > 0:
                    df_tipo.to_excel(writer, sheet_name=f'Tipo_{nome_foglio}', index=False)
            
            # Codici con caratteristiche speciali
            df_reverse = df_codici_iva[df_codici_iva['autofattura_reverse_charge'] == True]
            if len(df_reverse) > 0:
                df_reverse.to_excel(writer, sheet_name='Reverse_Charge', index=False)
                
            df_indetraibili = df_codici_iva[df_codici_iva['percentuale_indetraibilita'].notna() & (df_codici_iva['percentuale_indetraibilita'] > 0)]
            if len(df_indetraibili) > 0:
                df_indetraibili.to_excel(writer, sheet_name='Con_Indetraibilita', index=False)
                
            df_plafond = df_codici_iva[(df_codici_iva['plafond_acquisti'] != '') | (df_codici_iva['plafond_vendite'] != '')]
            if len(df_plafond) > 0:
                df_plafond.to_excel(writer, sheet_name='Con_Plafond', index=False)
                
            df_intra = df_codici_iva[df_codici_iva['acquisti_intracomunitari'] == True]
            if len(df_intra) > 0:
                df_intra.to_excel(writer, sheet_name='Intracomunitari', index=False)
        
        logging.info(f"File Excel creato: {output_file}")
        
        # Stampa statistiche finali
        print("\n" + "="*80)
        print("STATISTICHE CODICI IVA")
        print("="*80)
        for desc, valore in stats.items():
            print(f"{desc:<35}: {valore:>10}")
        print("="*80)
        
        # Mostra alcuni esempi di codici IVA
        print("\nESEMPI DI CODICI IVA TROVATI:")
        print("-"*80)
        sample_codici = df_codici_iva.head(10)[['codice_iva', 'descrizione', 'tipo_calcolo_desc', 'aliquota_iva']]
        for _, row in sample_codici.iterrows():
            aliquota = f"{row['aliquota_iva']}%" if pd.notna(row['aliquota_iva']) else "N/A"
            print(f"{row['codice_iva']:<6} | {row['descrizione']:<35} | {row['tipo_calcolo_desc']:<20} | {aliquota}")
        
        logging.info("Elaborazione completata con successo!")
        
    except Exception as e:
        logging.error(f"Errore creazione file Excel: {e}")

if __name__ == "__main__":
    main()