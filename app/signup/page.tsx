import SignupForm from "@/components/SignupForm"

export default function SignupPage() {
  return (
    <main className="app-shell min-h-screen px-4 py-10 text-zinc-100 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center">
        <div className="grid w-full gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <section className="space-y-4">
            <p className="eyebrow">Create account</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Start your study plan
            </h1>
            <p className="max-w-xl text-sm leading-6 text-zinc-400">
              Create an account with email and password. Your progress, reviews, and study
              settings will stay in one place.
            </p>

            <p className="rounded-xl border border-[#d7ff4f]/15 bg-[#d7ff4f]/[0.05] px-4 py-3 text-sm text-zinc-300">
              Start with one track and one problem. You can change your pace later.
            </p>
          </section>

          <SignupForm />
        </div>
      </div>
    </main>
  )
}
