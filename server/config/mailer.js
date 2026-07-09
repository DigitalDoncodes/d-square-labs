// Brevo (Sendinblue) transactional email via HTTP API — no SDK needed.
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const enabled = () => Boolean(process.env.BREVO_API_KEY && process.env.MAIL_FROM);

const send = async ({ to, subject, html }) => {
  if (!enabled()) {
    console.warn('Mailer disabled: BREVO_API_KEY or MAIL_FROM not set');
    return;
  }
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'D² Labs', email: process.env.MAIL_FROM },
      to,
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo ${res.status}: ${body}`);
  }
};

const wrap = (heading, body) => `
  <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px">
    <p style="font-size:22px;font-weight:800;margin:0 0 4px">
      <span style="color:#4f46e5">D²</span> <span style="color:#6366f1">Labs</span>
    </p>
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin:0 0 20px">
      Technology · Psychology · Impact
    </p>
    <h2 style="font-size:18px;margin:0 0 12px">${heading}</h2>
    <div style="font-size:14px;line-height:1.6;color:#374151">${body}</div>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px">
      You're receiving this because you have an account on D² Labs.
    </p>
  </div>`;

exports.sendWelcomeEmail = (user) =>
  send({
    to: [{ email: user.email, name: user.name }],
    subject: 'Welcome to D² Labs 🎓',
    html: wrap(
      `Welcome aboard, ${user.name}!`,
      `<p>Your account is ready. Here's what you can do right away:</p>
       <ul>
         <li><strong>Notes</strong> — share and read study notes by subject</li>
         <li><strong>Photos</strong> — relive batch memories in shared albums</li>
         <li><strong>Planner</strong> — track deadlines, case studies and exams</li>
         <li><strong>Finance</strong> — private expense tracker and calculators</li>
         <li><strong>Resume</strong> — build an ATS-friendly resume and export PDF</li>
       </ul>
       <p>See you inside! 🚀</p>`
    ),
  });

exports.sendAnnouncementEmail = (recipients, announcement) =>
  send({
    to: recipients.map((u) => ({ email: u.email, name: u.name })),
    subject: `📢 ${announcement.title}`,
    html: wrap(announcement.title, `<p>${announcement.body.replace(/\n/g, '<br/>')}</p>`),
  });
