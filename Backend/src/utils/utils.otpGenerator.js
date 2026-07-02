export function otpGenerator() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Verification Code</title>
  <style>
    /* Reset and utility styles for maximum client compatibility */
    body, table, td, a { text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body>

  <!-- Wrapper Table (Handles background color) -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f5f7; padding: 40px 0;">
    <tr>
      <td align="center" valign="top">
        
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header Area (Logo placeholder) -->
          <tr>
            <td align="center" valign="top" style="padding: 32px 32px 0 32px;">
              <!-- Echo brand logo -->
              <div style="font-size: 28px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Echo</div>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td align="left" valign="top" style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 28px;">Verify your identity</h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; font-weight: 400; color: #475569; line-height: 24px;">
                Please use the following verification code to complete your request. This code will expire in <strong>5 minutes</strong>.
              </p>

              <!-- OTP Code Block -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td align="center" valign="middle" style="padding: 20px; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #2563eb;">
                    ${otp}
                  </td>
                </tr>
              </table>

              <!-- Safety Warning Notes -->
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 500; color: #0f172a;">
                Didn't request this?
              </p>
              <p style="margin: 0; font-size: 13px; font-weight: 400; color: #64748b; line-height: 20px;">
                If you did not make this request, you can safely ignore this email or contact support if you suspect unauthorized access to your account. Do not share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td align="center" valign="top" style="padding: 0 32px 32px 32px; border-top: 1px solid #f1f5f9;">
              <p style="margin: 24px 0 4px 0; font-size: 12px; font-weight: 400; color: #94a3b8;">
                &copy; 2026 Echo Inc. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; font-weight: 400; color: #94a3b8;">
                123 Tech Street, Suite 400, San Francisco, CA 94107
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}