
import openpyxl
import sys

def map_excel(filename):
    try:
        wb = openpyxl.load_workbook(filename)
        ws = wb.active
        
        with open("excel_dump.txt", "w", encoding="utf-8") as f:
            for row in ws.iter_rows():
                for cell in row:
                    if cell.value:
                        f.write(f"[{cell.coordinate}] {cell.value}\n")
                        
    except Exception as e:
        with open("excel_dump.txt", "w") as f:
            f.write(f"Error: {e}")

if __name__ == "__main__":
    map_excel("Invoice_4544.xlsx")
