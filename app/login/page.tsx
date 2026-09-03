"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClinic } from "@/lib/clinic-context";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useClinic();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.replace("/anamnesis");
      } else {
        setError("Email-i ose fjalëkalimi nuk është i saktë.");
      }
    } catch {
      setError("Ndodhi një gabim i papritur gjatë hyrjes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Mirë se u kthyet"
      subtitle="Hyni në hapësirën tuaj të Klinikës së Ortopedisë"
    >
      <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ortopedia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Fjalëkalimi</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Duke hyrë..." : "Hyr"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Nuk keni llogari?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Regjistrohu
            </Link>
          </p>
        </form>
    </AuthShell>
  );
}
