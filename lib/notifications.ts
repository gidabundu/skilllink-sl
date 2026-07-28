// Mock notification system (replace with Nodemailer/Twilio in production)

export interface NotificationPayload {
  to: string
  name: string
  subject: string
  message: string
  type?: 'email' | 'sms'
}

export async function sendNotification(payload: NotificationPayload) {
  // In production, send real email/SMS here
  // For prototype: log to console
  console.log(`
  ========================================
  📧 MOCK NOTIFICATION [${payload.type?.toUpperCase() || 'EMAIL'}]
  ========================================
  To:      ${payload.name} <${payload.to}>
  Subject: ${payload.subject}
  Message: ${payload.message}
  ========================================
  `)
  return { success: true, mocked: true }
}

export async function sendWelcomeEmail(name: string, email: string, role: string) {
  return sendNotification({
    to: email,
    name,
    subject: 'Welcome to SkillLink SL!',
    message: `Hi ${name}, welcome to SkillLink SL — Sierra Leone's #1 job platform. Your ${role.toLowerCase()} account is ready.`,
  })
}

export async function sendApplicationEmail(seekerName: string, seekerEmail: string, jobTitle: string, companyName: string) {
  return sendNotification({
    to: seekerEmail,
    name: seekerName,
    subject: `Application Received – ${jobTitle}`,
    message: `Hi ${seekerName}, your application for "${jobTitle}" at ${companyName} has been received. We'll keep you updated on your status.`,
  })
}

export async function sendStatusUpdateEmail(seekerName: string, seekerEmail: string, jobTitle: string, status: string) {
  const statusMessages: Record<string, string> = {
    SHORTLISTED: 'Great news! You have been shortlisted.',
    INTERVIEW: 'Congratulations! You have been invited for an interview.',
    HIRED: '🎉 Congratulations! You have been hired!',
    REJECTED: 'Thank you for applying. Unfortunately, you were not selected this time.',
  }
  return sendNotification({
    to: seekerEmail,
    name: seekerName,
    subject: `Application Update – ${jobTitle}`,
    message: `Hi ${seekerName}, ${statusMessages[status] || 'Your application status has been updated.'} Job: "${jobTitle}".`,
  })
}

export async function sendEmployerVerificationEmail(name: string, email: string, approved: boolean) {
  return sendNotification({
    to: email,
    name,
    subject: approved ? 'Account Verified – SkillLink SL' : 'Account Verification Update',
    message: approved
      ? `Hi ${name}, your employer account has been verified! You can now post jobs on SkillLink SL.`
      : `Hi ${name}, your employer account verification requires additional review. Please contact support.`,
  })
}
