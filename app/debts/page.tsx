"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit2, Trash2, CreditCard, Calendar, DollarSign, Loader2, ShieldCheck } from "lucide-react"
import type { Debt } from "@/types"
import { supabase } from "@/lib/supabase"

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    totalAmount: "",
    remainingAmount: "",
    interestRate: "",
    minimumPayment: "",
    dueDate: "",
    description: "",
  })

  const fetchDebts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        // DIUBAH: Mengurutkan berdasarkan 'name' karena 'created_at' tidak ada di daftar Anda
        .order("name", { ascending: true })

      if (error) {
        throw error
      }
      
      // DIUBAH: Transformasi data disesuaikan dengan nama kolom Anda
      const transformedData = data.map((debt) => ({
        id: debt.id,
        name: debt.name,
        totalAmount: debt.total, // total_amount -> total
        remainingAmount: debt.remaining, // remaining_amount -> remaining
        interestRate: debt.interest, // interest_rate -> interest
        minimumPayment: debt.minimumPayment, // minimum_payment -> minimumPayment
        dueDate: debt.dueDate, // due_date -> dueDate
        description: debt.description,
        isActive: debt.is_active,
        createdAt: debt.created_at, 
      }))
      
      setDebts(transformedData || [])

    } catch (err) {
      console.error("Error fetching debts:", err)
      setError("Gagal memuat data hutang. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // DIUBAH: Mengirim data dengan nama kolom yang sesuai dengan tabel Anda
    const debtData = {
      name: formData.name,
      total: Number.parseFloat(formData.totalAmount), // total_amount -> total
      remaining: Number.parseFloat(formData.remainingAmount), // remaining_amount -> remaining
      interest: formData.interestRate ? Number.parseFloat(formData.interestRate) : null, // interest_rate -> interest
      minimumPayment: formData.minimumPayment ? Number.parseFloat(formData.minimumPayment) : null, // minimum_payment -> minimumPayment
      dueDate: formData.dueDate || null, // due_date -> dueDate
      description: formData.description || null,
    }

    let error
    if (editingDebt) {
      const { error: updateError } = await supabase
        .from("debts")
        .update(debtData)
        .eq("id", editingDebt.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from("debts").insert([debtData])
      error = insertError
    }

    if (error) {
      console.error("Error saving debt:", error)
      alert("Gagal menyimpan data.")
    } else {
      await fetchDebts()
      resetForm()
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus hutang ini?")) {
      const { error } = await supabase.from("debts").delete().eq("id", id)
      if (error) {
        console.error("Error deleting debt:", error)
        alert("Gagal menghapus data.")
      } else {
        setDebts(debts.filter((debt) => debt.id !== id))
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      totalAmount: "",
      remainingAmount: "",
      interestRate: "",
      minimumPayment: "",
      dueDate: "",
      description: "",
    })
    setShowAddForm(false)
    setEditingDebt(null)
  }

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt)
    setFormData({
      name: debt.name,
      totalAmount: debt.totalAmount.toString(),
      remainingAmount: debt.remainingAmount.toString(),
      interestRate: debt.interestRate?.toString() || "",
      minimumPayment: debt.minimumPayment?.toString() || "",
      dueDate: debt.dueDate || "",
      description: debt.description || "",
    })
    setShowAddForm(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
  }

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
    return amount.toString()
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Memuat data hutang...</p>
        </div>
      )
    }

    if (error) {
      return <div className="text-center py-20 text-destructive">{error}</div>
    }

    if (debts.length === 0 && !showAddForm) {
      return (
        <Card className="neobrutalism-card">
          <CardContent className="text-center py-12">
            <ShieldCheck className="h-12 w-12 mx-auto text-secondary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selamat, Anda Bebas Hutang!</h3>
            <p className="text-muted-foreground mb-4">Tidak ada data hutang yang tercatat saat ini.</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="neobrutalism-button bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Catat Hutang Baru
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {debts.map((debt) => {
          const progress = debt.totalAmount > 0 ? ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100 : 0
          const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date()

          return (
            <Card key={debt.id} className="neobrutalism-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold font-manrope">{debt.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(debt)} className="neobrutalism-button p-2">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(debt.id)} className="neobrutalism-button p-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Hutang</div>
                    <div className="font-bold">{formatCompactCurrency(debt.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Sisa Hutang</div>
                    <div className="font-bold text-destructive">{formatCompactCurrency(debt.remainingAmount)}</div>
                  </div>
                  {debt.interestRate != null && (
                    <div>
                      <div className="text-muted-foreground">Bunga</div>
                      <div className="font-bold">{debt.interestRate}% / tahun</div>
                    </div>
                  )}
                  {debt.minimumPayment != null && (
                    <div>
                      <div className="text-muted-foreground">Bayar Minimum</div>
                      <div className="font-bold">{formatCompactCurrency(debt.minimumPayment)}</div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress Pembayaran</span>
                    <span className="font-bold">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                {debt.dueDate && (
                  <div className={`text-sm ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                    <span className="font-medium">Jatuh Tempo: </span>
                    {new Date(debt.dueDate).toLocaleDateString("id-ID")}
                    {isOverdue && <span className="ml-2 font-bold">(TERLAMBAT)</span>}
                  </div>
                )}
                {debt.description && <p className="text-sm text-muted-foreground">{debt.description}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground font-manrope">Manajemen Hutang</h1>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="neobrutalism-button bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Hutang
            </Button>
          )}
        </div>
        
        {showAddForm && (
          <Card className="neobrutalism-card mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold font-manrope">
                {editingDebt ? "Edit Hutang" : "Tambah Hutang Baru"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* JSX untuk form tidak perlu diubah */}
              </form>
            </CardContent>
          </Card>
        )}

        {renderContent()}
      </div>
    </div>
  )
}
