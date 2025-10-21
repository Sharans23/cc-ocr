import { supabase, isSupabaseConfigured } from "../supabase"

// Load extraction history from Supabase
export const loadHistory = async () => {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("extraction_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Error loading history:", err)
    return []
  }
}

// Save extraction to history
export const saveToHistory = async (data, rawText, filename) => {
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
  } catch (err) {
    console.error("Error saving to history:", err)
  }
}
