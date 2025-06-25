import os
import pandas as pd
from datetime import datetime

# LAYOUT A_CLIFOR.TXT - Anagrafiche Clienti/Fornitori (338 bytes)
A_CLIFOR_LAYOUT = {
    'CODICE_FISCALE_AZIENDA': (3, 19),   # pos 4-19 -> indici 3-19
    'SUBCODICE_AZIENDA': (19, 20),       # pos 20 -> indice 19-20
    'CODICE_UNIVOCO': (20, 32),          # pos 21-32 -> indici 20-32
    'CODICE_FISCALE_CLIFOR': (32, 48),   # pos 33-48 -> indici 32-48
    'SUBCODICE_CLIFOR': (48, 49),        # pos 49 -> indice 48-49
    'TIPO_CONTO': (49, 50),              # pos 50 -> indice 49-50
    'SOTTOCONTO_CLIENTE': (50, 60),      # pos 51-60 -> indici 50-60
    'SOTTOCONTO_FORNITORE': (60, 70),    # pos 61-70 -> indici 60-70
    'CODICE_ANAGRAFICA': (70, 82),       # pos 71-82 -> indici 70-82
    'PARTITA_IVA': (82, 93),             # pos 83-93 -> indici 82-93
    'TIPO_SOGGETTO': (93, 94),           # pos 94 -> indice 93-94
    'DENOMINAZIONE': (94, 154),          # pos 95-154 -> indici 94-154
    
    # Dati persona fisica
    'COGNOME': (154, 174),               # pos 155-174 -> indici 154-174
    'NOME': (174, 194),                  # pos 175-194 -> indici 174-194
    'SESSO': (194, 195),                 # pos 195 -> indice 194-195
    'DATA_NASCITA': (195, 203),          # pos 196-203 -> indici 195-203
    'COMUNE_NASCITA': (203, 207),        # pos 204-207 -> indici 203-207
    'COMUNE_RESIDENZA': (207, 211),      # pos 208-211 -> indici 207-211
    'CAP': (211, 216),                   # pos 212-216 -> indici 211-216
    'INDIRIZZO': (216, 246),             # pos 217-246 -> indici 216-246
    'PREFISSO_TELEFONO': (246, 250),     # pos 247-250 -> indici 246-250
    'NUMERO_TELEFONO': (250, 261),       # pos 251-261 -> indici 250-261
    'ID_FISCALE_ESTERO': (261, 281),     # pos 262-281 -> indici 261-281
    'CODICE_ISO': (281, 283),            # pos 282-283 -> indici 281-283
    
    # Dati pagamenti
    'CODICE_INCASSO_PAGAMENTO': (283, 291),    # pos 284-291 -> indici 283-291
    'CODICE_INCASSO_CLIENTE': (291, 299),      # pos 292-299 -> indici 291-299
    'CODICE_PAGAMENTO_FORNITORE': (299, 307),  # pos 300-307 -> indici 299-307
    'CODICE_VALUTA': (307, 311),               # pos 308-311 -> indici 307-311
    
    # Dati fiscali fornitore
    'GESTIONE_DATI_770': (311, 312),           # pos 312 -> indice 311-312
    'SOGGETTO_A_RITENUTA': (312, 313),         # pos 313 -> indice 312-313
    'QUADRO_770': (313, 314),                  # pos 314 -> indice 313-314
    'CONTRIBUTO_PREVIDENZIALE': (314, 315),    # pos 315 -> indice 314-315
    'CODICE_RITENUTA': (315, 320),             # pos 316-320 -> indici 315-320
    'ENASARCO': (320, 321),                    # pos 321 -> indice 320-321
    'TIPO_RITENUTA': (321, 322),               # pos 322 -> indice 321-322
    'SOGGETTO_INAIL': (322, 323),              # pos 323 -> indice 322-323
    'CONTRIBUTO_PREVID_335': (323, 324),       # pos 324 -> indice 323-324
    'ALIQUOTA': (324, 330),                    # pos 325-330 -> indici 324-330
    'PERC_CONTRIBUTO_CASSA': (330, 336),       # pos 331-336 -> indici 330-336
    'ATTIVITA_MENSILIZZAZIONE': (336, 338)     # pos 337-338 -> indici 336-338
}

def format_date_nascita(date_str):
    """Converte data di nascita da GGMMAAAA a GG/MM/AAAA"""
    if not date_str or len(date_str) != 8:
        return date_str
    try:
        return f"{date_str[0:2]}/{date_str[2:4]}/{date_str[4:8]}"
    except:
        return date_str

