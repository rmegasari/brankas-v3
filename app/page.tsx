"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"
import { ImageIcon } from "lucide-react"
import { AccountSelector } from "@/components/account-selector"
import { CategorySelector } from "@/components/category-selector"
import { TransferPreview } from "@/components/transfer-preview"
import { TransactionActions } from "@/components/transaction-actions"
import { HelpTooltip } from "@/components/help-tooltip"
import { ClockWidget } from "@/components/clock-widget"
import { TransferService } from "@/lib/transfer-service"
import { accounts as initialAccounts, transactions as initialTransactions, transactionCategories } from "@/lib/data"
import type { Account, Transaction, DashboardPeriod, UserProfile } from "@/types"

// Sample data
const chartData = [
  { name: "Jan", amount: 2400 },
  { name: "Feb", amount: 1398 },
  { name: "Mar", amount: 9800 },
  { name: "Apr", amount: 3908 },
  { name: "May", amount: 4800 },
]

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriod>("monthly")
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "1",
    name: "Megumi",
    email: "megumi@example.com",
    avatar: "/diverse-user-avatars.png",
    language: "id",
    theme: "light",
    isLoggedIn: true,
  })
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "",
    subcategory: "",
    accountId: "",
    toAccountId: "",
    date: new Date().toISOString().split("T")[0], // Default to today
    receiptFile: null as File | null,
  })

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const savingsBalance = accounts
    .filter((account) => account.isSavings)
    .reduce((sum, account) => sum + account.balance, 0)
  const dailyBalance = totalBalance - savingsBalance

  const getPeriodData = (period: DashboardPeriod) => {
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let periodLabel: string

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        previousStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        periodLabel = "Hari Ini"
        break
      case "weekly":
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
        previousStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 7)
        periodLabel = "Minggu Ini"
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        periodLabel = "Tahun Ini"
        break
      case "payroll":
        const payrollDate = 28
        if (now.getDate() >= payrollDate) {
          startDate = new Date(now.getFullYear(), now.getMonth(), payrollDate)
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, payrollDate)
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, payrollDate)
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, payrollDate)
        }
        periodLabel = "Periode Gajian"
        break
      default: // monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        periodLabel = "Bulan Ini"
        break
    }

    const currentPeriodTransactions = transactions.filter((t) => new Date(t.date) >= startDate)
    const previousPeriodTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      const previousEndDate = new Date(startDate.getTime() - 1)
      return transactionDate >= previousStartDate && transactionDate <= previousEndDate
    })

    const currentIncome = currentPeriodTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    const currentExpense = Math.abs(
      currentPeriodTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    )

    const previousIncome = previousPeriodTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    const previousExpense = Math.abs(
      previousPeriodTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    )

    const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0
    const expenseChange = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0

    return {
      periodLabel,
      currentIncome,
      currentExpense,
      incomeChange,
      expenseChange,
    }
  }

  const periodData = getPeriodData(dashboardPeriod)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = Number.parseFloat(formData.amount)

    if (formData.category === "Mutasi") {
      const transferRequest = {
        fromAccountId: formData.accountId,
        toAccountId: formData.toAccountId,
        amount: amount,
        description: formData.description,
        subcategory: formData.subcategory,
      }

      const result = TransferService.processTransfer(transferRequest, accounts, transactions)

      if (result.success && result.transactions && result.updatedAccounts) {
        setTransactions([...transactions, ...result.transactions])
        setAccounts(result.updatedAccounts)
        console.log(result.message)
      } else {
        console.error(result.message)
        alert(result.message)
        return
      }
    } else {
      const newTransaction: Transaction = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: formData.date,
        description: formData.description,
        amount: formData.type === "expense" ? -amount : amount,
        type: formData.type as "income" | "expense" | "debt",
        category: formData.category,
        subcategory: formData.subcategory,
        accountId: formData.accountId,
        receiptUrl: formData.receiptFile ? URL.createObjectURL(formData.receiptFile) : undefined,
      }

      const updatedAccounts = accounts.map((account) => {
        if (account.id === formData.accountId) {
          return {
            ...account,
            balance: account.balance + newTransaction.amount,
          }
        }
        return account
      })

      setTransactions([...transactions, newTransaction])
      setAccounts(updatedAccounts)
    }

    setIsModalOpen(false)
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "",
      subcategory: "",
      accountId: "",
      toAccountId: "",
      date: new Date().toISOString().split("T")[0],
      receiptFile: null,
    })
  }

  const handleTransactionUpdate = (updatedTransaction: Transaction, accountUpdates?: Account[]) => {
    setTransactions(transactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)))
    if (accountUpdates) {
      setAccounts(accountUpdates)
    }
  }

  const handleTransactionDelete = (transactionId: string, accountUpdates?: Account[]) => {
    setTransactions(transactions.filter((t) => t.id !== transactionId))
    if (accountUpdates) {
      setAccounts(accountUpdates)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const selectedCategory = transactionCategories.find((cat) => cat.name === formData.category)
  const subcategories = selectedCategory?.subcategories || []

  const handleCategoryChange = (category: string) => {
    const categoryData = transactionCategories.find((cat) => cat.name === category)
    setFormData({
      ...formData,
      category,
      subcategory: "",
      type: categoryData?.type || "expense",
    })
  }

  const handleSubcategoryChange = (subcategory: string) => {
    setFormData({ ...formData, subcategory })
  }

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, receiptFile: file })
  }

  const fromAccount = accounts.find((acc) => acc.id === formData.accountId)
  const toAccount = accounts.find((acc) => acc.id === formData.toAccountId)
  const transferAmount = Number.parseFloat(formData.amount) || 0

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={userProfile.avatar || "/placeholder.svg"}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-black"
              />
              <h1 className="text-4xl font-bold text-foreground font-manrope">
                {userProfile.isLoggedIn ? `Brankas ${userProfile.name}` : "Brankas Pribadi"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ClockWidget />

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="neobrutalism-button bg-[#00A86B] text-white hover:bg-[#008A5A] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-75">
                  <Plus className="mr-2 h-5 w-5" />+ Transaksi Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="neobrutalism-card max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-manrope flex items-center gap-2">
                    Tambah Transaksi Baru
                    <HelpTooltip content="Formulir untuk menambah transaksi baru. Pilih kategori terlebih dahulu untuk menentukan jenis transaksi (pemasukan, pengeluaran, atau mutasi)." />
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2">
                      Tanggal
                      <HelpTooltip content="Tanggal transaksi terjadi. Default adalah hari ini, tapi bisa diubah untuk transaksi yang terlupa dicatat." />
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      className="neobrutalism-input mt-1"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      Kategori & Sub Kategori
                      <HelpTooltip content="Pilih kategori utama (Pemasukan, Pengeluaran, Mutasi, atau Hutang) kemudian pilih sub kategori yang sesuai. Kategori menentukan jenis transaksi dan perhitungan saldo." />
                    </Label>
                    <CategorySelector
                      categories={transactionCategories}
                      selectedCategory={formData.category}
                      selectedSubcategory={formData.subcategory}
                      onCategoryChange={handleCategoryChange}
                      onSubcategoryChange={handleSubcategoryChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold">
                      Deskripsi
                    </Label>
                    <Input
                      id="description"
                      className="neobrutalism-input mt-1"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Masukkan deskripsi transaksi"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-sm font-semibold flex items-center gap-2">
                      Jumlah
                      <HelpTooltip content="Masukkan jumlah dalam Rupiah tanpa titik atau koma. Contoh: 50000 untuk lima puluh ribu rupiah." />
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      className="neobrutalism-input mt-1"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="account" className="text-sm font-semibold flex items-center gap-2">
                      {formData.category === "Mutasi" ? "Akun Asal" : "Akun"}
                      <HelpTooltip
                        content={
                          formData.category === "Mutasi"
                            ? "Pilih akun sumber dana untuk transfer. Saldo akan berkurang dari akun ini."
                            : "Pilih akun yang terkait dengan transaksi ini. Saldo akun akan berubah sesuai jenis transaksi."
                        }
                      />
                    </Label>
                    <AccountSelector
                      accounts={accounts}
                      value={formData.accountId}
                      onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                      placeholder="Pilih akun"
                    />
                  </div>

                  {formData.category === "Mutasi" && (
                    <div>
                      <Label htmlFor="toAccount" className="text-sm font-semibold flex items-center gap-2">
                        Akun Tujuan
                        <HelpTooltip content="Pilih akun tujuan transfer. Saldo akan bertambah di akun ini. Pastikan berbeda dengan akun asal." />
                      </Label>
                      <AccountSelector
                        accounts={accounts}
                        value={formData.toAccountId}
                        onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
                        placeholder="Pilih akun tujuan"
                        excludeAccountId={formData.accountId}
                      />
                    </div>
                  )}

                  {formData.category === "Mutasi" && fromAccount && toAccount && transferAmount > 0 && (
                    <TransferPreview
                      fromAccount={fromAccount}
                      toAccount={toAccount}
                      amount={transferAmount}
                      subcategory={formData.subcategory}
                    />
                  )}

                  <div>
                    <Label htmlFor="receipt" className="text-sm font-semibold flex items-center gap-2">
                      Bukti Transaksi (Opsional)
                      <HelpTooltip content="Upload foto struk, nota, atau bukti transaksi lainnya. File akan disimpan dan bisa dilihat di riwayat transaksi." />
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*"
                        className="neobrutalism-input"
                        onChange={handleReceiptChange}
                      />
                      {formData.receiptFile && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                          <span>{formData.receiptFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="neobrutalism-button w-full bg-[#00A86B] text-white hover:bg-[#008A5A] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-75"
                    disabled={
                      !formData.category ||
                      !formData.accountId ||
                      (formData.category === "Mutasi" && !formData.toAccountId)
                    }
                  >
                    Simpan Transaksi
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 max-w-6xl">
          <Card className="neobrutalism-card max-w-sm mx-auto sm:mx-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                Pemasukan Bulan Ini
                <HelpTooltip content="Total pemasukan dalam bulan berjalan dari semua sumber seperti gaji, freelance, bonus, dan lainnya." />
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-lg font-bold text-secondary break-words">
                {formatCurrency(periodData.currentIncome).replace("Rp", "Rp ").replace(/\s+/g, " ")}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {periodData.incomeChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-secondary" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span>
                  {periodData.incomeChange >= 0 ? "+" : ""}
                  {periodData.incomeChange.toFixed(1)}% dari periode sebelumnya
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card max-w-sm mx-auto sm:mx-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                Pengeluaran Bulan Ini
                <HelpTooltip content="Total pengeluaran dalam bulan berjalan untuk semua kategori seperti belanja, transport, hiburan, dan lainnya." />
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-lg font-bold text-destructive break-words">
                {formatCurrency(periodData.currentExpense).replace("Rp", "Rp ").replace(/\s+/g, " ")}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {periodData.expenseChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-destructive" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-secondary" />
                )}
                <span>
                  {periodData.expenseChange >= 0 ? "+" : ""}
                  {periodData.expenseChange.toFixed(1)}% dari periode sebelumnya
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card max-w-sm mx-auto sm:mx-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                Saldo Harian
                <HelpTooltip content="Saldo yang tersedia untuk pengeluaran sehari-hari. Dihitung dari total saldo dikurangi saldo tabungan yang tidak boleh digunakan." />
              </CardTitle>
              <Wallet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-lg font-bold text-primary break-words">
                {formatCurrency(dailyBalance).replace("Rp", "Rp ").replace(/\s+/g, " ")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Tersedia untuk pengeluaran</div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card max-w-sm mx-auto sm:mx-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                Saldo Tabungan
                <HelpTooltip content="Total saldo dari akun-akun yang ditandai sebagai tabungan. Dana ini sebaiknya tidak digunakan untuk pengeluaran harian." />
              </CardTitle>
              <PiggyBank className="h-5 w-5 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-lg font-bold text-chart-1 break-words">
                {formatCurrency(savingsBalance).replace("Rp", "Rp ").replace(/\s+/g, " ")}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 text-chart-1" />
                <span>+5% dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="neobrutalism-card max-w-6xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold font-manrope flex items-center gap-2">
              Transaksi Terbaru
              <HelpTooltip content="5 transaksi terakhir yang dicatat. Klik ikon aksi untuk mengedit atau menghapus transaksi. Lihat semua transaksi di menu Riwayat." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-black">
                  <TableHead className="font-bold text-foreground">Tanggal</TableHead>
                  <TableHead className="font-bold text-foreground">Deskripsi</TableHead>
                  <TableHead className="font-bold text-foreground">Akun</TableHead>
                  <TableHead className="font-bold text-foreground">Kategori</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Jumlah</TableHead>
                  <TableHead className="font-bold text-foreground w-16">Bukti</TableHead>
                  <TableHead className="font-bold text-foreground w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 5).map((transaction) => {
                  const account = accounts.find((acc) => acc.id === transaction.accountId)
                  const toAccount = transaction.toAccountId
                    ? accounts.find((acc) => acc.id === transaction.toAccountId)
                    : null

                  return (
                    <TableRow
                      key={transaction.id}
                      className="neobrutalism-table-row border-b border-border transition-all duration-75"
                    >
                      <TableCell className="font-medium">
                        {new Date(transaction.date).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${account?.color}`} />
                          <span className="text-sm">{account?.name}</span>
                          {toAccount && (
                            <>
                              <span className="text-xs text-muted-foreground">→</span>
                              <div className={`w-2 h-2 rounded-full ${toAccount.color}`} />
                              <span className="text-sm">{toAccount.name}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{transaction.category}</div>
                          {transaction.subcategory && (
                            <div className="text-xs text-muted-foreground">{transaction.subcategory}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          transaction.type === "income"
                            ? "text-secondary"
                            : transaction.type === "transfer"
                              ? "text-primary"
                              : transaction.type === "debt"
                                ? "text-orange-600"
                                : "text-destructive"
                        }`}
                      >
                        {formatCurrency(Math.abs(transaction.amount))}
                      </TableCell>
                      <TableCell>
                        {transaction.receiptUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-8 w-8"
                            onClick={() => window.open(transaction.receiptUrl, "_blank")}
                          >
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        ) : (
                          <div className="h-8 w-8" />
                        )}
                      </TableCell>
                      <TableCell>
                        <TransactionActions
                          transaction={transaction}
                          accounts={accounts}
                          onUpdate={handleTransactionUpdate}
                          onDelete={handleTransactionDelete}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
