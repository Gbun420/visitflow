import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmployeesTable } from '@/components/employees-table'
import Link from 'next/link'

export default async function EmployeesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const company = user.company

  if (!company) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Company Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You need to create a company first.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const employees = await prisma.employee.findMany({ 
    where: { companyId: company.id },
    orderBy: { lastName: 'asc' }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage your workforce for {company.name}</p>
        </div>
        <Link href="/dashboard/employees/new"><Button>Add Employee</Button></Link>
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No employees yet. Click &quot;Add Employee&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <EmployeesTable initialEmployees={employees} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
