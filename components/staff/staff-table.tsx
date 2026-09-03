"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { ROLE_LABELS, type StaffUser } from "@/lib/staff";

interface StaffTableProps {
  users: StaffUser[];
  currentUserId: number | null;
  loading: boolean;
  onEdit: (user: StaffUser) => void;
  onDelete: (user: StaffUser) => void;
}

export function StaffTable({
  users,
  currentUserId,
  loading,
  onEdit,
  onDelete,
}: StaffTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Llogaritë ekzistuese të stafit</CardTitle>
        <CardDescription>
          Modifikoni të dhënat e hyrjes, rregulloni lejet me kutiza ose fshini
          përdoruesin nga fundi i rreshtit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Duke ngarkuar përdoruesit...</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anëtari i stafit</TableHead>
                  <TableHead>Hyrja</TableHead>
                  <TableHead>Lejet</TableHead>
                  <TableHead>Statusi</TableHead>
                  <TableHead className="w-[180px] text-right">
                    Veprimet
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {user.name || "Profil stafi i palidhur"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.specialty || "Pa specializim"}{" "}
                          {user.doctor_id ? `• ${user.doctor_id}` : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          USR-{user.id.toString().padStart(4, "0")}
                          {user.id === currentUserId ? " • Ju" : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                          <Badge key={`${user.id}-${role}`} variant="secondary">
                            {ROLE_LABELS[role]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-success/20 bg-success/5 text-success"
                      >
                        Aktiv
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(user)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Ndrysho
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(user)}
                          disabled={user.id === currentUserId}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Fshi
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nuk u gjet asnjë llogari stafi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
