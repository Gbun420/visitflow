export default function EmergencyAccessPage() {
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-red-600">Emergency Access</h1>

      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
        <p className="font-semibold mb-2">Break-glass access is not enabled in this deployment.</p>
        <p className="text-sm text-red-800">
          Use the normal account security flow instead. If you need to recover access, use the password reset flow or contact an administrator.
        </p>
      </div>
    </div>
  )
}
