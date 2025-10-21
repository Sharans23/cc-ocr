// Preprocess image for better OCR accuracy
export const preprocessImage = (context, canvas) => {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    const contrast = 1.8
    const enhanced = (gray - 128) * contrast + 128
    const final = Math.max(0, Math.min(255, enhanced))
    data[i] = data[i + 1] = data[i + 2] = final
  }

  context.putImageData(imageData, 0, 0)
  return canvas
}

// Get Tesseract configuration
export const getTesseractConfig = () => ({
  tessedit_pageseg_mode: "6",
  tessedit_ocr_engine_mode: "1",
  tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$₹¥€.,/-():&@# ",
  preserve_interword_spaces: "1",
  textord_tabfind_find_tables: "1",
  textord_tablefind: "1",
  tessedit_do_invert: "0",
  textord_min_linesize: "2.0",
  textord_heavy_nr: "1",
})
