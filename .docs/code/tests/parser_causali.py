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

import os
from datetime import datetime
import logging
import json  # Aggiungo json per un output più leggibile

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

def parse_causali_file_for_debug(file_path, num_records=10):
    """
    Parsing del file CAUSALI.TXT per debug, stampando i primi N record.
    """
    causali_data = []
    total_records = 0
    
    # Prova diversi encoding
    encodings = ['utf-8', 'latin1', 'cp1252']
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as file:
                logging.info(f"File aperto con encoding: {encoding}")
                
                for line_num, line in enumerate(file, 1):
                    if line_num > num_records:
                        break # Processa solo i primi num_records

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
                        record = {
                            'codice_causale': line[4:10].strip(),
                            'descrizione_causale': line[10:50].strip(),
                            'tipo_movimento': line[50:51].strip(),
                            'tipo_aggiornamento': line[51:52].strip(),
                            'data_inizio_validita': str(parse_date(line[52:60])), # Converte a stringa per JSON
                            'data_fine_validita': str(parse_date(line[60:68])), # Converte a stringa per JSON
                            'tipo_registro_iva': line[68:69].strip(),
                            'segno_movimento_iva': line[69:70].strip(),
                            'conto_iva': line[70:80].strip(),
                            'generazione_autofattura': parse_boolean_flag(line[80:81]),
                            'tipo_autofattura_generata': line[81:82].strip(),
                            'conto_iva_vendite': line[82:92].strip(),
                            'fattura_importo_0': parse_boolean_flag(line[92:93]),
                            'fattura_valuta_estera': parse_boolean_flag(line[93:94]),
                            'non_considerare_liquidazione_iva': parse_boolean_flag(line[94:95]),
                            'iva_esigibilita_differita': line[95:96].strip(),
                            'fattura_emessa_reg_corrispettivi': parse_boolean_flag(line[96:97]),
                            'gestione_partite': line[97:98].strip(),
                            'gestione_intrastat': parse_boolean_flag(line[98:99]),
                            'gestione_ritenute_enasarco': line[99:100].strip(),
                            'versamento_ritenute': parse_boolean_flag(line[100:101]),
                            'note_movimento': line[101:161].strip(),
                            'descrizione_documento': line[161:166].strip(),
                            'identificativo_estero_clifor': parse_boolean_flag(line[166:167]),
                            'scrittura_rettifica_assestamento': parse_boolean_flag(line[167:168]),
                            'non_stampare_reg_cronologico': parse_boolean_flag(line[168:169]),
                            'movimento_reg_iva_non_rilevante': parse_boolean_flag(line[169:170]),
                            'tipo_movimento_semplificata': line[170:171].strip() if len(line) > 170 else ''
                        }
                        
                        causali_data.append(record)
                        
                    except Exception as e:
                        logging.error(f"Errore elaborazione riga {line_num}: {e}")
                        continue
                
                return causali_data, total_records
                
        except UnicodeDecodeError:
            logging.warning(f"Encoding {encoding} fallito, provo il prossimo...")
            continue
            
    raise Exception("Tutti gli encoding testati hanno fallito.")

def main():
    """
    Funzione principale per eseguire il parsing di debug.
    """
    # Imposta il percorso del file di input qui
    # Il percorso è relativo alla root del progetto
    file_path = os.path.join(os.path.dirname(__file__), '..', 'dati_cliente', 'Causali.txt')
    
    if not os.path.exists(file_path):
        logging.error(f"File non trovato: {file_path}")
        return

    logging.info(f"Inizio parsing di: {file_path}")
    
    try:
        # Esegui il parsing di debug
        parsed_data, total_lines = parse_causali_file_for_debug(file_path, num_records=10)
        
        logging.info(f"Parsing completato. {len(parsed_data)}/{total_lines} record processati per il debug.")
        
        # Stampa i dati in formato JSON per una facile lettura
        print("--- INIZIO OUTPUT DI DEBUG ---")
        for i, record in enumerate(parsed_data):
            print(f"--- Record {i+1} ---")
            print(json.dumps(record, indent=2, ensure_ascii=False))
        print("--- FINE OUTPUT DI DEBUG ---")

    except Exception as e:
        logging.error(f"Errore durante il parsing: {e}")

if __name__ == '__main__':
    main()