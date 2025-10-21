"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, User, Building2, Hash, DollarSign, History, AlertCircle, Loader2 } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase"

export function HistoryList({ history, loading, onSelectItem }) {
  if (!isSupabaseConfigured()) {
    return (
      <Card className="border-2">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-2xl">Extraction History</CardTitle>
          <CardDescription>View and reload previously extracted statements</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-20">
            <div className="inline-flex p-4 bg-muted rounded-2xl mb-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">History Not Available</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Configure Supabase environment variables to enable extraction history storage
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-2xl">Extraction History</CardTitle>
          <CardDescription>View and reload previously extracted statements</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-2xl">Extraction History</CardTitle>
          <CardDescription>View and reload previously extracted statements</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-20">
            <div className="inline-flex p-4 bg-muted rounded-2xl mb-4">
              <History className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No extraction history yet</p>
            <p className="text-sm text-muted-foreground">Upload a PDF to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-2xl">Extraction History</CardTitle>
        <CardDescription>View and reload previously extracted statements</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-5 hover:bg-muted/30 transition-all cursor-pointer hover:border-primary/50"
              onClick={() => onSelectItem(item)}
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
      </CardContent>
    </Card>
  )
}
