"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react"

export function FileUpload({ processing, progress, fileName, error, onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      onFileSelect(file)
    } else {
      onFileSelect(null, "Please upload a valid PDF file")
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
      onFileSelect(file)
    } else {
      onFileSelect(null, "Please upload a valid PDF file")
    }
  }

  return (
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
            <p className="text-xs text-muted-foreground text-center">Using enhanced OCR with image preprocessing</p>
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
  )
}
