"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Filter,
  Download,
  CalendarIcon,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  X,
  ChevronDown,
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { TransactionActions } from "@/components/transaction-actions"
import { accounts as initialAccounts, transactions as initialTransactions, transactionCategories } from "@/lib/data"
import type { Transaction, Account } from "@/types"

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [sortBy, setSortBy] = useState<"date" | "amount" | "description">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
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

  const handleStruckToggle = (transactionId: string) => {
    setTransactions(transactions.map((t) => (t.id === transactionId ? { ...t, struck: !t.struck } : t)))
  }

  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      // Search filter
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Account filter
      if (selectedAccount !== "all" && transaction.accountId !== selectedAccount) {
        return false
      }

      // Category filter
      if (selectedCategory !== "all" && transaction.category !== selectedCategory) {
        return false
      }

      // Type filter
      if (selectedType !== "all" && transaction.type !== selectedType) {
        return false
      }

      // Date range filter
      if (dateRange.from || dateRange.to) {
        const transactionDate = new Date(transaction.date)
        if (dateRange.from && transactionDate < dateRange.from) return false
        if (dateRange.to && transactionDate > dateRange.to) return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "amount":
          comparison = Math.abs(a.amount) - Math.abs(b.amount)
          break
        case "description":
          comparison = a.description.localeCompare(b.description)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [transactions, searchTerm, selectedAccount, selectedCategory, selectedType, dateRange, sortBy, sortOrder])

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedTransactions, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage)

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedAccount("all")
    setSelectedCategory("all")
    setSelectedType("all")
    setDateRange({})
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Tanggal", "Deskripsi", "Kategori", "Sub Kategori", "Akun", "Tipe", "Jumlah", "Struck"].join(","),
      ...filteredAndSortedTransactions.map((transaction) => {
        const account = accounts.find((acc) => acc.id === transaction.accountId)
        return [
          transaction.date,
          `"${transaction.description}"`,
          transaction.category,
          transaction.subcategory || "",
          account?.name || "",
          transaction.type,
          transaction.amount,
          transaction.struck ? "Ya" : "Tidak",
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transaksi_${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = () => {
    // Create PDF content
    const content = `
      <html>
        <head>
          <title>Laporan Transaksi</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .struck { text-decoration: line-through; opacity: 0.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Riwayat Transaksi</h1>
            <p>Periode: ${format(new Date(), "dd MMMM yyyy", { locale: id })}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th>Akun</th>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAndSortedTransactions
                .map((transaction) => {
                  const account = accounts.find((acc) => acc.id === transaction.accountId)
                  return `
                  <tr class="${transaction.struck ? "struck" : ""}">
                    <td>${format(new Date(transaction.date), "dd/MM/yyyy")}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.category}</td>
                    <td>${account?.name || ""}</td>
                    <td>${transaction.type === "income" ? "Pemasukan" : transaction.type === "expense" ? "Pengeluaran" : "Transfer"}</td>
                    <td>${formatCurrency(Math.abs(transaction.amount))}</td>
                    <td>${transaction.struck ? "Selesai" : "Aktif"}</td>
                  </tr>
                `
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([content], { type: "text/html" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transaksi_${format(new Date(), "yyyy-MM-dd")}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToXLSX = () => {
    const data = [
      ["Tanggal", "Deskripsi", "Kategori", "Sub Kategori", "Akun", "Tipe", "Jumlah", "Status"],
      ...filteredAndSortedTransactions.map((transaction) => {
        const account = accounts.find((acc) => acc.id === transaction.accountId)
        return [
          format(new Date(transaction.date), "dd/MM/yyyy"),
          transaction.description,
          transaction.category,
          transaction.subcategory || "",
          account?.name || "",
          transaction.type === "income" ? "Pemasukan" : transaction.type === "expense" ? "Pengeluaran" : "Transfer",
          Math.abs(transaction.amount),
          transaction.struck ? "Selesai" : "Aktif",
        ]
      }),
    ]

    const csvContent = data.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transaksi_${format(new Date(), "yyyy-MM-dd")}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return <TrendingUp className="h-4 w-4 text-secondary" />
      case "expense":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-primary" />
      default:
        return null
    }
  }

  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "expense":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "transfer":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const activeFiltersCount = [
    searchTerm,
    selectedAccount !== "all" ? selectedAccount : null,
    selectedCategory !== "all" ? selectedCategory : null,
    selectedType !== "all" ? selectedType : null,
    dateRange.from || dateRange.to ? "dateRange" : null,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-foreground font-manrope">Riwayat Transaksi</h1>
          </div>

          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="neobrutalism-button bg-secondary text-secondary-foreground">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-sm" onClick={exportToCSV}>
                    Export CSV
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" onClick={exportToPDF}>
                    Export PDF
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" onClick={exportToXLSX}>
                    Export XLSX
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filters */}
        <Card className="neobrutalism-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold font-manrope flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Pencarian
              </CardTitle>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="neobrutalism-button bg-transparent"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hapus Filter ({activeFiltersCount})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {/* Search */}
              <div className="xl:col-span-2">
                <label className="text-sm font-semibold mb-2 block">Cari Transaksi</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="neobrutalism-input pl-10"
                  />
                </div>
              </div>

              {/* Account Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Akun</label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="neobrutalism-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Akun</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${account.color}`} />
                          {account.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Kategori</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="neobrutalism-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {transactionCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Tipe</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="neobrutalism-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Rentang Tanggal</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="neobrutalism-input w-full justify-start text-left font-normal bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd MMM", { locale: id })} -{" "}
                            {format(dateRange.to, "dd MMM yyyy", { locale: id })}
                          </>
                        ) : (
                          format(dateRange.from, "dd MMM yyyy", { locale: id })
                        )
                      ) : (
                        "Pilih tanggal"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {paginatedTransactions.length} dari {filteredAndSortedTransactions.length} transaksi
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">Tampilkan:</label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="neobrutalism-input w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value={filteredAndSortedTransactions.length.toString()}>Semua</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">Urutkan:</label>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-")
                  setSortBy(field as "date" | "amount" | "description")
                  setSortOrder(order as "asc" | "desc")
                }}
              >
                <SelectTrigger className="neobrutalism-input w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Tanggal (Terbaru)</SelectItem>
                  <SelectItem value="date-asc">Tanggal (Terlama)</SelectItem>
                  <SelectItem value="amount-desc">Jumlah (Tertinggi)</SelectItem>
                  <SelectItem value="amount-asc">Jumlah (Terendah)</SelectItem>
                  <SelectItem value="description-asc">Deskripsi (A-Z)</SelectItem>
                  <SelectItem value="description-desc">Deskripsi (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <Card className="neobrutalism-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-black">
                  <TableHead className="font-bold text-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (sortBy === "date") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        } else {
                          setSortBy("date")
                          setSortOrder("desc")
                        }
                      }}
                      className="h-auto p-0 font-bold hover:bg-transparent"
                    >
                      Tanggal
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (sortBy === "description") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        } else {
                          setSortBy("description")
                          setSortOrder("asc")
                        }
                      }}
                      className="h-auto p-0 font-bold hover:bg-transparent"
                    >
                      Deskripsi
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">Akun</TableHead>
                  <TableHead className="font-bold text-foreground">Kategori</TableHead>
                  <TableHead className="font-bold text-foreground">Tipe</TableHead>
                  <TableHead className="font-bold text-foreground text-right">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (sortBy === "amount") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        } else {
                          setSortBy("amount")
                          setSortOrder("desc")
                        }
                      }}
                      className="h-auto p-0 font-bold hover:bg-transparent"
                    >
                      Jumlah
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold text-foreground w-16">Struck</TableHead>
                  <TableHead className="font-bold text-foreground w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Tidak ada transaksi yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((transaction) => {
                    const account = accounts.find((acc) => acc.id === transaction.accountId)
                    const toAccount = transaction.toAccountId
                      ? accounts.find((acc) => acc.id === transaction.toAccountId)
                      : null

                    return (
                      <TableRow
                        key={transaction.id}
                        className={`neobrutalism-table-row border-b border-border transition-all duration-75 ${
                          transaction.struck ? "opacity-60" : ""
                        }`}
                      >
                        <TableCell className="font-medium">
                          {format(new Date(transaction.date), "dd MMM yyyy", { locale: id })}
                        </TableCell>
                        <TableCell>
                          <div className={transaction.struck ? "line-through" : ""}>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.subcategory && (
                              <div className="text-xs text-muted-foreground">{transaction.subcategory}</div>
                            )}
                          </div>
                        </TableCell>
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
                          <div className="text-sm">{transaction.category}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getTransactionBadgeColor(transaction.type)} flex items-center gap-1 w-fit`}
                          >
                            {getTransactionIcon(transaction.type)}
                            {transaction.type === "income"
                              ? "Masuk"
                              : transaction.type === "expense"
                                ? "Keluar"
                                : "Transfer"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            transaction.type === "income"
                              ? "text-secondary"
                              : transaction.type === "transfer"
                                ? "text-primary"
                                : "text-destructive"
                          } ${transaction.struck ? "line-through" : ""}`}
                        >
                          {formatCurrency(Math.abs(transaction.amount))}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={transaction.struck || false}
                            onCheckedChange={() => handleStruckToggle(transaction.id)}
                            className="neobrutalism-input"
                          />
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
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="neobrutalism-button bg-transparent"
            >
              Sebelumnya
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className="neobrutalism-button w-10 h-10 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="neobrutalism-button bg-transparent"
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
