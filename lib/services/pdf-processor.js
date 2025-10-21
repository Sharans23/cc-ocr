import { createWorker } from "tesseract.js"
import { preprocessImage, getTesseractConfig } from "../utils/image-processing"

const pdfjsLib = null

const loadPdfJs = async () => {
  // Check if already loaded
  if (window.pdfjsLib) {
    return window.pdfjsLib
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs"
    script.type = "module"

    script.onload = () => {
      // Wait a bit for the library to initialize
      const checkLib = setInterval(() => {
        if (window.pdfjsLib) {
          clearInterval(checkLib)
          // Configure worker
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs"
          resolve(window.pdfjsLib)
        }
      }, 50)

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkLib)
        if (!window.pdfjsLib) {
          reject(new Error("Failed to load PDF.js"))
        }
      }, 5000)
    }

    script.onerror = () => reject(new Error("Failed to load PDF.js script"))
    document.head.appendChild(script)
  })
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
