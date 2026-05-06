import fitz  # PyMuPDF

input_pdf = "系館AP位置圖.pdf"
output_pdf = "系館AP位置圖_轉正.pdf"

doc = fitz.open(input_pdf)

for page in doc:
    # 順時針轉 90 度
    page.set_rotation((page.rotation + 90) % 360)

doc.save(output_pdf)
doc.close()

print(f"完成：{output_pdf}")