def format_codice_fiscale(cf):
    """Formatta il codice fiscale rimuovendo spazi e validando"""
    if not cf:
        return ""
    clean_cf = cf.strip()
    if len(clean_cf) == 16:
        return clean_cf.upper()
    elif len(clean_cf) == 11 and clean_cf.isdigit():
        return clean_cf  # Partita IVA
    return clean_cf

def format_partita_iva(piva):
    """Formatta la partita IVA"""
    if not piva:
        return ""
    clean_piva = piva.strip()
    if len(clean_piva) == 11 and clean_piva.isdigit():
        return clean_piva
    return clean_piva

def parse_line_clifor(line, layout):
    """Estrae i campi dalla riga secondo il layout specificato"""
    record = {}
    for field, (start, end) in layout.items():
        if start < len(line):
            value = line[start:end].strip()
            
            # Formattazione speciale per alcuni campi
            if field == 'DATA_NASCITA' and value:
                value = format_date_nascita(value)
            elif 'CODICE_FISCALE' in field and value:
                value = format_codice_fiscale(value)
            elif field == 'PARTITA_IVA' and value:
                value = format_partita_iva(value)
            elif field in ['CAP', 'PREFISSO_TELEFONO', 'NUMERO_TELEFONO'] and value:
                value = value.zfill(len(value)) if value.isdigit() else value
                
            record[field] = value
        else:
            record[field] = ""
    return record

def get_tipo_conto_descrizione(tipo):
    """Restituisce la descrizione del tipo conto"""
    tipi = {
        'C': 'Cliente',
        'F': 'Fornitore',
        'E': 'Entrambi (Cliente e Fornitore)'
    }
    return tipi.get(tipo, f'Tipo {tipo}')

def get_tipo_soggetto_descrizione(tipo):
    """Restituisce la descrizione del tipo soggetto"""
    tipi = {
        '0': 'Persona Fisica',
        '1': 'Soggetto Diverso (Società/Ente)'
    }
    return tipi.get(tipo, f'Tipo {tipo}')

def get_sesso_descrizione(sesso):
    """Restituisce la descrizione del sesso"""
    sessi = {
        'M': 'Maschio',
        'F': 'Femmina'
    }
    return sessi.get(sesso, sesso)

def get_quadro_770_descrizione(quadro):
    """Restituisce la descrizione del quadro 770"""
    quadri = {
        '0': 'Lavoro autonomo',
        '1': 'Provvigioni',
        '2': 'Lavoro autonomo imposta'
    }
    return quadri.get(quadro, quadro)

def get_tipo_ritenuta_descrizione(tipo):
    """Restituisce la descrizione del tipo ritenuta"""
    tipi = {
        'A': 'A titolo d\'acconto',
        'I': 'A titolo d\'imposta',
        'M': 'Manuale'
    }
    return tipi.get(tipo, tipo)

def get_contributo_335_descrizione(tipo):
    """Restituisce la descrizione del contributo L.335/95"""
    tipi = {
        '0': 'Non soggetto',
        '1': 'Soggetto',
        '2': 'Soggetto con imponibile manuale',
        '3': 'Soggetto con calcolo manuale'
    }
    return tipi.get(tipo, tipo)

def format_nome_completo(record):
    """Crea il nome completo per persone fisiche"""
    if record.get('TIPO_SOGGETTO') == '0':  # Persona fisica
        nome = record.get('NOME', '').strip()
        cognome = record.get('COGNOME', '').strip()
        if nome and cognome:
            return f"{nome} {cognome}"
        elif cognome:
            return cognome
        elif nome:
            return nome
    return record.get('DENOMINAZIONE', '').strip()

def determine_sottoconto_attivo(record):
    """Determina quale sottoconto è attivo"""
    sottoconto_cliente = record.get('SOTTOCONTO_CLIENTE', '').strip()
    sottoconto_fornitore = record.get('SOTTOCONTO_FORNITORE', '').strip()
    tipo_conto = record.get('TIPO_CONTO', '')
    
    if tipo_conto == 'C' and sottoconto_cliente:
        return sottoconto_cliente
    elif tipo_conto == 'F' and sottoconto_fornitore:
        return sottoconto_fornitore
    elif tipo_conto == 'E':
        if sottoconto_cliente and sottoconto_fornitore:
            return f"C:{sottoconto_cliente}/F:{sottoconto_fornitore}"
        elif sottoconto_cliente:
            return sottoconto_cliente
        elif sottoconto_fornitore:
            return sottoconto_fornitore
    
    return sottoconto_cliente or sottoconto_fornitore or ""

