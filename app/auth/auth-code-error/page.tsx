import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Authentication error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            We could not complete the login or signup redirect. The link may have expired, been opened in a different browser, or the callback data may no longer be valid.
          </p>
          <div className="grid gap-2">
            <Button asChild className="w-full py-6 font-semibold">
              <Link href="/login">Back to login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full py-6 font-semibold">
              <Link href="/signup">Try signing up again</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
