import os
import pandas as pd
from datetime import datetime

# LAYOUT CORRETTI - Tutti verificati sui dati reali
PNTESTA_LAYOUT = {
    'CODICE_FISCALE': (3, 19),          # pos 4-19 -> indici 3-19
    'SUBCODICE_FISCALE': (19, 20),      # pos 20 -> indice 19-20  
    'CODICE_UNIVOCO': (20, 32),         # pos 21-32 -> indici 20-32
    'CODICE_ATTIVITA': (32, 34),        # pos 33-34 -> indici 32-34
    'ESERCIZIO': (34, 39),              # pos 35-39 -> indici 34-39
    'CODICE_CAUSALE': (39, 45),         # pos 40-45 -> indici 39-45
    'DESCRIZIONE_CAUSALE': (45, 85),    # pos 46-85 -> indici 45-85
    'DATA_REG': (85, 93),               # pos 86-93 -> indici 85-93
    'CODICE_ATTIVITA_IVA': (93, 95),    # pos 94-95 -> indici 93-95
    'TIPO_REGISTRO_IVA': (95, 96),      # pos 96 -> indice 95-96
    'CODICE_NUMERAZIONE_IVA': (96, 99), # pos 97-99 -> indici 96-99
    'CLIENTE_FORNITORE_CF': (99, 115),  # pos 100-115 -> indici 99-115
    'CLIENTE_FORNITORE_SUB': (115, 116), # pos 116 -> indice 115-116
    'CLIENTE_FORNITORE_SIGLA': (116, 128), # pos 117-128 -> indici 116-128
    'DATA_DOC': (128, 136),             # pos 129-136 -> indici 128-136
    'NUM_DOC': (136, 148),              # pos 137-148 -> indici 136-148
    'DOC_BIS': (148, 149),              # pos 149 -> indice 148-149
    'DATA_REGISTRO_IVA': (149, 157),    # pos 150-157 -> indici 149-157
    'PROTOCOLLO_NUM': (157, 163),       # pos 158-163 -> indici 157-163
    'PROTOCOLLO_BIS': (163, 164),       # pos 164 -> indice 163-164
    'DATA_COMPETENZA_IVA': (164, 172),  # pos 165-172 -> indici 164-172
    'TOTALE_DOC': (172, 184),           # pos 173-184 -> indici 172-184
    'DATA_COMPETENZA_CONT': (184, 192), # pos 185-192 -> indici 184-192
    'NOTE_MOVIMENTO': (192, 252),       # pos 193-252 -> indici 192-252
    'STATO': (340, 341)                 # pos 341 -> indice 340-341
}

PNRIGCON_LAYOUT = {
    'CODICE_UNIVOCO': (3, 15),          # pos 4-15 -> indici 3-15 ✓ CORRETTO
    'PROG_RIGO_IN_CHIAVE': (15, 18),    # pos 16-18 -> indici 15-18 ✓ CORRETTO
    'TIPO_CONTO': (18, 19),             # pos 19 -> indice 18-19
    'CLI_FOR_CF': (19, 35),             # pos 20-35 -> indici 19-35
    'CLI_FOR_SUB': (35, 36),            # pos 36 -> indice 35-36
    'CLI_FOR_SIGLA': (36, 48),          # pos 37-48 -> indici 36-48
    'CONTO': (48, 58),                  # pos 49-58 -> indici 48-58 ✓ CORRETTO
    'IMPORTO_DARE': (58, 70),           # pos 59-70 -> indici 58-70 ✓ CORRETTO
    'IMPORTO_AVERE': (70, 82),          # pos 71-82 -> indici 70-82 ✓ CORRETTO
    'NOTE': (82, 142),                  # pos 83-142 -> indici 82-142
    'INS_DATI_COMPETENZA': (142, 143),  # pos 143 -> indice 142-143
    'DATA_INIZIO_COMP': (143, 151),     # pos 144-151 -> indici 143-151
    'DATA_FINE_COMP': (151, 159),       # pos 152-159 -> indici 151-159
    'NOTE_COMPETENZA': (159, 219),      # pos 160-219 -> indici 159-219
    'INS_MOVIMENTI_ANALITICI': (247, 248), # pos 248 -> indice 247-248
    'STATO_MOVIMENTO_STUDI': (265, 266) # pos 266 -> indice 265-266
}

