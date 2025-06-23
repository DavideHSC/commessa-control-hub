#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyzer Automatico Relazioni - Contabilità Evolution
Analizza automaticamente le relazioni tra i file estratti
"""

import pandas as pd
import os
import logging
from collections import defaultdict
import numpy as np

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('relational_analyzer.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class RelationalAnalyzer:
    def __init__(self):
        self.dataframes = {}
        self.relationships = []
        self.stats = {}
        
    def load_excel_files(self):
        """Carica tutti i file Excel generati dai parser"""
        
        files_to_load = {
            'prime_note': 'report_contabile_definitivo.xlsx',
            'piano_conti': 'piano_dei_conti.xlsx', 
            'anagrafiche': 'anagrafiche_clienti_fornitori.xlsx',
            'causali': 'causali_contabili.xlsx',
            'codici_iva': 'codici_iva.xlsx',
            'codici_pagamento': 'codici_pagamento.xlsx'
        }
        
        for name, filename in files_to_load.items():
            if os.path.exists(filename):
                try:
                    # Carica il primo foglio di ogni file
                    df = pd.read_excel(filename, sheet_name=0)
                    self.dataframes[name] = df
                    logging.info(f"Caricato {name}: {len(df)} righe, {len(df.columns)} colonne")
                    
                    # Mostra alcune colonne chiave
                    key_columns = [col for col in df.columns if any(keyword in col.lower() 
                                 for keyword in ['codice', 'id', 'conto', 'causale', 'iva', 'anagrafica', 'pagamento'])]
                    if key_columns:
                        logging.info(f"  Colonne chiave: {key_columns[:5]}")
                        
                except Exception as e:
                    logging.error(f"Errore caricamento {filename}: {e}")
            else:
                logging.warning(f"File non trovato: {filename}")
    
    def analyze_potential_keys(self):
        """Identifica potenziali chiavi primarie e esterne"""
        
        key_analysis = {}
        
        for name, df in self.dataframes.items():
            analysis = {
                'potential_primary_keys': [],
                'potential_foreign_keys': [],
                'unique_columns': [],
                'stats': {}
            }
            
            for col in df.columns:
                col_lower = col.lower()
                non_null_count = df[col].notna().sum()
                unique_count = df[col].nunique()
                total_count = len(df)
                
                # Statistiche colonna
                analysis['stats'][col] = {
                    'non_null_count': non_null_count,
                    'unique_count': unique_count,
                    'total_count': total_count,
                    'completeness': non_null_count / total_count if total_count > 0 else 0,
                    'uniqueness': unique_count / non_null_count if non_null_count > 0 else 0
                }
                
                # Potenziali chiavi primarie (univoche e complete)
                if unique_count == total_count and non_null_count == total_count:
                    analysis['potential_primary_keys'].append(col)
                
                # Colonne con alta univocità
                if unique_count / non_null_count > 0.8 if non_null_count > 0 else False:
                    analysis['unique_columns'].append(col)
                
                # Potenziali chiavi esterne (pattern comuni)
                if any(keyword in col_lower for keyword in [
                    'codice', 'id', 'conto', 'causale', 'iva', 'anagrafica', 'pagamento', 'cliente', 'fornitore'
                ]):
                    analysis['potential_foreign_keys'].append(col)
            
            key_analysis[name] = analysis
            
        return key_analysis
    
    def find_relationships(self):
        """Trova relazioni automaticamente tra le tabelle"""
        
        relationships = []
        
        # Definisce pattern di matching per identificare relazioni
        patterns = [
            # Relazioni dirette (nome colonna simile)
            {
                'type': 'direct_match',
                'description': 'Corrispondenza diretta nome colonna'
            },
            # Relazioni per contenuto (valori che matchano)
            {
                'type': 'content_match', 
                'description': 'Corrispondenza valori'
            }
        ]
        
        tables = list(self.dataframes.keys())
        
        for i, table1 in enumerate(tables):
            for table2 in tables[i+1:]:
                df1 = self.dataframes[table1]
                df2 = self.dataframes[table2]
                
                # Confronta tutte le colonne tra le due tabelle
                for col1 in df1.columns:
                    for col2 in df2.columns:
                        relationship = self.analyze_column_relationship(
                            table1, col1, df1[col1],
                            table2, col2, df2[col2]
                        )
                        
                        if relationship['match_score'] > 0.1:  # Soglia minima di matching
                            relationships.append(relationship)
        
        # Ordina per punteggio di matching
        relationships.sort(key=lambda x: x['match_score'], reverse=True)
        
        return relationships
    
    def analyze_column_relationship(self, table1, col1, series1, table2, col2, series2):
        """Analizza la relazione tra due colonne"""
        
        relationship = {
            'table1': table1,
            'column1': col1,
            'table2': table2, 
            'column2': col2,
            'match_score': 0,
            'match_type': '',
            'statistics': {},
            'sample_matches': []
        }
        
        # Pulisce i dati per il confronto
        clean_series1 = series1.dropna().astype(str).str.strip()
        clean_series2 = series2.dropna().astype(str).str.strip()
        
        if len(clean_series1) == 0 or len(clean_series2) == 0:
            return relationship
        
        # Calcola intersezione
        set1 = set(clean_series1)
        set2 = set(clean_series2)
        intersection = set1.intersection(set2)
        
        # Statistiche base
        relationship['statistics'] = {
            'unique_values_table1': len(set1),
            'unique_values_table2': len(set2),
            'common_values': len(intersection),
            'intersection_ratio_table1': len(intersection) / len(set1) if set1 else 0,
            'intersection_ratio_table2': len(intersection) / len(set2) if set2 else 0
        }
        
        # Sample di valori che matchano
        relationship['sample_matches'] = list(intersection)[:10]
        
        # Calcola score di matching
        score = 0
        
        # 1. Similarità nome colonna
        name_similarity = self.calculate_name_similarity(col1, col2)
        score += name_similarity * 0.3
        
        # 2. Percentuale di valori in comune
        if len(set1) > 0 and len(set2) > 0:
            content_similarity = len(intersection) / min(len(set1), len(set2))
            score += content_similarity * 0.7
        
        # 3. Bonus per pattern specifici
        if self.has_key_pattern(col1) and self.has_key_pattern(col2):
            score += 0.2
            
        relationship['match_score'] = min(score, 1.0)
        
        # Determina tipo di relazione
        if name_similarity > 0.8:
            relationship['match_type'] = 'direct_name_match'
        elif content_similarity > 0.8:
            relationship['match_type'] = 'high_content_match'
        elif content_similarity > 0.3:
            relationship['match_type'] = 'partial_content_match'
        else:
            relationship['match_type'] = 'low_match'
            
        return relationship
    
    def calculate_name_similarity(self, name1, name2):
        """Calcola similarità tra nomi di colonne"""
        name1_clean = name1.lower().replace('_', '').replace(' ', '')
        name2_clean = name2.lower().replace('_', '').replace(' ', '')
        
        # Exact match
        if name1_clean == name2_clean:
            return 1.0
            
        # Substring match
        if name1_clean in name2_clean or name2_clean in name1_clean:
            return 0.8
            
        # Common keywords
        keywords = ['codice', 'id', 'conto', 'causale', 'iva', 'anagrafica', 'pagamento']
        for keyword in keywords:
            if keyword in name1_clean and keyword in name2_clean:
                return 0.6
                
        return 0
    
    def has_key_pattern(self, column_name):
        """Verifica se la colonna ha pattern tipici di chiave"""
        col_lower = column_name.lower()
        patterns = ['codice', 'id', 'key', 'cod', 'numero']
        return any(pattern in col_lower for pattern in patterns)
    
    def generate_relationship_report(self, relationships):
        """Genera report delle relazioni trovate"""
        
        print("\n" + "="*100)
        print("ANALISI RELAZIONI AUTOMATICA - CONTABILITÀ EVOLUTION")
        print("="*100)
        
        print(f"\nTABELLE CARICATE:")
        print("-"*50)
        for name, df in self.dataframes.items():
            print(f"{name:<25}: {len(df):>8} righe, {len(df.columns):>3} colonne")
        
        print(f"\nRELAZIONI IDENTIFICATE (Score > 0.3):")
        print("-"*80)
        high_score_relationships = [r for r in relationships if r['match_score'] > 0.3]
        
        for rel in high_score_relationships:
            print(f"\nScore: {rel['match_score']:.3f} | Tipo: {rel['match_type']}")
            print(f"  {rel['table1']}.{rel['column1']} ↔ {rel['table2']}.{rel['column2']}")
            print(f"  Valori comuni: {rel['statistics']['common_values']}")
            if rel['sample_matches']:
                print(f"  Esempi: {', '.join(map(str, rel['sample_matches'][:5]))}")
        
        # Relazioni più probabili
        print(f"\nRELAZIONI PRINCIPALI (Score > 0.7):")
        print("-"*60)
        primary_relationships = [r for r in relationships if r['match_score'] > 0.7]
        
        for rel in primary_relationships:
            ratio1 = rel['statistics']['intersection_ratio_table1']
            ratio2 = rel['statistics']['intersection_ratio_table2']
            
            # Determina direzione della relazione
            if ratio1 > 0.8 and ratio2 < 0.5:
                direction = f"{rel['table1']} → {rel['table2']} (One-to-Many)"
            elif ratio2 > 0.8 and ratio1 < 0.5:
                direction = f"{rel['table2']} → {rel['table1']} (One-to-Many)"
            elif ratio1 > 0.8 and ratio2 > 0.8:
                direction = "One-to-One o stesso campo"
            else:
                direction = "Many-to-Many"
                
            print(f"• {rel['table1']}.{rel['column1']} ↔ {rel['table2']}.{rel['column2']}")
            print(f"  {direction} | Score: {rel['match_score']:.3f}")
            print(f"  Copertura: {ratio1:.1%} → {ratio2:.1%}")
        
        return high_score_relationships, primary_relationships
    
    def generate_sql_schema(self, primary_relationships):
        """Genera schema SQL basato sulle relazioni trovate"""
        
        sql_schema = []
        sql_schema.append("-- Schema Database Contabilità Evolution")
        sql_schema.append("-- Generato automaticamente dall'analisi delle relazioni\n")
        
        # Crea tabelle
        for table_name, df in self.dataframes.items():
            sql_schema.append(f"-- Tabella: {table_name}")
            sql_schema.append(f"CREATE TABLE {table_name} (")
            
            columns = []
            for col in df.columns:
                # Determina tipo di dato
                if df[col].dtype in ['int64', 'int32']:
                    col_type = "INTEGER"
                elif df[col].dtype in ['float64', 'float32']:
                    col_type = "DECIMAL(15,2)"
                elif df[col].dtype == 'bool':
                    col_type = "BOOLEAN"
                elif df[col].dtype == 'datetime64[ns]':
                    col_type = "DATE"
                else:
                    max_length = df[col].astype(str).str.len().max()
                    col_type = f"VARCHAR({min(max_length + 10, 255) if pd.notna(max_length) else 255})"
                
                columns.append(f"    {col} {col_type}")
            
            sql_schema.append(",\n".join(columns))
            sql_schema.append(");\n")
        
        # Aggiungi foreign keys per relazioni principali
        sql_schema.append("-- Foreign Keys")
        for rel in primary_relationships:
            if rel['statistics']['intersection_ratio_table1'] > 0.7:
                sql_schema.append(
                    f"ALTER TABLE {rel['table1']} ADD FOREIGN KEY ({rel['column1']}) "
                    f"REFERENCES {rel['table2']}({rel['column2']});"
                )
        
        return "\n".join(sql_schema)
    
    def run_full_analysis(self):
        """Esegue analisi completa"""
        
        logging.info("Inizio analisi relazionale automatica")
        
        # 1. Carica dati
        self.load_excel_files()
        
        if not self.dataframes:
            logging.error("Nessun file Excel trovato!")
            return
        
        # 2. Analizza chiavi
        key_analysis = self.analyze_potential_keys()
        
        # 3. Trova relazioni
        relationships = self.find_relationships()
        
        # 4. Genera report
        high_score_rels, primary_rels = self.generate_relationship_report(relationships)
        
        # 5. Genera schema SQL
        sql_schema = self.generate_sql_schema(primary_rels)
        
        # 6. Salva risultati
        self.save_results(key_analysis, relationships, sql_schema)
        
        return {
            'key_analysis': key_analysis,
            'all_relationships': relationships,
            'high_score_relationships': high_score_rels,
            'primary_relationships': primary_rels,
            'sql_schema': sql_schema
        }
    
    def save_results(self, key_analysis, relationships, sql_schema):
        """Salva i risultati dell'analisi"""
        
        # Salva schema SQL
        with open('schema_contabilita.sql', 'w', encoding='utf-8') as f:
            f.write(sql_schema)
        
        # Salva report relazioni
        with pd.ExcelWriter('analisi_relazioni.xlsx', engine='openpyxl') as writer:
            
            # Foglio relazioni
            if relationships:
                rel_df = pd.DataFrame([
                    {
                        'Tabella1': r['table1'],
                        'Colonna1': r['column1'], 
                        'Tabella2': r['table2'],
                        'Colonna2': r['column2'],
                        'Score': r['match_score'],
                        'Tipo': r['match_type'],
                        'Valori_Comuni': r['statistics']['common_values'],
                        'Copertura_T1': r['statistics']['intersection_ratio_table1'],
                        'Copertura_T2': r['statistics']['intersection_ratio_table2']
                    } for r in relationships
                ])
                rel_df.to_excel(writer, sheet_name='Relazioni', index=False)
            
            # Foglio statistiche tabelle
            table_stats = []
            for table_name, df in self.dataframes.items():
                table_stats.append({
                    'Tabella': table_name,
                    'Righe': len(df),
                    'Colonne': len(df.columns),
                    'Colonne_Chiave': len([col for col in df.columns if self.has_key_pattern(col)])
                })
            
            stats_df = pd.DataFrame(table_stats)
            stats_df.to_excel(writer, sheet_name='Statistiche_Tabelle', index=False)
        
        logging.info("Risultati salvati in:")
        logging.info("- schema_contabilita.sql")
        logging.info("- analisi_relazioni.xlsx")

def main():
    """Funzione principale"""
    analyzer = RelationalAnalyzer()
    results = analyzer.run_full_analysis()
    
    print(f"\nAnalisi completata! Controllare i file generati:")
    print("- schema_contabilita.sql")
    print("- analisi_relazioni.xlsx")
    print("- relational_analyzer.log")

if __name__ == "__main__":
    main()