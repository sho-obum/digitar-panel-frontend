export const inviteMemberEmail = async (
  email: string,
  full_name: string,
  role: string,
  verification_link: string,
  password: string
) => {
  const subject = `You're invited to join the team – Verify your account`;

  const bodyHtml = `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:30px 0; font-family:Arial, Helvetica, sans-serif;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
        
        <!-- Header -->
        <tr>
          <td style="padding:24px 32px; background-color:#111827; color:#ffffff;">
            <h2 style="margin:0; font-size:20px;">Digitar Media</h2>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px; color:#111827; font-size:14px; line-height:1.6;">
            <p>Hi <strong>${full_name}</strong>,</p>

            <p>
              You’ve been added to <strong>Digitar Media</strong> as <strong>${role}</strong> member.
            </p>

            <p>
              Your temporary login credentials are:
            </p>

            <p style="background:#f3f4f6; padding:12px; border-radius:6px;">
              <strong>Email:</strong> ${email}<br />
              <strong>Password:</strong> ${password}
            </p>

            <p>
              To activate your account, please verify your email address by clicking the button below:
            </p>

            <!-- Button -->
            <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr>
                <td align="center">
                  <a
                    href="${verification_link}"
                    style="
                      display:inline-block;
                      padding:12px 24px;
                      background-color:#2563eb;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:6px;
                      font-weight:600;
                    "
                  >
                    Follow the link below to login
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px; color:#374151;">
              This link is valid for <strong>24 hours</strong>.<br />
              For security reasons, please change your password after logging in.
            </p>

            <p>
              If you did not expect this invitation, you can safely ignore this email.
            </p>

            <p style="margin-top:32px;">
              Welcome aboard! 🎉<br />
              —<br />
              <strong>Digitar Media Team</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px; background-color:#f9fafb; text-align:center; font-size:12px; color:#6b7280;">
            © ${new Date().getFullYear()} Digitar Media. All rights reserved.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;

  const apikey = process.env.NEXT_PUBLIC_ELASTIC_EMAIL_API_KEY;
  const payload: any = {
    from: "saas@digitarmedia.com",
    fromName: "Digitar Media",
    to: email,
    subject,
    bodyHtml,
    isTransactional: "true",
    charset: "utf-8",
    encodingType: "4",
    apikey,
  };

  const response = await fetch("https://api.elasticemail.com/v2/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(payload).toString(),
  });

  const result = await response.json();
  return result;
};