PNRIGIVA_LAYOUT = {
    'CODICE_UNIVOCO': (3, 15),          # pos 4-15 -> indici 3-15 ✓ CORRETTO
    'CODICE_IVA': (15, 19),             # pos 16-19 -> indici 15-19 ✓ CORRETTO
    'CONTROPARTITA': (19, 29),          # pos 20-29 -> indici 19-29 ✓ CORRETTO
    'IMPONIBILE': (29, 41),             # pos 30-41 -> indici 29-41 ✓ CORRETTO
    'IMPOSTA': (41, 53),                # pos 42-53 -> indici 41-53 ✓ CORRETTO
    'IMPOSTA_INTRATTENIMENTI': (53, 65), # pos 54-65 -> indici 53-65
    'IMPONIBILE_50_PERC': (65, 77),     # pos 66-77 -> indici 65-77
    'IMPOSTA_NON_CONSIDERATA': (77, 89), # pos 78-89 -> indici 77-89
    'IMPORTO_LORDO': (89, 101),         # pos 90-101 -> indici 89-101
    'NOTE': (101, 161),                 # pos 102-161 -> indici 101-161
    'SIGLA_CONTROPARTITA': (161, 173)   # pos 162-173 -> indici 161-173
}

MOVANAC_LAYOUT = {
    'CODICE_UNIVOCO': (3, 15),          # pos 4-15 -> indici 3-15 ✓ CORRETTO
    'PROG_RIGO_IN_CHIAVE': (15, 18),    # pos 16-18 -> indici 15-18 ✓ CORRETTO
    'CENTRO_COSTO': (18, 22),           # pos 19-22 -> indici 18-22 ✓ CORRETTO
    'PARAMETRO': (22, 34)               # pos 23-34 -> indici 22-34 ✓ CORRETTO
}

def format_date(date_str):
    """Converte data da DDMMYYYY a DD/MM/YYYY"""
    if not date_str or len(date_str) != 8:
        return date_str
    try:
        return f"{date_str[0:2]}/{date_str[2:4]}/{date_str[4:8]}"
    except:
        return date_str

def format_amount(amount_str):
    """Converte importo numerico in formato decimale"""
    if not amount_str:
        return "0.00"
    try:
        # Rimuove spazi e caratteri non numerici eccetto il punto e la virgola
        clean_amount = ''.join(c for c in amount_str if c.isdigit() or c in '.,')
        if not clean_amount:
            return "0.00"
        
        # Se contiene solo numeri, assume centesimi
        if '.' not in clean_amount and ',' not in clean_amount:
            if len(clean_amount) > 2:
                # Inserisce il punto decimale prima degli ultimi 2 caratteri
                clean_amount = clean_amount[:-2] + '.' + clean_amount[-2:]
            else:
                clean_amount = '0.' + clean_amount.zfill(2)
        
        # Sostituisce virgola con punto se necessario
        clean_amount = clean_amount.replace(',', '.')
        
        return f"{float(clean_amount):.2f}"
    except:
        return "0.00"

def parse_line(line, layout):
    """Estrae i campi dalla riga secondo il layout specificato"""
    record = {}
    for field, (start, end) in layout.items():
        if start < len(line):
            value = line[start:end].strip()
            # Formattazione speciale per alcuni campi
            if 'DATA' in field and value and len(value) == 8:
                value = format_date(value)
            elif 'IMPORTO' in field or 'TOTALE' in field or 'IMPONIBILE' in field or 'IMPOSTA' in field or 'PARAMETRO' in field:
                value = format_amount(value)
            record[field] = value
        else:
            record[field] = ""
    return record

