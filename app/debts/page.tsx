"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit2, Trash2, CreditCard, Calendar, DollarSign } from "lucide-react"
import type { Debt } from "@/types"

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>(() => {
    const savedDebts = localStorage.getItem("debts")
    return savedDebts
      ? JSON.parse(savedDebts)
      : [
          {
            id: "1",
            name: "KTA Bank Mandiri",
            totalAmount: 50000000,
            remainingAmount: 35000000,
            interestRate: 12,
            minimumPayment: 2500000,
            dueDate: "2025-12-31",
            description: "Kredit Tanpa Agunan untuk renovasi rumah",
            isActive: true,
            createdAt: "2024-01-15",
          },
          {
            id: "2",
            name: "Kartu Kredit BCA",
            totalAmount: 15000000,
            remainingAmount: 8500000,
            interestRate: 24,
            minimumPayment: 850000,
            dueDate: "2025-08-15",
            description: "Limit kartu kredit untuk kebutuhan sehari-hari",
            isActive: true,
            createdAt: "2023-06-10",
          },
        ]
  })

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return amount.toString()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newDebt: Debt = {
      id: editingDebt?.id || Date.now().toString(),
      name: formData.name,
      totalAmount: Number.parseFloat(formData.totalAmount),
      remainingAmount: Number.parseFloat(formData.remainingAmount),
      interestRate: formData.interestRate ? Number.parseFloat(formData.interestRate) : undefined,
      minimumPayment: formData.minimumPayment ? Number.parseFloat(formData.minimumPayment) : undefined,
      dueDate: formData.dueDate || undefined,
      description: formData.description || undefined,
      isActive: true,
      createdAt: editingDebt?.createdAt || new Date().toISOString(),
    }

    let updatedDebts
    if (editingDebt) {
      updatedDebts = debts.map((debt) => (debt.id === editingDebt.id ? newDebt : debt))
    } else {
      updatedDebts = [...debts, newDebt]
    }

    setDebts(updatedDebts)

    try {
      localStorage.setItem("debts", JSON.stringify(updatedDebts))
      // Trigger storage event for other components to update
      window.dispatchEvent(new Event("storage"))
    } catch (error) {
      console.error("Error saving debts to localStorage:", error)
    }

    resetForm()
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

  const handleDelete = (id: string) => {
    const updatedDebts = debts.filter((debt) => debt.id !== id)
    setDebts(updatedDebts)

    try {
      localStorage.setItem("debts", JSON.stringify(updatedDebts))
      window.dispatchEvent(new Event("storage"))
    } catch (error) {
      console.error("Error updating debts in localStorage:", error)
    }
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0)
  const totalOriginal = debts.reduce((sum, debt) => sum + debt.totalAmount, 0)
  const totalPaid = totalOriginal - totalDebt
  const paymentProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground font-manrope">Manajemen Hutang</h1>
          <Button
            onClick={() => setShowAddForm(true)}
            className="neobrutalism-button bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Hutang
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Hutang</CardTitle>
              <CreditCard className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-destructive break-words">{formatCompactCurrency(totalDebt)}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatCurrency(totalDebt)}</div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Sudah Dibayar</CardTitle>
              <DollarSign className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-secondary break-words">{formatCompactCurrency(totalPaid)}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatCurrency(totalPaid)}</div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Progress Pembayaran</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-primary">{paymentProgress.toFixed(1)}%</div>
              <Progress value={paymentProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Jumlah Hutang</CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">{debts.length}</div>
              <p className="text-xs text-muted-foreground">Hutang aktif</p>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="neobrutalism-card mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold font-manrope">
                {editingDebt ? "Edit Hutang" : "Tambah Hutang Baru"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Hutang *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="neobrutalism-input"
                      placeholder="Contoh: KTA Bank Mandiri"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalAmount">Total Hutang *</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                      className="neobrutalism-input"
                      placeholder="50000000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="remainingAmount">Sisa Hutang *</Label>
                    <Input
                      id="remainingAmount"
                      type="number"
                      value={formData.remainingAmount}
                      onChange={(e) => setFormData({ ...formData, remainingAmount: e.target.value })}
                      className="neobrutalism-input"
                      placeholder="35000000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestRate">Bunga (% per tahun)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      className="neobrutalism-input"
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumPayment">Pembayaran Minimum</Label>
                    <Input
                      id="minimumPayment"
                      type="number"
                      value={formData.minimumPayment}
                      onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                      className="neobrutalism-input"
                      placeholder="2500000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Jatuh Tempo</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="neobrutalism-input"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="neobrutalism-input"
                    placeholder="Deskripsi hutang..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="neobrutalism-button bg-primary text-primary-foreground">
                    {editingDebt ? "Update" : "Tambah"} Hutang
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="neobrutalism-button bg-transparent"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Debts List */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {debts.map((debt) => {
            const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100
            const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date()

            return (
              <Card key={debt.id} className="neobrutalism-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold font-manrope">{debt.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(debt)}
                        className="neobrutalism-button p-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(debt.id)}
                        className="neobrutalism-button p-2 text-destructive"
                      >
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
                    {debt.interestRate && (
                      <div>
                        <div className="text-muted-foreground">Bunga</div>
                        <div className="font-bold">{debt.interestRate}% / tahun</div>
                      </div>
                    )}
                    {debt.minimumPayment && (
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

        {debts.length === 0 && (
          <Card className="neobrutalism-card">
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Hutang</h3>
              <p className="text-muted-foreground mb-4">Tambahkan hutang untuk mulai melacak pembayaran Anda</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="neobrutalism-button bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Hutang Pertama
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
