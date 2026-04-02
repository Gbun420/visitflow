import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { CompanySetupForm } from '@/components/company-setup-form'

export default async function CompanySetupPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.company) {
    redirect('/dashboard')
  }

  return <CompanySetupForm />
}
