export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate prose-lg">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using SkillLink SL, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2>2. Use of the Platform</h2>
        <p>
          You agree to use the platform only for lawful purposes. Employers must only post legitimate job opportunities, and Job Seekers must provide accurate information regarding their qualifications and experience.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We reserve the right to suspend or terminate accounts that violate our policies.
        </p>

        <h2>4. Modifications to Service</h2>
        <p>
          We reserve the right at any time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
        </p>
      </div>
    </div>
  )
}
