"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, History, Sparkles, Building2 } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { ExtractedDataDisplay } from "@/components/extracted-data-display"
import { RawOcrOutput } from "@/components/raw-ocr-output"
import { HistoryList } from "@/components/history-list"
import { processPDF } from "@/lib/services/pdf-processor"
import { extractDataFromText } from "@/lib/services/data-extractor"
import { loadHistory, saveToHistory } from "@/lib/services/history-service"
import { downloadJSON, downloadRawText } from "@/lib/utils/file-utils"

function App() {
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const [rawOcrText, setRawOcrText] = useState("")
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    loadHistoryData()
  }, [])

  const loadHistoryData = async () => {
    setLoadingHistory(true)
    const data = await loadHistory()
    setHistory(data)
    setLoadingHistory(false)
  }

  const handleFileSelect = async (file, errorMessage = null) => {
    if (errorMessage) {
      setError(errorMessage)
      return
    }

    if (!file) return

    try {
      setProcessing(true)
      setError("")
      setProgress(0)
      setExtractedData(null)
      setRawOcrText("")
      setFileName(file.name)

      // Process PDF and extract text
      const fullText = await processPDF(file, setProgress)

      // Extract structured data
      setRawOcrText(fullText)
      const extractedInfo = extractDataFromText(fullText)
      setExtractedData(extractedInfo)
      setProgress(100)

      // Save to history
      await saveToHistory(extractedInfo, fullText, file.name)
      await loadHistoryData()
    } catch (err) {
      console.error("Error processing PDF:", err)
      setError(`Error processing PDF: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleHistoryItemSelect = (item) => {
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
            <FileUpload
              processing={processing}
              progress={progress}
              fileName={fileName}
              error={error}
              onFileSelect={handleFileSelect}
            />

            {extractedData && (
              <div className="space-y-6">
                <ExtractedDataDisplay
                  data={extractedData}
                  fileName={fileName}
                  onDownloadJSON={() => downloadJSON(extractedData, fileName)}
                  onDownloadRawText={() => downloadRawText(rawOcrText, fileName)}
                />
                <RawOcrOutput text={rawOcrText} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <HistoryList history={history} loading={loadingHistory} onSelectItem={handleHistoryItemSelect} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
