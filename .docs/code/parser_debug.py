import os

# LAYOUT CORRETTI dal parser.py originale
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

def debug_first_records():
    """Genera Golden Record di debug per i primi 5-10 record di TUTTI I 4 FILE"""
    print("🔬 GOLDEN RECORD DEBUG - PARSER PYTHON (4 FILE)")
    print("=" * 60)
    
    # Crea dati di esempio fittizi per test se non abbiamo file reali
    sample_pntesta_line = "000123456789012345X123456789012345ABCAAA2025CAUS01CAUSALE DI TEST MOLTO LUNGA    2512202502AACAU0123456789ABCDEF123456789012SIGLA_TEST  2412202412345       D2412202412345 D2412202410000240000002412202412345678901234567890123456789012345678901234567890123456789012340000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    
    sample_pnrigcon_line = "000123456789012001C123456789ABCDEF 123456789  1234567890  12345678900120000012345678901234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001                                                                                                                                                             0"
    
    # Righe IVA più lunghe (173 bytes)
    sample_pnrigiva_line = "000123456789012IV01CONTROP123  12345678901 12345678901 12345678901 12345678901 12345678901 12345678901 12345678901 NOTE RIGA IVA 12345678901234567890123456789012345678901234567890123456789 SIGLA_CTR123"
    
    # Movimenti analitici più corti (34 bytes)
    sample_movanac_line = "000123456789012001CC01123456789012"
    
    # FILE 1: PNTESTA
    if len(sample_pntesta_line) >= 252:  # Verifica lunghezza minima
        print("\n🔍 FILE 1 - PNTESTA.TXT:")
        print(f"   📏 Lunghezza: {len(sample_pntesta_line)} bytes")
        record = parse_line(sample_pntesta_line, PNTESTA_LAYOUT)
        for field, value in record.items():
            print(f"   {field:25} = '{value}'")
    
    # FILE 2: PNRIGCON
    if len(sample_pnrigcon_line) >= 82:  # Verifica lunghezza minima
        print("\n🔍 FILE 2 - PNRIGCON.TXT:")
        print(f"   📏 Lunghezza: {len(sample_pnrigcon_line)} bytes")
        record = parse_line(sample_pnrigcon_line, PNRIGCON_LAYOUT)
        for field, value in record.items():
            print(f"   {field:25} = '{value}'")
    
    # FILE 3: PNRIGIVA
    if len(sample_pnrigiva_line) >= 101:  # Verifica lunghezza minima
        print("\n🔍 FILE 3 - PNRIGIVA.TXT:")
        print(f"   📏 Lunghezza: {len(sample_pnrigiva_line)} bytes")
        record = parse_line(sample_pnrigiva_line, PNRIGIVA_LAYOUT)
        for field, value in record.items():
            print(f"   {field:25} = '{value}'")
    
    # FILE 4: MOVANAC
    if len(sample_movanac_line) >= 34:  # Verifica lunghezza minima
        print("\n🔍 FILE 4 - MOVANAC.TXT:")
        print(f"   📏 Lunghezza: {len(sample_movanac_line)} bytes")
        record = parse_line(sample_movanac_line, MOVANAC_LAYOUT)
        for field, value in record.items():
            print(f"   {field:25} = '{value}'")
    
    print("\n" + "=" * 60)
    print("✅ Golden Record COMPLETO generato per tutti i 4 file.")
    print("   Usare come metro di paragone per TypeScript.")

if __name__ == "__main__":
    debug_first_records() 