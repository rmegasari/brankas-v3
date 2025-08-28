"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  PieChartIcon,
  BarChart3,
  CalendarIcon,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HelpTooltip } from "@/components/help-tooltip"
import { accounts } from "@/lib/data"

export default function AnalyticsPage() {
  const [chartType, setChartType] = useState("overview")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

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

  const exportToPDF = () => {
    console.log("[v0] Exporting analytics to PDF...")
    alert("Export PDF akan segera tersedia")
  }

  const exportToJPEG = () => {
    console.log("[v0] Exporting analytics to JPEG...")
    alert("Export JPEG akan segera tersedia")
  }

  const exportToXLSX = () => {
    console.log("[v0] Exporting analytics to XLSX...")
    alert("Export XLSX akan segera tersedia")
  }

  const monthlyData = [
    { month: "Okt", income: 6500000, expense: 2800000, savings: 3700000 },
    { month: "Nov", income: 7200000, expense: 3200000, savings: 4000000 },
    { month: "Des", income: 8500000, expense: 3800000, savings: 4700000 },
    { month: "Jan", income: 6500000, expense: 2900000, savings: 3600000 },
  ]

  const currentData = monthlyData

  const categoryData = [
    { name: "Belanja Bulanan", value: 1200000, color: "#ef4444" },
    { name: "Transport", value: 800000, color: "#f97316" },
    { name: "Makan & Minum", value: 600000, color: "#eab308" },
    { name: "Hiburan", value: 400000, color: "#22c55e" },
    { name: "Internet", value: 300000, color: "#3b82f6" },
    { name: "Lainnya", value: 500000, color: "#8b5cf6" },
  ]

  const accountData = accounts.map((account) => ({
    name: account.name,
    balance: account.balance,
    type: account.type,
    color: account.color.replace("bg-", "").replace("-500", ""),
  }))

  const totalIncome = currentData.reduce((sum, period) => sum + period.income, 0)
  const totalExpense = currentData.reduce((sum, period) => sum + period.expense, 0)
  const totalSavings = currentData.reduce((sum, period) => sum + period.savings, 0)
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : "0"

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
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

        {/* Summary Cards */}
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
              <p className="text-xs text-muted-foreground">+12% dari periode sebelumnya</p>
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
              <p className="text-xs text-muted-foreground">-5% dari periode sebelumnya</p>
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
              <p className="text-xs text-muted-foreground">+18% dari periode sebelumnya</p>
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

        {/* Chart Selection */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={chartType === "overview" ? "default" : "outline"}
              onClick={() => setChartType("overview")}
              className="neobrutalism-button flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
              <HelpTooltip content="Tampilan umum perbandingan pemasukan vs pengeluaran dan pertumbuhan tabungan dalam bentuk grafik batang dan area." />
            </Button>
            <Button
              variant={chartType === "categories" ? "default" : "outline"}
              onClick={() => setChartType("categories")}
              className="neobrutalism-button flex items-center gap-1"
            >
              <PieChartIcon className="h-4 w-4 mr-2" />
              Kategori
              <HelpTooltip content="Analisis pengeluaran berdasarkan kategori dengan grafik pie dan detail persentase untuk setiap kategori pengeluaran." />
            </Button>
            <Button
              variant={chartType === "accounts" ? "default" : "outline"}
              onClick={() => setChartType("accounts")}
              className="neobrutalism-button flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Akun
              <HelpTooltip content="Distribusi saldo di berbagai akun (bank, e-wallet, cash) dan komposisi persentase masing-masing akun." />
            </Button>
            <Button
              variant={chartType === "trends" ? "default" : "outline"}
              onClick={() => setChartType("trends")}
              className="neobrutalism-button flex items-center gap-1"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Tren
              <HelpTooltip content="Analisis tren pengeluaran bulanan dan proyeksi tabungan untuk melihat pola keuangan dari waktu ke waktu." />
            </Button>
            <Button
              variant={chartType === "forecast" ? "default" : "outline"}
              onClick={() => setChartType("forecast")}
              className="neobrutalism-button flex items-center gap-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Forecasting
              <HelpTooltip content="Prediksi keuangan masa depan berdasarkan pola historis, termasuk proyeksi pemasukan, pengeluaran, dan rekomendasi strategis." />
            </Button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {chartType === "overview" && (
            <>
              <Card className="neobrutalism-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold font-manrope">Pemasukan vs Pengeluaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={currentData}>
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
                    <AreaChart data={currentData}>
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
                            {((category.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(
                              1,
                            )}
                            %
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
                    <BarChart data={accountData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="balance" fill="#3b82f6" />
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
                            {((account.balance / accountData.reduce((sum, acc) => sum + acc.balance, 0)) * 100).toFixed(
                              1,
                            )}
                            %
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {chartType === "trends" && (
            <>
              <Card className="neobrutalism-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold font-manrope">Tren Pengeluaran Bulanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 6 }}
                        name="Pengeluaran"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="neobrutalism-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold font-manrope">Proyeksi Tabungan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{formatCompactCurrency(totalSavings)}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(totalSavings)}</div>
                      <div className="text-sm text-muted-foreground">Tabungan saat ini</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Proyeksi 3 bulan:</span>
                        <span className="font-bold text-secondary text-sm">
                          {formatCompactCurrency(totalSavings + totalSavings * 0.15)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Proyeksi 6 bulan:</span>
                        <span className="font-bold text-secondary text-sm">
                          {formatCompactCurrency(totalSavings + totalSavings * 0.35)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Proyeksi 1 tahun:</span>
                        <span className="font-bold text-secondary text-sm">
                          {formatCompactCurrency(totalSavings + totalSavings * 0.75)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {chartType === "forecast" && (
            <>
              <Card className="neobrutalism-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold font-manrope">Prediksi Pemasukan</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        ...currentData,
                        {
                          month: "Prediksi 1",
                          income: (totalIncome / currentData.length) * 1.03,
                          expense: 0,
                          savings: 0,
                        },
                        {
                          month: "Prediksi 2",
                          income: (totalIncome / currentData.length) * 1.06,
                          expense: 0,
                          savings: 0,
                        },
                        {
                          month: "Prediksi 3",
                          income: (totalIncome / currentData.length) * 1.09,
                          expense: 0,
                          savings: 0,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#22c55e"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                        name="Prediksi Pemasukan"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="neobrutalism-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold font-manrope">Prediksi Pengeluaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        ...currentData,
                        {
                          month: "Prediksi 1",
                          income: 0,
                          expense: (totalExpense / currentData.length) * 1.05,
                          savings: 0,
                        },
                        {
                          month: "Prediksi 2",
                          income: 0,
                          expense: (totalExpense / currentData.length) * 1.08,
                          savings: 0,
                        },
                        {
                          month: "Prediksi 3",
                          income: 0,
                          expense: (totalExpense / currentData.length) * 1.12,
                          savings: 0,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                        name="Prediksi Pengeluaran"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="neobrutalism-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold font-manrope">Prediksi Tabungan</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={[
                        ...currentData,
                        {
                          month: "Prediksi 1",
                          income: 0,
                          expense: 0,
                          savings: totalSavings + (totalSavings / currentData.length) * 0.15,
                        },
                        {
                          month: "Prediksi 2",
                          income: 0,
                          expense: 0,
                          savings: totalSavings + (totalSavings / currentData.length) * 0.32,
                        },
                        {
                          month: "Prediksi 3",
                          income: 0,
                          expense: 0,
                          savings: totalSavings + (totalSavings / currentData.length) * 0.48,
                        },
                      ]}
                    >
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
                        strokeDasharray="5 5"
                        name="Prediksi Tabungan"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="neobrutalism-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold font-manrope">Analisis Pola & Rekomendasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg border-2 border-black">
                      <h4 className="font-bold text-sm mb-2">Pola Keuangan Terdeteksi:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Pemasukan cenderung stabil dengan pertumbuhan 3-6% per periode</li>
                        <li>• Pengeluaran naik 5-8% per periode</li>
                        <li>• Tabungan tumbuh rata-rata 15% per periode</li>
                        <li>• Tingkat tabungan saat ini: {savingsRate}%</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-secondary/10 rounded-lg border-2 border-black">
                      <h4 className="font-bold text-sm mb-2">Proyeksi 3 Bulan Ke Depan:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Pemasukan: {formatCompactCurrency((totalIncome / currentData.length) * 3 * 1.06)}</li>
                        <li>• Pengeluaran: {formatCompactCurrency((totalExpense / currentData.length) * 3 * 1.08)}</li>
                        <li>
                          • Tabungan: {formatCompactCurrency(totalSavings + (totalSavings / currentData.length) * 0.48)}
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-primary/10 rounded-lg border-2 border-black">
                      <h4 className="font-bold text-sm mb-2">Rekomendasi Strategis:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Pertahankan tingkat tabungan di atas 25%</li>
                        <li>• Diversifikasi sumber pemasukan</li>
                        <li>• Monitor pengeluaran yang tumbuh terlalu cepat</li>
                        <li>• Alokasikan 10% untuk investasi jangka panjang</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