def process_files_robust():
    """Elabora i file contabili con gestione robusta degli errori"""
    DATA_DIR = 'dati'
    transactions = {}
    
    # Lista dei file da processare
    files_to_process = {
        'PNTESTA.TXT': 'testate',
        'PNRIGCON.TXT': 'righe_contabili', 
        'PNRIGIVA.TXT': 'righe_iva',
        'MOVANAC.TXT': 'movimenti_analitici'
    }
    
    file_data = {}
    
    # 1. Carica tutti i file in memoria
    for filename, key in files_to_process.items():
        filepath = os.path.join(DATA_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8-sig') as f:
                lines = f.readlines()
                file_data[key] = lines
                print(f"✓ Caricato {filename}: {len(lines)} righe")
        except FileNotFoundError:
            print(f"⚠ File {filename} non trovato - sarà ignorato")
            file_data[key] = []
        except Exception as e:
            print(f"✗ Errore nel caricamento di {filename}: {e}")
            file_data[key] = []

    # 2. Processa le testate (file principale)
    if not file_data['testate']:
        print("ERRORE: File PNTESTA.TXT mancante o vuoto")
        return {}

    print(f"\nElaborazione di {len(file_data['testate'])} testate...")
    
    for i, line_t in enumerate(file_data['testate']):
        if len(line_t.strip()) == 0:
            continue
            
        try:
            # Estrae il codice univoco dalla testata
            if len(line_t) < 32:
                print(f"⚠ Riga {i+1} troppo corta: {len(line_t)} caratteri")
                continue
                
            key = line_t[20:32].strip()  # CODICE_UNIVOCO posizione 21-32
            if not key:
                print(f"⚠ Riga {i+1}: codice univoco vuoto")
                continue

            # Parsa la testata
            header = parse_line(line_t, PNTESTA_LAYOUT)
            transactions[key] = {
                'testata': header,
                'righe_contabili': [],
                'righe_iva': [],
                'errori': []
            }
            
        except Exception as e:
            print(f"✗ Errore nella riga {i+1} della testata: {e}")
            continue

    print(f"✓ Elaborate {len(transactions)} transazioni dalla testata")

    # 3. Processa le righe contabili ✓ LAYOUT CORRETTO
    print(f"\nElaborazione di {len(file_data['righe_contabili'])} righe contabili...")
    righe_contabili_aggiunte = 0
    
    for i, line_rc in enumerate(file_data['righe_contabili']):
        if len(line_rc.strip()) == 0:
            continue
            
        try:
            if len(line_rc) < 15:
                continue
                
            key = line_rc[3:15].strip()  # ✓ CODICE_UNIVOCO posizione 4-15 (indici 3-15)
            if key in transactions:
                riga_con = parse_line(line_rc, PNRIGCON_LAYOUT)
                prog_rigo = riga_con.pop('PROG_RIGO_IN_CHIAVE', '')
                riga_con['PROG_RIGO'] = prog_rigo
                riga_con['mov_analitici'] = []
                transactions[key]['righe_contabili'].append(riga_con)
                righe_contabili_aggiunte += 1
                
        except Exception as e:
            if i < 5:  # Debug solo prime righe
                print(f"✗ Errore nella riga {i+1} delle righe contabili: {e}")
            continue

    print(f"✓ Aggiunte {righe_contabili_aggiunte} righe contabili")

    # 4. Processa le righe IVA ✓ LAYOUT CORRETTO
    print(f"\nElaborazione di {len(file_data['righe_iva'])} righe IVA...")
    righe_iva_aggiunte = 0
    
    for i, line_ri in enumerate(file_data['righe_iva']):
        if len(line_ri.strip()) == 0:
            continue
            
        try:
            if len(line_ri) < 15:
                continue
                
            key = line_ri[3:15].strip()  # ✓ CODICE_UNIVOCO posizione 4-15 (indici 3-15)
            if key in transactions:
                riga_iva = parse_line(line_ri, PNRIGIVA_LAYOUT)
                transactions[key]['righe_iva'].append(riga_iva)
                righe_iva_aggiunte += 1
                
        except Exception as e:
            if i < 5:  # Debug solo prime righe
                print(f"✗ Errore nella riga {i+1} delle righe IVA: {e}")
            continue

    print(f"✓ Aggiunte {righe_iva_aggiunte} righe IVA")

    # 5. Processa i movimenti analitici (centri di costo) ✓ LAYOUT CORRETTO
    print(f"\nElaborazione di {len(file_data['movimenti_analitici'])} movimenti analitici...")
    movimenti_analitici_aggiunti = 0
    
    for i, line_m in enumerate(file_data['movimenti_analitici']):
        if len(line_m.strip()) == 0:
            continue
            
        try:
            if len(line_m) < 18:
                continue
                
            key = line_m[3:15].strip()  # ✓ CODICE_UNIVOCO posizione 4-15 (indici 3-15)
            if key in transactions:
                mov_anac = parse_line(line_m, MOVANAC_LAYOUT)
                prog_rigo_anac = mov_anac.pop('PROG_RIGO_IN_CHIAVE', '')
                
                # Associa ai righi contabili con lo stesso prog_rigo
                for riga_con in transactions[key]['righe_contabili']:
                    if riga_con.get('PROG_RIGO') == prog_rigo_anac:
                        riga_con['mov_analitici'].append(mov_anac)
                        movimenti_analitici_aggiunti += 1
                        break
                        
        except Exception as e:
            if i < 5:  # Debug solo prime righe
                print(f"✗ Errore nella riga {i+1} dei movimenti analitici: {e}")
            continue

    print(f"✓ Aggiunti {movimenti_analitici_aggiunti} movimenti analitici")

    return transactions

def export_to_excel(data_correlati, filename="report_contabile_definitivo.xlsx"):
    """Esporta i dati in Excel con formattazione migliorata"""
    if not data_correlati:
        print("[AVVISO] Nessun dato da esportare")
        return

    excel_data = []
    
    for code, data in data_correlati.items():
        testata = data.get('testata', {})
        
        # Informazioni base dalla testata
        base_info = {
            'Codice Univoco': code,
            'Codice Fiscale': testata.get('CODICE_FISCALE', ''),
            'Data Registrazione': testata.get('DATA_REG', ''),
            'Descrizione Causale': testata.get('DESCRIZIONE_CAUSALE', ''),
            'Data Documento': testata.get('DATA_DOC', ''),
            'Numero Documento': testata.get('NUM_DOC', ''),
            'Totale Documento': testata.get('TOTALE_DOC', ''),
            'Cliente/Fornitore CF': testata.get('CLIENTE_FORNITORE_CF', ''),
            'Cliente/Fornitore Sigla': testata.get('CLIENTE_FORNITORE_SIGLA', ''),
            'Codice Causale': testata.get('CODICE_CAUSALE', ''),
            'Tipo Registro IVA': testata.get('TIPO_REGISTRO_IVA', ''),
            'Stato': testata.get('STATO', '')
        }
        
        has_details = (len(data.get('righe_contabili', [])) > 0 or 
                      len(data.get('righe_iva', [])) > 0)

        if not has_details:
            row = base_info.copy()
            row['Tipo Riga'] = 'Solo Testata'
            excel_data.append(row)
            continue
        
        # Aggiungi righe contabili
        for riga_con in data.get('righe_contabili', []):
            row = base_info.copy()
            row.update({
                'Tipo Riga': 'Contabile',
                'Prog. Rigo': riga_con.get('PROG_RIGO', ''),
                'Tipo Conto': riga_con.get('TIPO_CONTO', ''),
                'Conto': riga_con.get('CONTO', ''),
                'CLI/FOR CF Riga': riga_con.get('CLI_FOR_CF', ''),
                'CLI/FOR Sigla Riga': riga_con.get('CLI_FOR_SIGLA', ''),
                'Importo Dare': riga_con.get('IMPORTO_DARE', ''),
                'Importo Avere': riga_con.get('IMPORTO_AVERE', ''),
                'Note Riga': riga_con.get('NOTE', ''),
                'Centri di Costo': " | ".join([
                    f"CC:{m.get('CENTRO_COSTO', '')},Param:{m.get('PARAMETRO', '')}" 
                    for m in riga_con.get('mov_analitici', [])
                ])
            })
            excel_data.append(row)
        
        # Aggiungi righe IVA
        for riga_iva in data.get('righe_iva', []):
            row = base_info.copy()
            row.update({
                'Tipo Riga': 'IVA',
                'Codice IVA': riga_iva.get('CODICE_IVA', ''),
                'Contropartita IVA': riga_iva.get('CONTROPARTITA', ''),
                'Sigla Contropartita': riga_iva.get('SIGLA_CONTROPARTITA', ''),
                'Imponibile': riga_iva.get('IMPONIBILE', ''),
                'Imposta': riga_iva.get('IMPOSTA', ''),
                'Imposta Intrattenimenti': riga_iva.get('IMPOSTA_INTRATTENIMENTI', ''),
                'Importo Lordo IVA': riga_iva.get('IMPORTO_LORDO', ''),
                'Note IVA': riga_iva.get('NOTE', '')
            })
            excel_data.append(row)

    try:
        df = pd.DataFrame(excel_data)
        df.to_excel(filename, index=False, engine='openpyxl')
        print(f"\n✅ ESPORTAZIONE COMPLETATA CON SUCCESSO!")
        print(f"📁 File creato: {filename}")
        print(f"📊 Righe esportate: {len(excel_data)}")
        print(f"🏢 Transazioni elaborate: {len(data_correlati)}")
        
        # Statistiche dettagliate
        solo_testata = len([r for r in excel_data if r.get('Tipo Riga') == 'Solo Testata'])
        righe_contabili = len([r for r in excel_data if r.get('Tipo Riga') == 'Contabile'])
        righe_iva = len([r for r in excel_data if r.get('Tipo Riga') == 'IVA'])
        
        print(f"📈 Dettaglio:")
        print(f"   - Solo Testata: {solo_testata}")
        print(f"   - Righe Contabili: {righe_contabili}")
        print(f"   - Righe IVA: {righe_iva}")
        
    except PermissionError:
        print(f"\n✗ ERRORE: Impossibile scrivere '{filename}'")
        print("  Il file potrebbe essere aperto in Excel. Chiuderlo e riprovare.")
    except Exception as e:
        print(f"\n✗ ERRORE durante la creazione del file Excel: {e}")

def print_summary(data_correlati):
    """Stampa un riepilogo dei dati elaborati"""
    if not data_correlati:
        print("\nNessun dato elaborato.")
        return
        
    print(f"\n" + "="*60)
    print(f"📊 RIEPILOGO ELABORAZIONE COMPLETA")
    print(f"="*60)
    print(f"🏢 Transazioni totali elaborate: {len(data_correlati)}")
    
    totale_righe_contabili = sum(len(d.get('righe_contabili', [])) for d in data_correlati.values())
    totale_righe_iva = sum(len(d.get('righe_iva', [])) for d in data_correlati.values())
    totale_movimenti_analitici = sum(
        len(riga.get('mov_analitici', [])) 
        for data in data_correlati.values() 
        for riga in data.get('righe_contabili', [])
    )
    
    print(f"📋 Righe contabili totali: {totale_righe_contabili}")
    print(f"💰 Righe IVA totali: {totale_righe_iva}")
    print(f"🏭 Movimenti analitici totali: {totale_movimenti_analitici}")
    
    # Verifica completezza dati
    transazioni_complete = 0
    for code, data in data_correlati.items():
        if len(data.get('righe_contabili', [])) > 0 or len(data.get('righe_iva', [])) > 0:
            transazioni_complete += 1
    
    print(f"✅ Transazioni con dettagli: {transazioni_complete}")
    print(f"📝 Solo testate: {len(data_correlati) - transazioni_complete}")
    
    # Mostra alcuni esempi
    print(f"\n📌 ESEMPI TRANSAZIONI:")
    for i, (code, data) in enumerate(list(data_correlati.items())[:5]):
        testata = data.get('testata', {})
        righe_cont = len(data.get('righe_contabili', []))
        righe_iva = len(data.get('righe_iva', []))
        print(f"   {i+1}. {code} - {testata.get('DESCRIZIONE_CAUSALE', 'N/A')[:30]} - RC:{righe_cont} - RI:{righe_iva}")

# --- ESECUZIONE PRINCIPALE ---
if __name__ == "__main__":
    print("🚀 PARSER CONTABILITA' EVOLUTION - VERSIONE DEFINITIVA")
    print("=" * 60)
    
    dati_contabili = process_files_robust()
    
    if dati_contabili:
        print_summary(dati_contabili)
        print("\n" + "=" * 60)
        print("📊 Esportazione in Excel...")
        export_to_excel(dati_contabili)
        print("🎉 ELABORAZIONE COMPLETATA!")
    else:
        print("\n❌ Elaborazione terminata senza risultati.")
        print("Verificare che i file siano presenti nella cartella 'dati'")