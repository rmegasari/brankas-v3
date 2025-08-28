"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart
} from "recharts"
import {
  TrendingUp, TrendingDown, PieChartIcon, BarChart3, CalendarIcon, FileText,
  ImageIcon, FileSpreadsheet, ChevronDown, Loader2
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HelpTooltip } from "@/components/help-tooltip"
import { supabase } from "@/lib/supabase"

// Tipe data untuk transaksi yang sudah diproses
interface ProcessedTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
}

// Fungsi helper untuk mendapatkan tanggal awal dan akhir bulan ini
const getMonthDateRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Format ke YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay),
  };
};


export default function AnalyticsPage() {
  // State untuk data mentah dan yang sudah diproses
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [accountData, setAccountData] = useState<any[]>([])

  // State untuk loading, error, dan filter
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // DIUBAH: Atur tanggal awal dan akhir ke bulan ini secara default
  const [startDate, setStartDate] = useState(getMonthDateRange().start)
  const [endDate, setEndDate] = useState(getMonthDateRange().end)
  
  const [chartType, setChartType] = useState("overview")

  // Fungsi untuk memproses data transaksi mentah menjadi data bulanan
  const processMonthlyData = (data: ProcessedTransaction[]) => {
    const monthlyStats: Record<string, { income: number; expense: number }> = {}
    data.forEach(tx => {
      const month = new Date(tx.date).toLocaleDateString("id-ID", { year: '2-digit', month: "short" })
      if (!monthlyStats[month]) {
        monthlyStats[month] = { income: 0, expense: 0 }
      }
      if (tx.type === 'income') {
        monthlyStats[month].income += tx.amount
      } else if (tx.type === 'expense') {
        monthlyStats[month].expense += tx.amount
      }
    });
    return Object.entries(monthlyStats).map(([month, values]) => ({
      month,
      income: values.income,
      expense: values.expense,
      savings: values.income - values.expense,
    })).reverse();
  };

  // Fungsi untuk memproses data pengeluaran per kategori
  const processCategoryData = (data: ProcessedTransaction[]) => {
    const categoryStats: Record<string, number> = {};
    const expenseTransactions = data.filter(tx => tx.type === 'expense');
    expenseTransactions.forEach(tx => {
      if (!categoryStats[tx.category]) {
        categoryStats[tx.category] = 0;
      }
      categoryStats[tx.category] += tx.amount;
    });
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
    return Object.entries(categoryStats).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  };
  
  // Ambil data dari Supabase saat komponen dimuat atau filter tanggal berubah
  useEffect(() => {
    const fetchData = async () => {
      // Jangan fetch jika salah satu tanggal kosong
      if (!startDate || !endDate) return;

      setLoading(true)
      setError(null)

      try {
        let transactionQuery = supabase.from("transactions").select("*")
        if (startDate) {
          transactionQuery = transactionQuery.gte("date", startDate)
        }
        if (endDate) {
          transactionQuery = transactionQuery.lte("date", endDate)
        }
        const { data: transactionData, error: transactionError } = await transactionQuery;
        if (transactionError) throw transactionError;

        const { data: platformData, error: platformError } = await supabase.from("platforms").select("*");
        if (platformError) throw platformError;

        const processedTransactions: ProcessedTransaction[] = transactionData.map(tx => ({
            id: tx.id,
            date: tx.date,
            type: tx.type,
            category: tx.category,
            amount: tx.amount, // Ganti ke tx.nominal jika nama kolom Anda 'nominal'
        }));

        setMonthlyData(processMonthlyData(processedTransactions));
        setCategoryData(processCategoryData(processedTransactions));
        setAccountData(platformData.map(acc => ({
            name: acc.name,
            balance: acc.balance,
            type: acc.type,
            color: acc.color?.replace("bg-", "").replace("-500", ""),
        })));

      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("Gagal memuat data analytics. Pastikan koneksi dan RLS Policy benar.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  // Hitung total menggunakan useMemo agar lebih efisien
  const { totalIncome, totalExpense, totalSavings, savingsRate } = useMemo(() => {
    const income = monthlyData.reduce((sum, period) => sum + period.income, 0)
    const expense = monthlyData.reduce((sum, period) => sum + period.expense, 0)
    const savings = income - expense;
    const rate = income > 0 ? ((savings / income) * 100).toFixed(1) : "0"
    return { totalIncome: income, totalExpense: expense, totalSavings: savings, savingsRate: rate }
  }, [monthlyData])


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

  const exportToPDF = () => { alert("Fitur Export PDF akan segera tersedia") }
  const exportToJPEG = () => { alert("Fitur Export JPEG akan segera tersedia") }
  const exportToXLSX = () => { alert("Fitur Export XLSX akan segera tersedia") }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-foreground font-manrope flex items-center gap-2">
              Analytics
              <HelpTooltip content="Halaman analisis keuangan dengan berbagai grafik dan metrik untuk memahami pola pemasukan, pengeluaran, dan tabungan Anda." />
            </h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="startDate" className="text-sm font-semibold flex items-center gap-1">
                Dari:
                <HelpTooltip content="Pilih tanggal awal untuk filter periode analisis. Data akan ditampilkan mulai dari tanggal ini." />
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="neobrutalism-input w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="endDate" className="text-sm font-semibold flex items-center gap-1">
                Sampai:
                <HelpTooltip content="Pilih tanggal akhir untuk filter periode analisis. Data akan ditampilkan sampai tanggal ini." />
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="neobrutalism-input w-auto"
              />
            </div>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="neobrutalism-button flex items-center gap-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                    <HelpTooltip content="Export data analisis ke berbagai format: PDF untuk laporan, JPEG untuk gambar, atau XLSX untuk spreadsheet." />
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start text-sm" onClick={exportToPDF}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm" onClick={exportToJPEG}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Export JPEG
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm" onClick={exportToXLSX}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export XLSX
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">{error}</div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 max-w-6xl">
              <Card className="neobrutalism-card max-w-sm mx-auto sm:mx-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1">
                    Total Pemasukan
                    <HelpTooltip content="Jumlah total pemasukan dari semua sumber dalam periode yang dipilih, termasuk gaji, freelance, bonus, dan investasi." />
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-secondary break-words">{formatCompactCurrency(totalIncome)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatCurrency(totalIncome)}</div>
                </CardContent>
              </Card>
              <Card className="neobrutalism-card max-w-sm mx-auto sm:mx-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1">
                    Total Pengeluaran
                    <HelpTooltip content="Jumlah total pengeluaran dari semua kategori dalam periode yang dipilih, seperti belanja, transport, hiburan, dan kebutuhan lainnya." />
                  </CardTitle>
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-destructive break-words">
                    {formatCompactCurrency(totalExpense)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{formatCurrency(totalExpense)}</div>
                </CardContent>
              </Card>
              <Card className="neobrutalism-card max-w-sm mx-auto sm:mx-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1">
                    Total Tabungan
                    <HelpTooltip content="Jumlah total tabungan yang berhasil dikumpulkan dalam periode ini, dihitung dari selisih pemasukan dan pengeluaran." />
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-chart-1 break-words">{formatCompactCurrency(totalSavings)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatCurrency(totalSavings)}</div>
                </CardContent>
              </Card>
              <Card className="neobrutalism-card max-w-sm mx-auto sm:mx-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1">
                    Tingkat Tabungan
                    <HelpTooltip content="Persentase dari pemasukan yang berhasil ditabung. Target ideal adalah 20-30% dari total pemasukan untuk kesehatan finansial yang baik." />
                  </CardTitle>
                  <PieChartIcon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-primary">{savingsRate}%</div>
                  <p className="text-xs text-muted-foreground">Target: 30%</p>
                </CardContent>
              </Card>
            </div>
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={chartType === "overview" ? "default" : "outline"}
                  onClick={() => setChartType("overview")}
                  className="neobrutalism-button flex items-center gap-1"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={chartType === "categories" ? "default" : "outline"}
                  onClick={() => setChartType("categories")}
                  className="neobrutalism-button flex items-center gap-1"
                >
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Kategori
                </Button>
                <Button
                  variant={chartType === "accounts" ? "default" : "outline"}
                  onClick={() => setChartType("accounts")}
                  className="neobrutalism-button flex items-center gap-1"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Akun
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {chartType === "overview" && (
                <>
                  <Card className="neobrutalism-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold font-manrope">Pemasukan vs Pengeluaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                          <Bar dataKey="income" fill="#22c55e" name="Pemasukan" />
                          <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="neobrutalism-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold font-manrope">Pertumbuhan Tabungan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Area
                            type="monotone"
                            dataKey="savings"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                            name="Tabungan"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
              {chartType === "categories" && (
                <>
                  <Card className="neobrutalism-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold font-manrope">Pengeluaran per Kategori</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="neobrutalism-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold font-manrope">Detail Kategori</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryData.map((category, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                              <span className="font-medium text-sm">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm">{formatCompactCurrency(category.value)}</div>
                              <div className="text-xs text-muted-foreground">
                                {((category.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              {chartType === "accounts" && (
                <>
                  <Card className="neobrutalism-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold font-manrope">Distribusi Saldo Akun</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={accountData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="balance" fill="#3b82f6" name="Saldo" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="neobrutalism-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold font-manrope">Komposisi Akun</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {accountData.map((account, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full bg-${account.color}-500`} />
                              <div>
                                <div className="font-medium text-sm">{account.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">{account.type}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm">{formatCompactCurrency(account.balance)}</div>
                              <div className="text-xs text-muted-foreground">
                                {((account.balance / accountData.reduce((sum, acc) => sum + acc.balance, 0)) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