def process_anagrafiche_clifor():
    """Elabora il file A_CLIFOR.TXT"""
    DATA_DIR = 'dati'
    filename = 'A_CLIFOR.TXT'
    filepath = os.path.join(DATA_DIR, filename)
    
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
            print(f"✗ File {filename} non trovato nella cartella '{DATA_DIR}'")
            return []
        except Exception as e:
            print(f"✗ Errore nel caricamento di {filename}: {e}")
            return []
    else:
        print(f"✗ Impossibile decodificare il file {filename} con nessun encoding supportato")
        return []

    anagrafiche = []
    righe_elaborate = 0
    errori = 0
    
    print(f"\nElaborazione Anagrafiche Clienti/Fornitori...")
    
    for i, line in enumerate(lines):
        if len(line.strip()) == 0:
            continue
            
        try:
            if len(line) < 200:  # Controllo lunghezza minima
                print(f"⚠ Riga {i+1} troppo corta: {len(line)} caratteri")
                errori += 1
                continue
                
            # Parsa la riga
            anagrafica = parse_line_clifor(line, A_CLIFOR_LAYOUT)
            
            # Arricchisce con descrizioni e calcoli
            anagrafica['TIPO_CONTO_DESC'] = get_tipo_conto_descrizione(anagrafica['TIPO_CONTO'])
            anagrafica['TIPO_SOGGETTO_DESC'] = get_tipo_soggetto_descrizione(anagrafica['TIPO_SOGGETTO'])
            anagrafica['SESSO_DESC'] = get_sesso_descrizione(anagrafica['SESSO'])
            anagrafica['QUADRO_770_DESC'] = get_quadro_770_descrizione(anagrafica['QUADRO_770'])
            anagrafica['TIPO_RITENUTA_DESC'] = get_tipo_ritenuta_descrizione(anagrafica['TIPO_RITENUTA'])
            anagrafica['CONTRIBUTO_335_DESC'] = get_contributo_335_descrizione(anagrafica['CONTRIBUTO_PREVID_335'])
            
            anagrafica['NOME_COMPLETO'] = format_nome_completo(anagrafica)
            anagrafica['SOTTOCONTO_ATTIVO'] = determine_sottoconto_attivo(anagrafica)
            
            # Flags boolean per facilità di analisi
            anagrafica['E_PERSONA_FISICA'] = anagrafica['TIPO_SOGGETTO'] == '0'
            anagrafica['E_CLIENTE'] = anagrafica['TIPO_CONTO'] in ['C', 'E']
            anagrafica['E_FORNITORE'] = anagrafica['TIPO_CONTO'] in ['F', 'E']
            anagrafica['HA_PARTITA_IVA'] = bool(anagrafica['PARTITA_IVA'])
            anagrafica['SOGGETTO_A_RITENUTA_BOOL'] = anagrafica['SOGGETTO_A_RITENUTA'] == 'X'
            anagrafica['GESTIONE_770_BOOL'] = anagrafica['GESTIONE_DATI_770'] == 'X'
            anagrafica['ENASARCO_BOOL'] = anagrafica['ENASARCO'] == 'X'
            anagrafica['SOGGETTO_INAIL_BOOL'] = anagrafica['SOGGETTO_INAIL'] == 'X'
            anagrafica['CONTRIBUTO_PREVID_BOOL'] = anagrafica['CONTRIBUTO_PREVIDENZIALE'] == 'X'
            
            anagrafiche.append(anagrafica)
            righe_elaborate += 1
            
        except Exception as e:
            print(f"✗ Errore nella riga {i+1}: {e}")
            errori += 1
            continue

    print(f"✓ Elaborate {righe_elaborate} anagrafiche")
    if errori > 0:
        print(f"⚠ Errori riscontrati: {errori}")
    
    return anagrafiche

