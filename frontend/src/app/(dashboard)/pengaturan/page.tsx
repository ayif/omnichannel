import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form";
import { PasswordSettingsForm } from "@/components/dashboard/password-settings-form";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";
import { ThemeSettingsCard } from "@/components/dashboard/theme-settings-card";
import { UserTable } from "@/components/dashboard/user-table";
import { getBusinessSettings, getUsers } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { Role } from "@/lib/types";

export default async function PengaturanPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.role === Role.ADMIN;
  const [business, users] = await Promise.all([
    getBusinessSettings(),
    isAdmin ? getUsers() : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profil Akun</CardTitle>
          <CardDescription>Ubah nama dan email akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm key={`${user.nama}:${user.email}`} user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>Gunakan password baru untuk masuk ke akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordSettingsForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Bisnis</CardTitle>
          <CardDescription>
            {isAdmin ? "Data ini tampil di dokumen export laporan" : "Hanya admin yang bisa mengubah data ini"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessSettingsForm key={business.updatedAt} business={business} editable={isAdmin} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferensi Tampilan</CardTitle>
          <CardDescription>Atur tema tampilan aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSettingsCard />
        </CardContent>
      </Card>

      {isAdmin && users && (
        <Card>
          <CardHeader>
            <CardTitle>Manajemen User</CardTitle>
            <CardDescription>Kelola akun dan role anggota tim</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <UserTable users={users} currentUserId={user.sub} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
