import fitz  # PyMuPDF

pdf_path = "系館AP位置圖_轉正.pdf"

doc = fitz.open(pdf_path)

# 匯出第 3 頁到第 7 頁
# Python range 結尾不包含，所以 range(2, 7) 代表 2,3,4,5,6
for page_index in range(2, 7):
    page = doc[page_index]

    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)

    # page_index + 1 才是真正的頁碼
    output_path = f"floor{page_index}_page.png"
    pix.save(output_path)

    print(f"完成：{output_path}")

doc.close()
