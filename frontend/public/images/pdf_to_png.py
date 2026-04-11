import fitz  # PyMuPDF

pdf_path = "系館AP位置圖.pdf"
output_path = "basement_page.png"

doc = fitz.open(pdf_path)
page = doc[0]  # 第 1 頁，索引從 0 開始

pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
pix.save(output_path)

doc.close()

print(f"完成：{output_path}")
