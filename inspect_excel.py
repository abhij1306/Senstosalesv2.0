
import pandas as pd
import openpyxl 
import sys

def inspect_excel(filename):
    try:
        # Load workbook
        wb = openpyxl.load_workbook(filename)
        ws = wb.active
        
        print(f"Sheet Name: {ws.title}")
        print("-" * 30)
        
        # Iterate over used range
        for row in ws.iter_rows(min_row=1, max_row=40, max_col=20):
             row_data = []
             for cell in row:
                 val = str(cell.value).strip() if cell.value is not None else ""
                 # Skip purely empty
                 if val == "":
                     val = "..."
                 row_data.append(f"{cell.coordinate}:{val}")
             
             # Only print if row has some content
             if any(x.split(":")[1] != "..." for x in row_data):
                print(" | ".join(row_data))

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_excel("Invoice_4544.xlsx")
