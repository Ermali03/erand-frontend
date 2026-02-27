"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClinic } from "@/lib/clinic-context"
import { AlertCircle, Shield, Crown, Eye, User, Stethoscope } from "lucide-react"
import type { DoctorRole } from "@/lib/types"

const roleConfig: Record<DoctorRole, { icon: typeof Crown; color: string; description: string }> = {
  Admin: {
    icon: Crown,
    color: "bg-primary text-primary-foreground",
    description: "Full access to all features",
  },
  "Main Surgeon": {
    icon: Shield,
    color: "bg-info text-info-foreground",
    description: "Surgery controls and full patient access",
  },
  Doctor: {
    icon: Stethoscope,
    color: "bg-success text-success-foreground",
    description: "Anamnesis and epicrisis access",
  },
  Nurse: {
    icon: Eye,
    color: "bg-muted text-muted-foreground",
    description: "View-only access",
  },
}

const permissionMatrix = [
  { feature: "View Patient Data", Admin: true, "Main Surgeon": true, Doctor: true, Nurse: true },
  { feature: "Edit Anamnesis", Admin: true, "Main Surgeon": true, Doctor: true, Nurse: false },
  { feature: "Edit Epicrisis", Admin: true, "Main Surgeon": true, Doctor: true, Nurse: false },
  { feature: "Access Surgery Page", Admin: true, "Main Surgeon": true, Doctor: false, Nurse: false },
  { feature: "Edit Surgery Records", Admin: true, "Main Surgeon": true, Doctor: false, Nurse: false },
  { feature: "Discharge Patient", Admin: true, "Main Surgeon": true, Doctor: true, Nurse: false },
  { feature: "Manage Doctors", Admin: true, "Main Surgeon": false, Doctor: false, Nurse: false },
]

export default function DoctorsPage() {
  const router = useRouter()
  const { doctors, currentDoctor, hasPermission } = useClinic()

  if (!hasPermission("manage-doctors")) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only administrators can access the doctor management page. Current role: {currentDoctor.role}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Doctor Management</h1>
        <p className="text-muted-foreground">View and manage clinic staff (UI demo only)</p>
      </div>

      {/* Current User */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current User</CardTitle>
          <CardDescription>Currently logged in as</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{currentDoctor.name}</p>
              <div className="flex items-center gap-2">
                <Badge className={roleConfig[currentDoctor.role].color}>{currentDoctor.role}</Badge>
                <span className="text-sm text-muted-foreground">{currentDoctor.specialty}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Staff Directory</CardTitle>
          <CardDescription>All registered doctors and staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => {
                  const config = roleConfig[doctor.role]
                  const Icon = config.icon

                  return (
                    <TableRow key={doctor.id} className={doctor.id === currentDoctor.id ? "bg-muted/50" : ""}>
                      <TableCell className="font-mono text-sm">{doctor.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doctor.name}</span>
                          {doctor.id === currentDoctor.id && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{doctor.specialty}</TableCell>
                      <TableCell>
                        <Badge className={config.color}>{doctor.role}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Permissions</CardTitle>
          <CardDescription>Feature access by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Main Surgeon</TableHead>
                  <TableHead className="text-center">Doctor</TableHead>
                  <TableHead className="text-center">Nurse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissionMatrix.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-medium">{row.feature}</TableCell>
                    <TableCell className="text-center">
                      {row.Admin ? (
                        <span className="text-success">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row["Main Surgeon"] ? (
                        <span className="text-success">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.Doctor ? (
                        <span className="text-success">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.Nurse ? (
                        <span className="text-success">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.entries(roleConfig) as [DoctorRole, (typeof roleConfig)[DoctorRole]][]).map(([role, config]) => {
          const Icon = config.icon
          return (
            <Card key={role}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{role}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
