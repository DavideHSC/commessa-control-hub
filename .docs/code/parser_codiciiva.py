#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser per CODICIVA.TXT - Codici IVA - VERSIONE DEBUG
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

import os
from datetime import datetime
import logging

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
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

def parse_boolean_flag(char):
    """Converte carattere in boolean (X = True, altro = False)"""
    return char.strip().upper() == 'X'

def parse_codiciva_file_debug(file_path, max_records=10):
    """
    Parsing del file CODICIVA.TXT - VERSIONE DEBUG
    """
    codici_iva_data = []
    total_records = 0
    error_records = 0
    
    print(f"\n🔍 DEBUG: Inizio parsing file {file_path}")
    print("="*80)
    
    # Prova diversi encoding
    encodings = ['utf-8', 'latin1', 'cp1252']
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as file:
                print(f"✅ File aperto con encoding: {encoding}")
                
                for line_num, line in enumerate(file, 1):
                    total_records += 1
                    
                    # Limita output per debug
                    if len(codici_iva_data) >= max_records:
                        break
                    
                    try:
                        # Rimuovi CRLF finale se presente
                        original_line = line
                        if line.endswith('\r\n'):
                            line = line[:-2]
                        elif line.endswith('\n'):
                            line = line[:-1]
                        
                        # Debug: mostra riga grezza
                        print(f"\n📝 RIGA {line_num} (lunghezza: {len(line)}):")
                        print(f"RAW: '{line}'")
                        
                        # Verifica lunghezza minima
                        if len(line) < 162:
                            print(f"⚠️  Riga troppo corta ({len(line)} < 162)")
                            continue
                        
                        # Debug: estrazione campi chiave
                        print(f"\n🔬 ESTRAZIONE CAMPI:")
                        codice_raw = line[4:8]
                        descrizione_raw = line[8:48]
                        tipo_calcolo_raw = line[48:49]
                        aliquota_raw = line[49:55]
                        
                        print(f"  Codice [4:8]:      '{codice_raw}' -> '{codice_raw.strip()}'")
                        print(f"  Descrizione [8:48]: '{descrizione_raw}' -> '{descrizione_raw.strip()}'")
                        print(f"  Tipo Calc [48:49]:  '{tipo_calcolo_raw}' -> '{tipo_calcolo_raw.strip()}'")
                        print(f"  Aliquota [49:55]:   '{aliquota_raw}' -> {parse_decimal(aliquota_raw)}")
                        
                        # Estrazione completa
                        record = {
                            'codice_iva': line[4:8].strip(),
                            'descrizione': line[8:48].strip(),
                            'tipo_calcolo': line[48:49].strip(),
                            'aliquota_iva': parse_decimal(line[49:55]),
                            'percentuale_indetraibilita': parse_integer(line[55:58]),
                            'note': line[58:98].strip(),
                            'data_inizio_validita': parse_date(line[98:106]),
                            'data_fine_validita': parse_date(line[106:114]),
                        }
                        
                        print(f"\n📊 RECORD FINALE:")
                        for key, value in record.items():
                            print(f"  {key}: {value} ({type(value).__name__})")
                        
                        codici_iva_data.append(record)
                        print(f"✅ Record {len(codici_iva_data)} aggiunto")
                            
                    except Exception as e:
                        error_records += 1
                        print(f"❌ Errore riga {line_num}: {e}")
                        continue
                
                break  # Se arriviamo qui, l'encoding ha funzionato
                
        except UnicodeDecodeError:
            print(f"⚠️  Encoding {encoding} fallito, provo il prossimo...")
            continue
        except FileNotFoundError:
            print(f"❌ File non trovato: {file_path}")
            return None
        except Exception as e:
            print(f"❌ Errore lettura file con encoding {encoding}: {e}")
            continue
    
    print(f"\n📈 STATISTICHE FINALI:")
    print(f"- Record totali letti: {total_records}")
    print(f"- Record elaborati con successo: {len(codici_iva_data)}")
    print(f"- Record con errori: {error_records}")
    print("="*80)
    
    return codici_iva_data

def main():
    """
    Funzione principale - VERSIONE DEBUG
    """
    # Cerca il file CodicIva.txt (dati reali)
    possible_paths = [
        "dati/CodicIva.txt",
        "../dati_cliente/CodicIva.txt", 
        "../../dati_cliente/CodicIva.txt",
        ".docs/dati_cliente/CodicIva.txt"
    ]
    
    input_file = None
    for path in possible_paths:
        if os.path.exists(path):
            input_file = path
            break
    
    if not input_file:
        print("❌ File CodicIva.txt non trovato nei percorsi:")
        for path in possible_paths:
            print(f"  - {path}")
        return
    
    print(f"🎯 File trovato: {input_file}")
    
    # Parsing del file (solo primi 10 record per debug)
    codici_data = parse_codiciva_file_debug(input_file, max_records=10)
    
    if not codici_data:
        print("❌ Nessun dato estratto")
        return
    
    print(f"\n🎉 DEBUG COMPLETATO!")
    print(f"Estratti {len(codici_data)} record di esempio")

if __name__ == "__main__":
    main()