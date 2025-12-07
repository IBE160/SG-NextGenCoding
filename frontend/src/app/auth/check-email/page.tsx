import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            A confirmation link has been sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Please check your inbox and click the verification link to complete
            your registration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
