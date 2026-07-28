export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate prose-lg">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, including your name, email address, phone number, resume, and professional history when you register as a Job Seeker or Employer on SkillLink SL.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to operate, maintain, and provide the features and functionality of the Service. For Job Seekers, this means sharing your profile and application details with Employers to whom you apply.
        </p>

        <h2>3. Data Security</h2>
        <p>
          We implement commercially reasonable technical, administrative, and organizational measures to protect your personal information both online and offline from loss, misuse, and unauthorized access.
        </p>

        <h2>4. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@skilllink.sl.
        </p>
      </div>
    </div>
  )
}
