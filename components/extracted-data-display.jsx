"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  User,
  Building2,
  Hash,
  Calendar,
  Clock,
  CreditCard,
  Wallet,
  DollarSign,
  FileJson,
  FileCode,
  CheckCircle2,
  XCircle,
} from "lucide-react"

export function ExtractedDataDisplay({ data, fileName, onDownloadJSON, onDownloadRawText }) {
  const getStatusIcon = (value) => {
    return value === "Not Detected" ? (
      <XCircle className="h-4 w-4 text-destructive" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    )
  }

  const DataField = ({ icon: Icon, label, value, className = "" }) => (
    <div
      className={`bg-muted/50 rounded-xl p-5 border border-border hover:border-primary/50 transition-colors ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {getStatusIcon(value)}
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Extracted Information</CardTitle>
            <CardDescription className="mt-1.5">From: {fileName}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={onDownloadJSON} variant="outline" size="sm" className="gap-2 bg-transparent">
              <FileJson className="h-4 w-4" />
              JSON
            </Button>
            <Button onClick={onDownloadRawText} variant="outline" size="sm" className="gap-2 bg-transparent">
              <FileCode className="h-4 w-4" />
              Raw Text
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DataField icon={User} label="Customer Name" value={data.customerName} />
          <DataField icon={Building2} label="Card Issuer" value={data.cardIssuer} />
          <DataField icon={Hash} label="Card Last 4" value={`•••• ${data.cardLast4}`} />
          <DataField icon={Calendar} label="Billing Cycle" value={data.billingCycle} />
          <DataField icon={Clock} label="Payment Due" value={data.dueDate} />

          {data.creditLimit !== "Not Detected" && (
            <DataField icon={CreditCard} label="Credit Limit" value={data.creditLimit} />
          )}

          {data.availableCredit !== "Not Detected" && (
            <DataField icon={Wallet} label="Available Credit" value={data.availableCredit} />
          )}

          <div className="md:col-span-2 lg:col-span-3 bg-primary/5 rounded-xl p-6 border-2 border-primary/20">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-muted-foreground block mb-1">Total Amount Due</span>
                <p className="text-3xl font-bold text-primary">{data.totalDue}</p>
              </div>
              {getStatusIcon(data.totalDue)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
