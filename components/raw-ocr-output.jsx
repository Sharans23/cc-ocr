import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RawOcrOutput({ text }) {
  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-xl">Raw OCR Output</CardTitle>
        <CardDescription>Complete text extracted from the PDF</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-muted rounded-xl p-6 max-h-96 overflow-y-auto border">
          <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{text}</pre>
        </div>
      </CardContent>
    </Card>
  )
}
