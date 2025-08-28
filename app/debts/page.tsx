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
import type { Debt } from "@/types" // Pastikan tipe Debt Anda sesuai
import { supabase } from "@/lib/supabaseClient" // Pastikan path ini benar

export default function DebtsPage() {
  // State untuk data, loading, dan error
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State untuk form
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

  // Fungsi untuk mengambil data dari Supabase
  const fetchDebts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("debts") // Nama tabel di Supabase
        .select("*")
        .order("createdAt", { ascending: false })

      if (error) {
        throw error
      }
      setDebts(data || [])
    } catch (err) {
      console.error("Error fetching debts:", err)
      setError("Gagal memuat data hutang. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  // Jalankan fetchDebts saat komponen pertama kali dimuat
  useEffect(() => {
    fetchDebts()
  }, [])

  // Fungsi untuk mengirim data (Tambah/Update) ke Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const debtData = {
      name: formData.name,
      total: Number.parseFloat(formData.totalAmount),
      remaining: Number.parseFloat(formData.remainingAmount),
      interest: formData.interestRate ? Number.parseFloat(formData.interestRate) : null,
      minimumPayment: formData.minimumPayment ? Number.parseFloat(formData.minimumPayment) : null,
      dueDate: formData.dueDate || null,
      description: formData.description || null,
      is_active: true,
    }

    let error
    if (editingDebt) {
      // Proses Update
      const { error: updateError } = await supabase
        .from("debts")
        .update(debtData)
        .eq("id", editingDebt.id)
      error = updateError
    } else {
      // Proses Tambah
      const { error: insertError } = await supabase.from("debts").insert(debtData)
      error = insertError
    }

    if (error) {
      console.error("Error saving debt:", error)
      alert("Gagal menyimpan data.")
    } else {
      await fetchDebts() // Ambil data terbaru setelah berhasil
      resetForm()
    }
  }

  // Fungsi untuk menghapus data dari Supabase
  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus hutang ini?")) {
      const { error } = await supabase.from("debts").delete().eq("id", id)
      if (error) {
        console.error("Error deleting debt:", error)
        alert("Gagal menghapus data.")
      } else {
        // Hapus dari state lokal untuk update UI instan
        setDebts(debts.filter((debt) => debt.id !== id))
      }
    }
  }

  // Sisa fungsi helper (tidak ada perubahan)
  const formatCurrency = (amount: number) => { /* ... */ }
  const formatCompactCurrency = (amount: number) => { /* ... */ }
  const resetForm = () => { /* ... */ }
  const handleEdit = (debt: Debt) => { /* ... */ }

  // Tampilkan UI berdasarkan state (loading, error, data kosong, atau ada data)
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

    if (debts.length === 0) {
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

    // Tampilkan daftar hutang jika data ada
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {debts.map((debt) => {
          // ... Logika JSX untuk menampilkan setiap kartu hutang
          // ... Tidak ada perubahan di sini
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground font-manrope">Manajemen Hutang</h1>
          {!showAddForm && (
             <Button
                onClick={() => setShowAddForm(true)}
                className="neobrutalism-button bg-primary text-primary-foreground"
             >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Hutang
             </Button>
          )}
        </div>
        
        {/* Form Tambah/Edit */}
        {showAddForm && (
            // ... JSX untuk form Anda ...
            // ... Tidak ada perubahan di sini
        )}

        {/* Konten Utama (Loading, Error, Data Kosong, atau Daftar Hutang) */}
        {renderContent()}

      </div>
    </div>
  )
}
