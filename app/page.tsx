import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default function HomePage() {
  const session = cookies().get('session')?.value
  
  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
