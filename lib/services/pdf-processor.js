import { createWorker } from "tesseract.js"
import { preprocessImage, getTesseractConfig } from "../utils/image-processing"

let pdfjsLib = null

const loadPdfJs = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist")
    // Configure PDF.js worker with CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
  }
  return pdfjsLib
}

// Process PDF and extract text using OCR
export const processPDF = async (file, onProgress) => {
  const pdfjs = await loadPdfJs()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const numPages = pdf.numPages

  console.log(`PDF loaded: ${numPages} pages`)
  onProgress(10)

  let fullText = ""

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    console.log(`Processing page ${pageNum}/${numPages}`)

    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 3.5 })

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    const processedCanvas = preprocessImage(context, canvas)
    const imageData = processedCanvas.toDataURL("image/png", 1.0)

    const worker = await createWorker("eng")
    await worker.setParameters(getTesseractConfig())

    const {
      data: { text },
    } = await worker.recognize(imageData)
    await worker.terminate()

    fullText += `===== Page ${pageNum} =====\n\n${text}\n\n`

    const pageProgress = 10 + (pageNum / numPages) * 80
    onProgress(pageProgress)
  }

  return fullText
}
