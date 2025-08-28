"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Wallet, PiggyBank, Plus, Settings, TrendingUp, TrendingDown, Eye } from "lucide-react"
import Link from "next/link"
import { accounts as initialAccounts, transactions } from "@/lib/data"
import type { Account } from "@/types"

export default function PlatformsPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "bank" as "bank" | "ewallet",
    balance: "",
    isSavings: false,
    color: "bg-blue-500",
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getAccountStats = (accountId: string) => {
    const accountTransactions = transactions.filter((t) => t.accountId === accountId || t.toAccountId === accountId)
    const income = accountTransactions
      .filter(
        (t) =>
          (t.type === "income" && t.accountId === accountId) || (t.type === "transfer" && t.toAccountId === accountId),
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const expense = accountTransactions
      .filter(
        (t) =>
          (t.type === "expense" && t.accountId === accountId) || (t.type === "transfer" && t.accountId === accountId),
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return { income, expense, transactionCount: accountTransactions.length }
  }

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault()
    const account: Account = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newAccount.name,
      type: newAccount.type,
      balance: Number.parseFloat(newAccount.balance) || 0,
      isSavings: newAccount.isSavings,
      color: newAccount.color,
    }
    setAccounts([...accounts, account])
    setIsAddModalOpen(false)
    setNewAccount({
      name: "",
      type: "bank",
      balance: "",
      isSavings: false,
      color: "bg-blue-500",
    })
  }

  const handleEditAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return

    const updatedAccounts = accounts.map((account) => (account.id === selectedAccount.id ? selectedAccount : account))
    setAccounts(updatedAccounts)
    setIsEditModalOpen(false)
    setSelectedAccount(null)
  }

  const colorOptions = [
    { value: "bg-blue-500", label: "Biru", color: "bg-blue-500" },
    { value: "bg-green-500", label: "Hijau", color: "bg-green-500" },
    { value: "bg-yellow-500", label: "Kuning", color: "bg-yellow-500" },
    { value: "bg-red-500", label: "Merah", color: "bg-red-500" },
    { value: "bg-purple-500", label: "Ungu", color: "bg-purple-500" },
    { value: "bg-orange-500", label: "Oranye", color: "bg-orange-500" },
    { value: "bg-pink-500", label: "Pink", color: "bg-pink-500" },
    { value: "bg-indigo-500", label: "Indigo", color: "bg-indigo-500" },
  ]

  const bankAccounts = accounts.filter((account) => account.type === "bank")
  const ewalletAccounts = accounts.filter((account) => account.type === "ewallet")

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-foreground font-manrope">Platform Brankas</h1>
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="neobrutalism-button bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Akun
              </Button>
            </DialogTrigger>
            <DialogContent className="neobrutalism-card max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-manrope">Tambah Akun Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Nama Akun
                  </Label>
                  <Input
                    id="name"
                    className="neobrutalism-input mt-1"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="Contoh: BCA, GoPay"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-semibold">
                    Tipe Akun
                  </Label>
                  <Select
                    value={newAccount.type}
                    onValueChange={(value: "bank" | "ewallet") => setNewAccount({ ...newAccount, type: value })}
                  >
                    <SelectTrigger className="neobrutalism-input mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Rekening Bank</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="balance" className="text-sm font-semibold">
                    Saldo Awal
                  </Label>
                  <Input
                    id="balance"
                    type="number"
                    className="neobrutalism-input mt-1"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="color" className="text-sm font-semibold">
                    Warna
                  </Label>
                  <Select
                    value={newAccount.color}
                    onValueChange={(value) => setNewAccount({ ...newAccount, color: value })}
                  >
                    <SelectTrigger className="neobrutalism-input mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${option.color}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="savings"
                    checked={newAccount.isSavings}
                    onCheckedChange={(checked) => setNewAccount({ ...newAccount, isSavings: checked })}
                  />
                  <Label htmlFor="savings" className="text-sm font-semibold">
                    Tandai sebagai akun tabungan
                  </Label>
                </div>

                <Button type="submit" className="neobrutalism-button w-full bg-primary text-primary-foreground">
                  Tambah Akun
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Akun</CardTitle>
              <Wallet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Rekening Bank</CardTitle>
              <CreditCard className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bankAccounts.length}</div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">E-Wallet</CardTitle>
              <Wallet className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ewalletAccounts.length}</div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Akun Tabungan</CardTitle>
              <PiggyBank className="h-5 w-5 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.filter((acc) => acc.isSavings).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bank Accounts Section */}
        {bankAccounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-manrope mb-4 flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Rekening Bank
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bankAccounts.map((account) => {
                const stats = getAccountStats(account.id)
                return (
                  <Card key={account.id} className="neobrutalism-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${account.color}`} />
                        {account.name}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {account.isSavings && <PiggyBank className="h-4 w-4 text-chart-1" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account)
                            setIsEditModalOpen(true)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                        <div className="text-xs text-muted-foreground">
                          Saldo saat ini
                          {account.isSavings && " • Tabungan"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-secondary" />
                          <span className="text-secondary font-semibold">{formatCurrency(stats.income)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-destructive" />
                          <span className="text-destructive font-semibold">{formatCurrency(stats.expense)}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">{stats.transactionCount} transaksi bulan ini</div>

                      <Link href={`/platforms/${account.id}`}>
                        <Button className="neobrutalism-button w-full bg-transparent border-2 border-black hover:bg-muted">
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* E-Wallet Accounts Section */}
        {ewalletAccounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-manrope mb-4 flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              E-Wallet
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ewalletAccounts.map((account) => {
                const stats = getAccountStats(account.id)
                return (
                  <Card key={account.id} className="neobrutalism-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${account.color}`} />
                        {account.name}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {account.isSavings && <PiggyBank className="h-4 w-4 text-chart-1" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account)
                            setIsEditModalOpen(true)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                        <div className="text-xs text-muted-foreground">
                          Saldo saat ini
                          {account.isSavings && " • Tabungan"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-secondary" />
                          <span className="text-secondary font-semibold">{formatCurrency(stats.income)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-destructive" />
                          <span className="text-destructive font-semibold">{formatCurrency(stats.expense)}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">{stats.transactionCount} transaksi bulan ini</div>

                      <Link href={`/platforms/${account.id}`}>
                        <Button className="neobrutalism-button w-full bg-transparent border-2 border-black hover:bg-muted">
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Edit Account Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="neobrutalism-card max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-manrope">Edit Akun</DialogTitle>
            </DialogHeader>
            {selectedAccount && (
              <form onSubmit={handleEditAccount} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-sm font-semibold">
                    Nama Akun
                  </Label>
                  <Input
                    id="edit-name"
                    className="neobrutalism-input mt-1"
                    value={selectedAccount.name}
                    onChange={(e) => setSelectedAccount({ ...selectedAccount, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-color" className="text-sm font-semibold">
                    Warna
                  </Label>
                  <Select
                    value={selectedAccount.color}
                    onValueChange={(value) => setSelectedAccount({ ...selectedAccount, color: value })}
                  >
                    <SelectTrigger className="neobrutalism-input mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${option.color}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-savings"
                    checked={selectedAccount.isSavings}
                    onCheckedChange={(checked) => setSelectedAccount({ ...selectedAccount, isSavings: checked })}
                  />
                  <Label htmlFor="edit-savings" className="text-sm font-semibold">
                    Tandai sebagai akun tabungan
                  </Label>
                </div>

                <Button type="submit" className="neobrutalism-button w-full bg-primary text-primary-foreground">
                  Simpan Perubahan
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
