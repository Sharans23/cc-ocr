"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileText,
  Loader2,
  CreditCard,
  Calendar,
  DollarSign,
  Hash,
  Building2,
  History,
  FileJson,
  FileCode,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Sparkles,
  AlertCircle,
  Wallet,
} from "lucide-react"
import { createWorker } from "tesseract.js"
import * as pdfjsLib from "pdfjs-dist"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

function App() {
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const [rawOcrText, setRawOcrText] = useState("")
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState("")
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [ocrEngine, setOcrEngine] = useState("tesseract")

  useEffect(() => {
    if (isSupabaseConfigured()) {
      loadHistory()
    }
  }, [])

  const loadHistory = async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from("extraction_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setHistory(data || [])
    } catch (err) {
      console.error("Error loading history:", err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const saveToHistory = async (data, rawText, filename) => {
    if (!isSupabaseConfigured()) {
      console.log("[v0] Supabase not configured, skipping history save")
      return
    }

    try {
      const { error } = await supabase.from("extraction_history").insert([
        {
          file_name: filename,
          card_issuer: data.cardIssuer,
          card_last_4: data.cardLast4,
          billing_cycle: data.billingCycle,
          due_date: data.dueDate,
          total_due: data.totalDue,
          customer_name: data.customerName,
          credit_limit: data.creditLimit,
          available_credit: data.availableCredit,
          raw_ocr_text: rawText,
        },
      ])

      if (error) throw error
      await loadHistory()
    } catch (err) {
      console.error("Error saving to history:", err)
    }
  }

  const cleanText = (text) => {
    return text
      .replace(/\s+/g, " ")
      .replace(/[^\w\s@.,$₹¥€£\-:/()%*#&\n]/g, "")
      .replace(/(\d)\s+(\d)/g, "$1$2")
      .replace(/\n\s*\n/g, "\n")
      .trim()
  }

  const preprocessImage = (context, canvas) => {
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

  const getTesseractConfig = () => ({
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

  const extractDataFromText = (text) => {
    console.log("Raw OCR Text:", text)
    const cleanedText = cleanText(text)
    console.log("Cleaned Text:", cleanedText)

    const data = {
      cardIssuer: "Not Detected",
      cardLast4: "Not Detected",
      billingCycle: "Not Detected",
      dueDate: "Not Detected",
      totalDue: "Not Detected",
      customerName: "Not Detected",
      creditLimit: "Not Detected",
      availableCredit: "Not Detected",
    }

    const namePatterns = [
      /(?:Customer Name|Name|Cardholder|Holder's Name)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/m,
      /Statement for[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
      /Dear\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
      /(?:\n|\r)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\n|\r)/,
    ]

    for (const pattern of namePatterns) {
      const match = cleanedText.match(pattern)
      if (match && match[1]) {
        const name = match[1].trim()
        if (!name.match(/(?:Customer|Relationship|Account|Number|Statement|Date)/i) && name.length > 3) {
          data.customerName = name
          break
        }
      }
    }

    if (data.customerName === "Not Detected") {
      const allCapsMatch = cleanedText.match(
        /([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})(?:\s+(?:GURGAON|DELHI|MUMBAI|CHENNAI|BANGALORE|KOLKATA|HYDERABAD|PUNE|MAHARASHTRA|KARNATAKA))/i,
      )
      if (allCapsMatch) {
        data.customerName = allCapsMatch[1]
      }
    }

    const issuerPatterns = [
      { pattern: /IDFC\s*(?:First\s*)?Bank|IDFC/i, name: "IDFC First Bank" },
      { pattern: /RBL\s*Bank|RBLBANK/i, name: "RBL Bank" },
      { pattern: /HDFC\s*Bank|HDFC/i, name: "HDFC Bank" },
      { pattern: /ICICI\s*Bank|ICICI/i, name: "ICICI Bank" },
      { pattern: /Axis\s*Bank|AXIS/i, name: "Axis Bank" },
      { pattern: /SBI\s*Card|State\s*Bank/i, name: "SBI Card" },
      {
        pattern: /Bank\s+of\s+America|BOA|BANK OF AMERICA/i,
        name: "Bank of America",
      },
      { pattern: /American\s*Express|AMEX/i, name: "American Express" },
      { pattern: /Citibank|CITI/i, name: "Citibank" },
      { pattern: /Standard\s*Chartered/i, name: "Standard Chartered" },
      { pattern: /HSBC/i, name: "HSBC" },
      { pattern: /Kotak\s*Mahindra|Kotak/i, name: "Kotak Mahindra Bank" },
      { pattern: /IndusInd\s*Bank|IndusInd/i, name: "IndusInd Bank" },
      { pattern: /Bajaj\s*Finserv/i, name: "Bajaj Finserv" },
    ]

    for (const { pattern, name } of issuerPatterns) {
      if (pattern.test(cleanedText)) {
        data.cardIssuer = name
        break
      }
    }

    const cardNumberPatterns = [
      /(?:Card\s*Number|Card\s*No\.?)[:\s]*[\dX*]{8,}.*?(\d{4})/i,
      /(?:Account\s*Number)[:\s]*\d{0,4}.*?(\d{4})/i,
      /(?:ending|ends\s*in|last\s*4)\s*(?:digits)?[:\s]*(\d{4})/i,
      /[X*]{8,}\s*(\d{4})/,
      /Card Number:\s*[\dX*]{8,}.*?(\d{4})/i,
    ]

    for (const pattern of cardNumberPatterns) {
      const match = cleanedText.match(pattern)
      if (match && match[1]) {
        const last4 = match[1]
        if (!isCommonFalsePositive(last4, cleanedText)) {
          data.cardLast4 = last4
          break
        }
      }
    }

    const datePatterns = [
      /(?:Payment\s*Due\s*Date|Due\s*Date)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /Due\s*Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:Payment|Due)/i,
      /Payment Due Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    ]

    for (const pattern of datePatterns) {
      const match = cleanedText.match(pattern)
      if (match && match[1]) {
        data.dueDate = formatDate(match[1])
        break
      }
    }

    const billingCyclePatterns = [
      /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /Statement Period[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /Billing Cycle[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|-|–)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    ]

    for (const pattern of billingCyclePatterns) {
      const match = cleanedText.match(pattern)
      if (match && match[1] && match[2]) {
        data.billingCycle = `${formatDate(match[1])} → ${formatDate(match[2])}`
        break
      }
    }

    const amountPatterns = [
      /Total Amount Due[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
      /(?:Total\s*Amount\s*Due|Amount\s*Due)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
      /(?:Rs\.?|INR|₹|¥)\s*([\d,]+\.?\d*)\s*(?:Total|Due|Payable|Balance)/i,
      /Total Payment Due[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
      /New Balance Total[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
    ]

    for (const pattern of amountPatterns) {
      const match = cleanedText.match(pattern)
      if (match && match[1]) {
        const amount = match[1].replace(/,/g, "")
        const currency = detectCurrency(cleanedText)
        data.totalDue = `${currency}${amount}`
        break
      }
    }

    const creditLimitPatterns = [
      /(?:Credit\s*Limit|Total\s*Credit\s*Line)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
      /(?:Available\s*Credit|Credit\s*Available)[:\s]*(?:Rs\.?|INR|₹|¥)?\s*([\d,]+\.?\d*)/i,
    ]

    for (const pattern of creditLimitPatterns) {
      const match = cleanedText.match(pattern)
      if (match && match[1]) {
        const amount = match[1].replace(/,/g, "")
        const currency = detectCurrency(cleanedText)
        if (pattern.source.includes("Credit Limit")) {
          data.creditLimit = `${currency}${amount}`
        } else {
          data.availableCredit = `${currency}${amount}`
        }
      }
    }

    console.log("Final Extracted Data:", data)
    return data
  }

  const isCommonFalsePositive = (number, text) => {
    const commonFalsePositives = ["0000", "0001", "1234", "4045", "5000"]
    return commonFalsePositives.includes(number) || text.includes(`Relationship ${number}`)
  }

  const formatDate = (dateStr) => {
    return dateStr.replace(/-/g, "/")
  }

  const detectCurrency = (text) => {
    if (/USD|\$/.test(text)) return "$"
    if (/INR|Rs|₹/.test(text)) return "₹"
    if (/¥/.test(text)) return "¥"
    return "₹"
  }

  const processPDF = async (file) => {
    try {
      setProcessing(true)
      setError("")
      setProgress(0)
      setExtractedData(null)
      setRawOcrText("")
      setFileName(file.name)

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages

      console.log(`PDF loaded: ${numPages} pages`)
      setProgress(10)

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
        setProgress(pageProgress)
      }

      setRawOcrText(fullText)
      const extractedInfo = extractDataFromText(fullText)
      setExtractedData(extractedInfo)
      setProgress(100)

      await saveToHistory(extractedInfo, fullText, file.name)
    } catch (err) {
      console.error("Error processing PDF:", err)
      setError(`Error processing PDF: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      processPDF(file)
    } else {
      setError("Please upload a valid PDF file")
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
      processPDF(file)
    } else {
      setError("Please upload a valid PDF file")
    }
  }

  const downloadJSON = () => {
    if (!extractedData) return

    const dataStr = JSON.stringify(extractedData, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `statement-${fileName.replace(".pdf", "")}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadRawText = () => {
    if (!rawOcrText) return

    const blob = new Blob([rawOcrText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `statement-${fileName.replace(".pdf", "")}-raw.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadHistoricalExtraction = (item) => {
    setExtractedData({
      cardIssuer: item.card_issuer,
      cardLast4: item.card_last_4,
      billingCycle: item.billing_cycle,
      dueDate: item.due_date,
      totalDue: item.total_due,
      customerName: item.customer_name,
      creditLimit: item.credit_limit,
      availableCredit: item.available_credit,
    })
    setRawOcrText(item.raw_ocr_text)
    setFileName(item.file_name)
  }

  const getStatusIcon = (value) => {
    return value === "Not Detected" ? (
      <XCircle className="h-4 w-4 text-destructive" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <header className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl" />
              <div className="relative bg-primary p-4 rounded-2xl shadow-lg">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-center mb-4 text-balance">Statement Parser</h1>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed text-balance">
            Extract financial data from PDF statements with AI-powered OCR technology
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Badge variant="secondary" className="gap-2 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Enhanced Accuracy
            </Badge>
            <Badge variant="secondary" className="gap-2 px-4 py-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Multi-Bank Support
            </Badge>
          </div>
        </header>

        <Tabs defaultValue="extract" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="extract"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg font-medium"
              >
                <Upload className="h-4 w-4" />
                Extract Data
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg font-medium"
              >
                <History className="h-4 w-4" />
                History ({history.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="extract" className="space-y-8">
            <Card className="border-2">
              <CardContent className="p-8">
                <div
                  className={`border-2 border-dashed rounded-xl p-16 text-center transition-all duration-200 cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
                      <FileText className="h-16 w-16 text-primary relative z-10" />
                    </div>

                    <h3 className="text-2xl font-semibold mb-3">
                      {processing ? "Processing your statement..." : "Drop your PDF statement here"}
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md">
                      Supports all major banks with enhanced OCR for accurate extraction
                    </p>

                    <Button
                      disabled={processing}
                      size="lg"
                      className="gap-2 h-12 px-8"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          Choose PDF File
                        </>
                      )}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {processing && (
                  <div className="mt-8 space-y-3 bg-muted/50 rounded-xl p-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{fileName}</span>
                      <Badge variant="secondary" className="font-semibold">
                        {Math.round(progress)}%
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Using enhanced OCR with image preprocessing
                    </p>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {extractedData && (
              <div className="space-y-6">
                <Card className="border-2">
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">Extracted Information</CardTitle>
                        <CardDescription className="mt-1.5">From: {fileName}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={downloadJSON} variant="outline" size="sm" className="gap-2 bg-transparent">
                          <FileJson className="h-4 w-4" />
                          JSON
                        </Button>
                        <Button onClick={downloadRawText} variant="outline" size="sm" className="gap-2 bg-transparent">
                          <FileCode className="h-4 w-4" />
                          Raw Text
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Customer Name */}
                      <div className="bg-muted/50 rounded-xl p-5 border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Customer Name</span>
                          {getStatusIcon(extractedData.customerName)}
                        </div>
                        <p className="text-lg font-semibold">{extractedData.customerName}</p>
                      </div>

                      {/* Card Issuer */}
                      <div className="bg-muted/50 rounded-xl p-5 border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Card Issuer</span>
                          {getStatusIcon(extractedData.cardIssuer)}
                        </div>
                        <p className="text-lg font-semibold">{extractedData.cardIssuer}</p>
                      </div>

                      {/* Card Last 4 */}
                      <div className="bg-muted/50 rounded-xl p-5 border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Hash className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Card Last 4</span>
                          {getStatusIcon(extractedData.cardLast4)}
                        </div>
                        <p className="text-lg font-semibold font-mono">•••• {extractedData.cardLast4}</p>
                      </div>

                      {/* Billing Cycle */}
                      <div className="bg-muted/50 rounded-xl p-5 border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Billing Cycle</span>
                          {getStatusIcon(extractedData.billingCycle)}
                        </div>
                        <p className="text-lg font-semibold">{extractedData.billingCycle}</p>
                      </div>

                      {/* Due Date */}
                      <div className="bg-muted/50 rounded-xl p-5 border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Payment Due</span>
                          {getStatusIcon(extractedData.dueDate)}
                        </div>
                        <p className="text-lg font-semibold">{extractedData.dueDate}</p>
                      </div>

                      {/* Credit Limit */}
                      {extractedData.creditLimit !== "Not Detected" && (
                        <div className="bg-muted/50 rounded-xl p-5 border border-border hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <CreditCard className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Credit Limit</span>
                            {getStatusIcon(extractedData.creditLimit)}
                          </div>
                          <p className="text-lg font-semibold">{extractedData.creditLimit}</p>
                        </div>
                      )}

                      {/* Available Credit */}
                      {extractedData.availableCredit !== "Not Detected" && (
                        <div className="bg-muted/50 rounded-xl p-5 border border-border hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Wallet className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Available Credit</span>
                            {getStatusIcon(extractedData.availableCredit)}
                          </div>
                          <p className="text-lg font-semibold">{extractedData.availableCredit}</p>
                        </div>
                      )}

                      {/* Total Due - Highlighted */}
                      <div className="md:col-span-2 lg:col-span-3 bg-primary/5 rounded-xl p-6 border-2 border-primary/20">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="p-3 bg-primary/10 rounded-xl">
                            <DollarSign className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-muted-foreground block mb-1">
                              Total Amount Due
                            </span>
                            <p className="text-3xl font-bold text-primary">{extractedData.totalDue}</p>
                          </div>
                          {getStatusIcon(extractedData.totalDue)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-xl">Raw OCR Output</CardTitle>
                    <CardDescription>Complete text extracted from the PDF</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-muted rounded-xl p-6 max-h-96 overflow-y-auto border">
                      <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{rawOcrText}</pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-2xl">Extraction History</CardTitle>
                <CardDescription>View and reload previously extracted statements</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!isSupabaseConfigured() ? (
                  <div className="text-center py-20">
                    <div className="inline-flex p-4 bg-muted rounded-2xl mb-4">
                      <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium mb-2">History Not Available</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Configure Supabase environment variables to enable extraction history storage
                    </p>
                  </div>
                ) : loadingHistory ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex p-4 bg-muted rounded-2xl mb-4">
                      <History className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium mb-2">No extraction history yet</p>
                    <p className="text-sm text-muted-foreground">Upload a PDF to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-xl p-5 hover:bg-muted/30 transition-all cursor-pointer hover:border-primary/50"
                        onClick={() => loadHistoricalExtraction(item)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-semibold text-lg">{item.file_name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {new Date(item.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium truncate">{item.customer_name || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium truncate">{item.card_issuer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium font-mono">•••• {item.card_last_4}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-primary">{item.total_due}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
