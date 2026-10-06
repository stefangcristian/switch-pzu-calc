import pandas as pd
import sys

file_path = '../Strategy_06.10.2026.xlsx'
try:
    xls = pd.ExcelFile(file_path)
    print("Sheets:", xls.sheet_names)
    for sheet in xls.sheet_names:
        print(f"\n--- Sheet: {sheet} ---")
        df = pd.read_excel(file_path, sheet_name=sheet)
        print(df.head(10))
except Exception as e:
    print("Error:", e)
