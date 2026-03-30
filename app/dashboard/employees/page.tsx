'use client'

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  employmentType: string
  salaryGross: number
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [companyId, setCompanyId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/me')
      .then(r => r.json())
      .then(data => {
        setCompanyId(data.companyId)
        return fetch('/api/dashboard/employees')
      })
      .then(r => r.json())
      .then(setEmployees)
      .catch(console.error)
  }, [])

  const deleteEmployee = async (id: string) => {
    if (!confirm('Delete this employee?')) return
    fetch('/api/dashboard/employees', { method: 'DELETE', body: JSON.stringify({ id }) })
      .then(r => r.json())
      .then(() => setEmployees(employees.filter(e => e.id !== id)))
  }

  if (!companyId) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your employee roster</p>
        </div>
        <Link href="/dashboard/employees/new">
          <Button>Add Employee</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Employees ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No employees yet. Add your first employee to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Gross (annual)</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.employmentType}</TableCell>
                    <TableCell className="text-right">€{Number(emp.salaryGross).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => deleteEmployee(emp.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
