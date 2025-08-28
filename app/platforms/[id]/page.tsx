"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ArrowRightLeft, CreditCard, Wallet, PiggyBank } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { accounts, transactions } from "@/lib/data"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export default function AccountDetailPage() {
  const params = useParams()
  const accountId = params.id as string

  const account = accounts.find((acc) => acc.id === accountId)

  const [accountTransactions, stats, monthlyData] = useMemo(() => {
    const transactionsForAccount = transactions
      .filter((t) => t.accountId === accountId || t.toAccountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const income = transactionsForAccount
      .filter(
        (t) =>
          (t.type === "income" && t.accountId === accountId) || (t.type === "transfer" && t.toAccountId === accountId),
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const expense = transactionsForAccount
      .filter(
        (t) =>
          (t.type === "expense" && t.accountId === accountId) || (t.type === "transfer" && t.accountId === accountId),
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const transfers = transactionsForAccount.filter((t) => t.type === "transfer").length

    const monthlyStats: Record<string, { income: number; expense: number }> = {}

    transactionsForAccount.forEach((transaction) => {
      const month = new Date(transaction.date).toLocaleDateString("id-ID", { month: "short" })

      if (!monthlyStats[month]) {
        monthlyStats[month] = { income: 0, expense: 0 }
      }

      if (
        (transaction.type === "income" && transaction.accountId === accountId) ||
        (transaction.type === "transfer" && transaction.toAccountId === accountId)
      ) {
        monthlyStats[month].income += Math.abs(transaction.amount)
      } else if (
        (transaction.type === "expense" && transaction.accountId === accountId) ||
        (transaction.type === "transfer" && transaction.accountId === accountId)
      ) {
        monthlyStats[month].expense += Math.abs(transaction.amount)
      }
    })

    return [
      transactionsForAccount,
      { income, expense, transfers, total: transactionsForAccount.length },
      Object.entries(monthlyStats).map(([month, data]) => ({
        month,
        ...data,
      })),
    ]
  }, [accountId])

  if (!account) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Akun tidak ditemukan</h1>
            <Link href="/platforms">
              <Button className="neobrutalism-button">Kembali ke Platform</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full ${account.color}`} />
              <h1 className="text-4xl font-bold text-foreground font-manrope">{account.name}</h1>
              {account.type === "bank" ? (
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Wallet className="h-6 w-6 text-muted-foreground" />
              )}
              {account.isSavings && <PiggyBank className="h-6 w-6 text-chart-1" />}
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Saldo Saat Ini</CardTitle>
              <Wallet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(account.balance)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {account.type === "bank" ? "Rekening Bank" : "E-Wallet"}
                {account.isSavings && " • Tabungan"}
              </div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Pemasukan</CardTitle>
              <TrendingUp className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{formatCurrency(stats.income)}</div>
              <div className="text-xs text-muted-foreground">Bulan ini</div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Pengeluaran</CardTitle>
              <TrendingDown className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(stats.expense)}</div>
              <div className="text-xs text-muted-foreground">Bulan ini</div>
            </CardContent>
          </Card>

          <Card className="neobrutalism-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Transaksi</CardTitle>
              <ArrowRightLeft className="h-5 w-5 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-1">{stats.total}</div>
              <div className="text-xs text-muted-foreground">{stats.transfers} transfer</div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Chart */}
        {monthlyData.length > 0 && (
          <Card className="neobrutalism-card mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold font-manrope">Aktivitas Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="income" fill="#22c55e" name="Pemasukan" />
                  <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card className="neobrutalism-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold font-manrope">Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {accountTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Belum ada transaksi untuk akun ini</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-black">
                    <TableHead className="font-bold text-foreground">Tanggal</TableHead>
                    <TableHead className="font-bold text-foreground">Deskripsi</TableHead>
                    <TableHead className="font-bold text-foreground">Kategori</TableHead>
                    <TableHead className="font-bold text-foreground">Tipe</TableHead>
                    <TableHead className="font-bold text-foreground text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountTransactions.map((transaction) => {
                    const toAccount = transaction.toAccountId
                      ? accounts.find((acc) => acc.id === transaction.toAccountId)
                      : null

                    // Determine if this is incoming or outgoing for this account
                    const isIncoming = transaction.toAccountId === accountId
                    const isOutgoing = transaction.accountId === accountId && transaction.type !== "income"

                    return (
                      <TableRow
                        key={transaction.id}
                        className="neobrutalism-table-row border-b border-border transition-all duration-75"
                      >
                        <TableCell className="font-medium">
                          {new Date(transaction.date).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.subcategory && (
                              <div className="text-xs text-muted-foreground">{transaction.subcategory}</div>
                            )}
                            {toAccount && transaction.type === "transfer" && (
                              <div className="text-xs text-muted-foreground">
                                {isIncoming
                                  ? `Dari ${accounts.find((acc) => acc.id === transaction.accountId)?.name}`
                                  : `Ke ${toAccount.name}`}
                              </div>
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
                            transaction.type === "income" || isIncoming
                              ? "text-secondary"
                              : transaction.type === "transfer"
                                ? "text-primary"
                                : "text-destructive"
                          }`}
                        >
                          {(transaction.type === "income" || isIncoming) && !isOutgoing ? "+" : "-"}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