def export_anagrafiche_to_excel(anagrafiche, filename="anagrafiche_clienti_fornitori.xlsx"):
    """Esporta le anagrafiche in Excel con formattazione avanzata"""
    if not anagrafiche:
        print("[AVVISO] Nessun dato da esportare")
        return

    # Prepara i dati per Excel
    excel_data = []
    
    for anagrafica in anagrafiche:
        row = {
            # Dati identificativi
            'Codice Univoco': anagrafica.get('CODICE_UNIVOCO', ''),
            'Codice Fiscale': anagrafica.get('CODICE_FISCALE_CLIFOR', ''),
            'Partita IVA': anagrafica.get('PARTITA_IVA', ''),
            'Codice Anagrafica': anagrafica.get('CODICE_ANAGRAFICA', ''),
            
            # Tipo e classificazione
            'Tipo Conto': anagrafica.get('TIPO_CONTO', ''),
            'Tipo Conto Descrizione': anagrafica.get('TIPO_CONTO_DESC', ''),
            'Tipo Soggetto': anagrafica.get('TIPO_SOGGETTO', ''),
            'Tipo Soggetto Descrizione': anagrafica.get('TIPO_SOGGETTO_DESC', ''),
            
            # Denominazione e nome
            'Nome Completo': anagrafica.get('NOME_COMPLETO', ''),
            'Denominazione': anagrafica.get('DENOMINAZIONE', ''),
            'Cognome': anagrafica.get('COGNOME', ''),
            'Nome': anagrafica.get('NOME', ''),
            'Sesso': anagrafica.get('SESSO', ''),
            'Sesso Descrizione': anagrafica.get('SESSO_DESC', ''),
            
            # Dati anagrafici
            'Data Nascita': anagrafica.get('DATA_NASCITA', ''),
            'Comune Nascita': anagrafica.get('COMUNE_NASCITA', ''),
            'Comune Residenza': anagrafica.get('COMUNE_RESIDENZA', ''),
            'CAP': anagrafica.get('CAP', ''),
            'Indirizzo': anagrafica.get('INDIRIZZO', ''),
            'Prefisso Telefono': anagrafica.get('PREFISSO_TELEFONO', ''),
            'Numero Telefono': anagrafica.get('NUMERO_TELEFONO', ''),
            'Codice ISO': anagrafica.get('CODICE_ISO', ''),
            'ID Fiscale Estero': anagrafica.get('ID_FISCALE_ESTERO', ''),
            
            # Conti contabili
            'Sottoconto Attivo': anagrafica.get('SOTTOCONTO_ATTIVO', ''),
            'Sottoconto Cliente': anagrafica.get('SOTTOCONTO_CLIENTE', ''),
            'Sottoconto Fornitore': anagrafica.get('SOTTOCONTO_FORNITORE', ''),
            
            # Dati pagamenti
            'Codice Incasso/Pagamento': anagrafica.get('CODICE_INCASSO_PAGAMENTO', ''),
            'Codice Incasso Cliente': anagrafica.get('CODICE_INCASSO_CLIENTE', ''),
            'Codice Pagamento Fornitore': anagrafica.get('CODICE_PAGAMENTO_FORNITORE', ''),
            'Codice Valuta': anagrafica.get('CODICE_VALUTA', ''),
            
            # Dati fiscali e ritenute
            'Soggetto a Ritenuta': anagrafica.get('SOGGETTO_A_RITENUTA_BOOL', False),
            'Gestione Dati 770': anagrafica.get('GESTIONE_770_BOOL', False),
            'Quadro 770': anagrafica.get('QUADRO_770', ''),
            'Quadro 770 Descrizione': anagrafica.get('QUADRO_770_DESC', ''),
            'Codice Ritenuta': anagrafica.get('CODICE_RITENUTA', ''),
            'Tipo Ritenuta': anagrafica.get('TIPO_RITENUTA', ''),
            'Tipo Ritenuta Descrizione': anagrafica.get('TIPO_RITENUTA_DESC', ''),
            'Contributo Previdenziale': anagrafica.get('CONTRIBUTO_PREVID_BOOL', False),
            'Enasarco': anagrafica.get('ENASARCO_BOOL', False),
            'Soggetto INAIL': anagrafica.get('SOGGETTO_INAIL_BOOL', False),
            'Contributo L.335/95': anagrafica.get('CONTRIBUTO_PREVID_335', ''),
            'Contributo L.335/95 Descrizione': anagrafica.get('CONTRIBUTO_335_DESC', ''),
            'Aliquota': anagrafica.get('ALIQUOTA', ''),
            'Percentuale Contributo Cassa': anagrafica.get('PERC_CONTRIBUTO_CASSA', ''),
            'Attività Mensilizzazione': anagrafica.get('ATTIVITA_MENSILIZZAZIONE', ''),
            
            # Flag di classificazione
            'È Persona Fisica': anagrafica.get('E_PERSONA_FISICA', False),
            'È Cliente': anagrafica.get('E_CLIENTE', False),
            'È Fornitore': anagrafica.get('E_FORNITORE', False),
            'Ha Partita IVA': anagrafica.get('HA_PARTITA_IVA', False)
        }
        excel_data.append(row)

    try:
        df = pd.DataFrame(excel_data)
        df.to_excel(filename, index=False, engine='openpyxl')
        
        print(f"\n✅ ESPORTAZIONE ANAGRAFICHE COMPLETATA!")
        print(f"📁 File creato: {filename}")
        print(f"📊 Anagrafiche esportate: {len(excel_data)}")
        
        # Statistiche dettagliate
        clienti = len([a for a in anagrafiche if a.get('E_CLIENTE')])
        fornitori = len([a for a in anagrafiche if a.get('E_FORNITORE')])
        entrambi = len([a for a in anagrafiche if a.get('TIPO_CONTO') == 'E'])
        persone_fisiche = len([a for a in anagrafiche if a.get('E_PERSONA_FISICA')])
        societa = len([a for a in anagrafiche if not a.get('E_PERSONA_FISICA')])
        con_partita_iva = len([a for a in anagrafiche if a.get('HA_PARTITA_IVA')])
        soggetti_ritenuta = len([a for a in anagrafiche if a.get('SOGGETTO_A_RITENUTA_BOOL')])
        
        print(f"📈 Statistiche:")
        print(f"   - Clienti: {clienti}")
        print(f"   - Fornitori: {fornitori}")
        print(f"   - Entrambi (C/F): {entrambi}")
        print(f"   - Persone Fisiche: {persone_fisiche}")
        print(f"   - Società/Enti: {societa}")
        print(f"   - Con Partita IVA: {con_partita_iva}")
        print(f"   - Soggetti a Ritenuta: {soggetti_ritenuta}")
        
    except PermissionError:
        print(f"\n✗ ERRORE: Impossibile scrivere '{filename}'")
        print("  Il file potrebbe essere aperto in Excel. Chiuderlo e riprovare.")
    except Exception as e:
        print(f"\n✗ ERRORE durante la creazione del file Excel: {e}")

