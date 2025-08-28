"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Save, User, Mail, Phone, MapPin, Calendar } from "lucide-react"
import type { UserProfile } from "@/types"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    name: "Megumi",
    email: "megumi@example.com",
    avatar: "/professional-avatar.png",
    language: "id",
    theme: "light",
    isLoggedIn: true,
  })

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email || "",
    phone: "",
    location: "",
    birthDate: "",
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setProfile({
      ...profile,
      name: formData.name,
      email: formData.email,
    })
    setIsEditing(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile({
          ...profile,
          avatar: e.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground font-manrope mb-2">Profil Saya</h1>
          <p className="text-muted-foreground">Kelola informasi profil dan preferensi akun Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="neobrutalism-card lg:col-span-1">
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="w-24 h-24 border-2 border-black">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full border-2 border-black cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <CardTitle className="text-xl font-bold font-manrope">{profile.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Member sejak 2024</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>Email terverifikasi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="neobrutalism-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold font-manrope">Informasi Profil</CardTitle>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="neobrutalism-button bg-transparent"
                >
                  {isEditing ? "Batal" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nama Lengkap
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="neobrutalism-input"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="neobrutalism-input"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Nomor Telepon
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="neobrutalism-input"
                    placeholder="Belum diisi"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Lokasi
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="neobrutalism-input"
                    placeholder="Belum diisi"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="birthDate" className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tanggal Lahir
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="neobrutalism-input"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleSave}
                    className="neobrutalism-button bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="neobrutalism-button bg-transparent"
                  >
                    Batal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card className="neobrutalism-card mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold font-manrope">Pengaturan Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Bahasa</Label>
                <Select
                  value={profile.language}
                  onValueChange={(value: "id" | "en") => setProfile({ ...profile, language: value })}
                >
                  <SelectTrigger className="neobrutalism-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tema</Label>
                <Select
                  value={profile.theme}
                  onValueChange={(value: "light" | "dark" | "pink" | "blue" | "green") =>
                    setProfile({ ...profile, theme: value })
                  }
                >
                  <SelectTrigger className="neobrutalism-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="pink">Pink Theme</SelectItem>
                    <SelectItem value="blue">Blue Theme</SelectItem>
                    <SelectItem value="green">Green Theme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t-2 border-black">
              <h3 className="text-lg font-bold font-manrope mb-4">Zona Bahaya</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="neobrutalism-button bg-transparent text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Ubah Password
                </Button>
                <Button
                  variant="outline"
                  className="neobrutalism-button bg-transparent text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Hapus Akun
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
