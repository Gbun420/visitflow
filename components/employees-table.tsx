'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRouter } from 'next/navigation'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  employmentType: string
  salaryGross: any
}

export function EmployeesTable({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [employees, setEmployees] = useState(initialEmployees)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return
    
    try {
      const res = await fetch('/api/dashboard/employees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      
      if (res.ok) {
        setEmployees(employees.filter(e => e.id !== id))
        router.refresh()
      } else {
        alert('Failed to delete employee')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting employee')
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Employment</TableHead>
          <TableHead>Gross Salary</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.id}>
            <TableCell>{emp.firstName} {emp.lastName}</TableCell>
            <TableCell>{emp.email}</TableCell>
            <TableCell>{emp.employmentType}</TableCell>
            <TableCell>€{Number(emp.salaryGross).toLocaleString()}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => handleDelete(emp.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
