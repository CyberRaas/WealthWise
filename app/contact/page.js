export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Contact Support</h1>
        <p className="text-slate-600 mb-6">
          If you&apos;re experiencing issues with Google sign-in, please check the following:
        </p>

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Browser Extensions</h3>
            <p className="text-sm text-blue-700">
              Disable ad blockers and privacy extensions (uBlock Origin, Privacy Badger, etc.)
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-900 mb-2">Try Incognito Mode</h3>
            <p className="text-sm text-green-700">
              Open an incognito/private window and try signing in again
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Different Browser</h3>
            <p className="text-sm text-purple-700">
              Try using a different browser (Chrome, Firefox, Safari, Edge)
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-slate-800 mb-2">Still need help?</h3>
          <p className="text-slate-600 text-sm">
            Email us at: <a href="mailto:support@mywealthwise.tech" className="text-emerald-600 hover:underline font-semibold">support@mywealthwise.tech</a>
          </p>
        </div>
      </div>
    </div>
  )
}
