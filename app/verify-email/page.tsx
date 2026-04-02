import VerifyEmailClient from './verify-email-client'

type VerifyEmailPageProps = {
  searchParams?: {
    email?: string | string[]
  }
}

export default function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const email =
    typeof searchParams?.email === 'string' ? searchParams.email : ''

  return <VerifyEmailClient initialEmail={email} />
}
