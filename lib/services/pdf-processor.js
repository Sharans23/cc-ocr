import { preprocessImage } from "../utils/image-processing";
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY;
const OCR_SPACE_API_URL = "https://api.ocr.space/parse/image";

const pdfjsLib = null;

const loadPdfJs = async () => {
  // Check if already loaded
  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs";
    script.type = "module";

    script.onload = () => {
      // Wait a bit for the library to initialize
      const checkLib = setInterval(() => {
        if (window.pdfjsLib) {
          clearInterval(checkLib);
          // Configure worker
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";
          resolve(window.pdfjsLib);
        }
      }, 50);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkLib);
        if (!window.pdfjsLib) {
          reject(new Error("Failed to load PDF.js"));
        }
      }, 5000);
    };

    script.onerror = () => reject(new Error("Failed to load PDF.js script"));
    document.head.appendChild(script);
  });
};

// Perform OCR using OCR.space API
const performOCR = async (imageDataUrl) => {
  try {
    // Convert data URL to base64 string (remove the data:image/png;base64, prefix)
    const base64Image = imageDataUrl.split(",")[1];

    // Create form data for the API request
    const formData = new FormData();
    formData.append("base64Image", `data:image/png;base64,${base64Image}`);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("isTable", "true");
    formData.append("OCREngine", "2"); // Engine 2 has better accuracy

    console.log("[v0] Sending image to OCR.space API...");

    const response = await fetch(OCR_SPACE_API_URL, {
      method: "POST",
      headers: {
        apikey: OCR_SPACE_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `OCR API request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    console.log("[v0] OCR.space API response:", result);

    // Check for errors
    if (result.IsErroredOnProcessing) {
      throw new Error(
        `OCR processing error: ${result.ErrorMessage || "Unknown error"}`
      );
    }

    // Extract parsed text from the first result
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      const parsedResult = result.ParsedResults[0];

      if (parsedResult.FileParseExitCode === 1) {
        console.log(
          `[v0] OCR successful! Extracted ${
            parsedResult.ParsedText?.length || 0
          } characters`
        );
        return parsedResult.ParsedText || "";
      } else {
        throw new Error(
          `OCR parsing failed: ${
            parsedResult.ErrorMessage || "Unknown error"
          } (Exit code: ${parsedResult.FileParseExitCode})`
        );
      }
    }

    throw new Error("No OCR results returned");
  } catch (error) {
    console.error("[v0] OCR error:", error);
    throw error;
  }
};

// Process PDF and extract text using OCR
export const processPDF = async (file, onProgress) => {
  const pdfjs = await loadPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  console.log(`[v0] PDF loaded: ${numPages} pages`);
  onProgress(10);

  let fullText = "";

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    console.log(`[v0] Processing page ${pageNum}/${numPages}`);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 3.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const processedCanvas = preprocessImage(context, canvas);
    const imageData = processedCanvas.toDataURL("image/png", 1.0);

    const text = await performOCR(imageData);

    fullText += `===== Page ${pageNum} =====\n\n${text}\n\n`;

    const pageProgress = 10 + (pageNum / numPages) * 80;
    onProgress(pageProgress);
  }

  console.log(
    `[v0] OCR complete! Total text length: ${fullText.length} characters`
  );

  return fullText;
};