def print_summary_anagrafiche(anagrafiche):
    """Stampa un riepilogo delle anagrafiche"""
    if not anagrafiche:
        print("\nNessuna anagrafica elaborata.")
        return
        
    print(f"\n" + "="*70)
    print(f"👥 RIEPILOGO ANAGRAFICHE CLIENTI/FORNITORI")
    print(f"="*70)
    print(f"📊 Totale anagrafiche: {len(anagrafiche)}")
    
    # Esempi per tipo
    print(f"\n📌 ESEMPI PER CATEGORIA:")
    
    clienti_esempi = [a for a in anagrafiche if a.get('TIPO_CONTO') == 'C'][:3]
    fornitori_esempi = [a for a in anagrafiche if a.get('TIPO_CONTO') == 'F'][:3]
    persone_fisiche_esempi = [a for a in anagrafiche if a.get('E_PERSONA_FISICA')][:3]
    
    if clienti_esempi:
        print(f"\n   👤 CLIENTI:")
        for cliente in clienti_esempi:
            print(f"      • {cliente.get('NOME_COMPLETO', 'N/A')} - {cliente.get('SOTTOCONTO_CLIENTE', 'N/A')}")
    
    if fornitori_esempi:
        print(f"\n   🏢 FORNITORI:")
        for fornitore in fornitori_esempi:
            print(f"      • {fornitore.get('NOME_COMPLETO', 'N/A')} - {fornitore.get('SOTTOCONTO_FORNITORE', 'N/A')}")
    
    if persone_fisiche_esempi:
        print(f"\n   👨‍👩‍👧‍👦 PERSONE FISICHE:")
        for persona in persone_fisiche_esempi:
            tipo_desc = persona.get('TIPO_CONTO_DESC', 'N/A')
            print(f"      • {persona.get('NOME_COMPLETO', 'N/A')} ({tipo_desc})")

# --- ESECUZIONE PRINCIPALE ---
if __name__ == "__main__":
    print("👥 PARSER ANAGRAFICHE CLIENTI/FORNITORI (A_CLIFOR.TXT)")
    print("=" * 70)
    
    anagrafiche = process_anagrafiche_clifor()
    
    if anagrafiche:
        print_summary_anagrafiche(anagrafiche)
        print("\n" + "=" * 70)
        print("📊 Esportazione in Excel...")
        export_anagrafiche_to_excel(anagrafiche)
        print("🎉 ELABORAZIONE COMPLETATA!")
    else:
        print("\n❌ Elaborazione terminata senza risultati.")
        print("Verificare che il file A_CLIFOR.TXT sia presente nella cartella 'dati'")