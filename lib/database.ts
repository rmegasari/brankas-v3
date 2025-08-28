import { supabase, type Transaction, type Platform, type Debt, type Goal } from "./supabase"

export class DatabaseService {
  // Transactions
  static async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return []
    }

    return data || []
  }

  static async addTransaction(transaction: Omit<Transaction, "id" | "created_at">): Promise<Transaction | null> {
    const { data, error } = await supabase.from("transactions").insert([transaction]).select().single()

    if (error) {
      console.error("Error adding transaction:", error)
      return null
    }

    return data
  }

  static async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | null> {
    const { data, error } = await supabase.from("transactions").update(transaction).eq("id", id).select().single()

    if (error) {
      console.error("Error updating transaction:", error)
      return null
    }

    return data
  }

  static async deleteTransaction(id: number): Promise<boolean> {
    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting transaction:", error)
      return false
    }

    return true
  }

  // Platforms
  static async getPlatforms(): Promise<Platform[]> {
    const { data, error } = await supabase.from("platforms").select("*").order("account")

    if (error) {
      console.error("Error fetching platforms:", error)
      return []
    }

    return data || []
  }

  static async addPlatform(platform: Omit<Platform, "id" | "created_at">): Promise<Platform | null> {
    const { data, error } = await supabase.from("platforms").insert([platform]).select().single()

    if (error) {
      console.error("Error adding platform:", error)
      return null
    }

    return data
  }

  static async updatePlatform(id: number, platform: Partial<Platform>): Promise<Platform | null> {
    const { data, error } = await supabase.from("platforms").update(platform).eq("id", id).select().single()

    if (error) {
      console.error("Error updating platform:", error)
      return null
    }

    return data
  }

  static async deletePlatform(id: number): Promise<boolean> {
    const { error } = await supabase.from("platforms").delete().eq("id", id)

    if (error) {
      console.error("Error deleting platform:", error)
      return false
    }

    return true
  }

  // Debts
  static async getDebts(): Promise<Debt[]> {
    const { data, error } = await supabase.from("debts").select("*").order("due-date")

    if (error) {
      console.error("Error fetching debts:", error)
      return []
    }

    return data || []
  }

  static async addDebt(debt: Omit<Debt, "id" | "created_at">): Promise<Debt | null> {
    const { data, error } = await supabase.from("debts").insert([debt]).select().single()

    if (error) {
      console.error("Error adding debt:", error)
      return null
    }

    return data
  }

  static async updateDebt(id: number, debt: Partial<Debt>): Promise<Debt | null> {
    const { data, error } = await supabase.from("debts").update(debt).eq("id", id).select().single()

    if (error) {
      console.error("Error updating debt:", error)
      return null
    }

    return data
  }

  static async deleteDebt(id: number): Promise<boolean> {
    const { error } = await supabase.from("debts").delete().eq("id", id)

    if (error) {
      console.error("Error deleting debt:", error)
      return false
    }

    return true
  }

  // Goals
  static async getGoals(): Promise<Goal[]> {
    const { data, error } = await supabase.from("goals").select("*").order("deadline")

    if (error) {
      console.error("Error fetching goals:", error)
      return []
    }

    return data || []
  }

  static async addGoal(goal: Omit<Goal, "id" | "created_at">): Promise<Goal | null> {
    const { data, error } = await supabase.from("goals").insert([goal]).select().single()

    if (error) {
      console.error("Error adding goal:", error)
      return null
    }

    return data
  }

  static async updateGoal(id: number, goal: Partial<Goal>): Promise<Goal | null> {
    const { data, error } = await supabase.from("goals").update(goal).eq("id", id).select().single()

    if (error) {
      console.error("Error updating goal:", error)
      return null
    }

    return data
  }

  static async deleteGoal(id: number): Promise<boolean> {
    const { error } = await supabase.from("goals").delete().eq("id", id)

    if (error) {
      console.error("Error deleting goal:", error)
      return false
    }

    return true
  }
}
