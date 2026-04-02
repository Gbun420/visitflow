import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getAuthenticatedLandingPath } from '@/lib/navigation'
import { PayrollDetailView } from '@/components/payroll-detail-view'

export default async function PayrollRunDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const destination = getAuthenticatedLandingPath(user)
  if (destination !== '/dashboard') {
    redirect(destination)
  }

  if (!user.company) {
    redirect('/setup/company')
  }

  const run = await prisma.payrollRun.findFirst({
    where: { 
      id: params.id,
      companyId: user.company.id
    },
  })

  if (!run) {
    notFound()
  }

  const entries = await prisma.payrollEntry.findMany({
    where: { payrollRunId: run.id },
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { employee: { lastName: 'asc' } }
  })

  // Format dates for the client component if needed (though next.js handles Date objects in RSC -> Client props now)
  return (
    <PayrollDetailView run={run} entries={entries} />
  )
}
