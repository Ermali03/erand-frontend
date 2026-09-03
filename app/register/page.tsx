"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Fjalëkalimet nuk përputhen.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: { email, password },
      });
      router.push("/login");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Ndodhi një gabim i papritur gjatë regjistrimit.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Krijo llogari"
      subtitle="Regjistrohu si përdorues i ri (Roli fillestar: Infermier/e)"
    >
      <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nurse@ortopedia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Fjalëkalimi</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmo fjalëkalimin</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Duke u regjistruar..." : "Regjistrohu"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Keni tashmë llogari?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Hyr
            </Link>
          </p>
        </form>
    </AuthShell>
  );
}
