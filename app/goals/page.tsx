"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Plus, Target, Home, Car, Plane, GraduationCap, Heart, Edit } from "lucide-react"
import { accounts as initialAccounts } from "@/lib/data"
import type { SavingsGoal, Account } from "@/types"

export default function GoalsPage() {
  const [accounts] = useState<Account[]>(initialAccounts)
  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      id: "1",
      name: "Rumah Impian",
      targetAmount: 500000000,
      currentAmount: 0,
      deadline: "2026-12-31",
      description: "Menabung untuk DP rumah",
      isActive: true,
      createdAt: "2024-01-01",
    },
    {
      id: "2",
      name: "Mobil Baru",
      targetAmount: 200000000,
      currentAmount: 0,
      deadline: "2025-06-30",
      description: "Mobil keluarga",
      isActive: true,
      createdAt: "2024-02-01",
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    description: "",
  })

  const totalSavingsBalance = accounts
    .filter((account) => account.isSavings)
    .reduce((sum, account) => sum + account.balance, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getGoalIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("rumah")) return Home
    if (lowerName.includes("mobil")) return Car
    if (lowerName.includes("liburan") || lowerName.includes("travel")) return Plane
    if (lowerName.includes("pendidikan") || lowerName.includes("kuliah")) return GraduationCap
    if (lowerName.includes("kesehatan")) return Heart
    return Target
  }

  const addGoal = () => {
    if (newGoal.name && newGoal.targetAmount) {
      const goal: SavingsGoal = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: Number.parseInt(newGoal.targetAmount),
        currentAmount: 0,
        deadline: newGoal.deadline || undefined,
        description: newGoal.description || undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      setGoals((prev) => [...prev, goal])
      setNewGoal({ name: "", targetAmount: "", deadline: "", description: "" })
      setShowAddForm(false)
    }
  }

  const updateGoal = () => {
    if (editingGoal && newGoal.name && newGoal.targetAmount) {
      const updatedGoal: SavingsGoal = {
        ...editingGoal,
        name: newGoal.name,
        targetAmount: Number.parseInt(newGoal.targetAmount),
        deadline: newGoal.deadline || undefined,
        description: newGoal.description || undefined,
      }
      setGoals((prev) => prev.map((goal) => (goal.id === editingGoal.id ? updatedGoal : goal)))
      setEditingGoal(null)
      setNewGoal({ name: "", targetAmount: "", deadline: "", description: "" })
    }
  }

  const startEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setNewGoal({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline || "",
      description: goal.description || "",
    })
  }

  const calculateProgress = (targetAmount: number) => {
    return Math.min((totalSavingsBalance / targetAmount) * 100, 100)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-manrope">Tujuan Tabungan</h1>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-black hover:bg-gray-800 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-75 font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Tujuan
        </Button>
      </div>

      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-black text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Total Saldo Tabungan</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalSavingsBalance)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Untuk {goals.length} tujuan tabungan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Goal Form */}
      {(showAddForm || editingGoal) && (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="border-b-2 border-black bg-black text-white">
            <CardTitle>{editingGoal ? "Edit Tujuan Tabungan" : "Tambah Tujuan Tabungan Baru"}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalName">Nama Tujuan</Label>
                <Input
                  id="goalName"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Rumah Impian"
                  className="border-2 border-black focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="targetAmount">Target Jumlah (IDR)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, targetAmount: e.target.value }))}
                  placeholder="500000000"
                  className="border-2 border-black focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Target Tanggal (Opsional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, deadline: e.target.value }))}
                  className="border-2 border-black focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Input
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi singkat"
                  className="border-2 border-black focus:ring-black focus:border-black"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={editingGoal ? updateGoal : addGoal}
                className="bg-black hover:bg-gray-800 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75"
              >
                {editingGoal ? "Update" : "Simpan"}
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingGoal(null)
                  setNewGoal({ name: "", targetAmount: "", deadline: "", description: "" })
                }}
                variant="outline"
                className="border-2 border-black hover:bg-gray-50"
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const Icon = getGoalIcon(goal.name)
          const currentAmount = totalSavingsBalance
          const progress = calculateProgress(goal.targetAmount)
          const remaining = goal.targetAmount - currentAmount

          return (
            <Card
              key={goal.id}
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-75"
            >
              <CardHeader className="border-b-2 border-black bg-white">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-black" />
                    <span className="text-lg">{goal.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(goal)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-bold">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3 border border-black" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-bold">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Terkumpul:</span>
                      <span className="font-bold text-black">{formatCurrency(currentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sisa:</span>
                      <span className="font-bold text-gray-600">{formatCurrency(Math.max(0, remaining))}</span>
                    </div>
                    {goal.deadline && (
                      <div className="flex justify-between">
                        <span>Target Tanggal:</span>
                        <span className="font-bold">{new Date(goal.deadline).toLocaleDateString("id-ID")}</span>
                      </div>
                    )}
                  </div>

                  {goal.description && <p className="text-sm text-gray-600 italic">{goal.description}</p>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
