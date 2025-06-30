interface EmailResponse {
  email: string
  provider: string
  state: string
  service: string
  response: string
}

/**
 * Sends an email using the ZeptoMail API.
 * @param emailResponse - Object containing email, provider, state, service, and response.
 * @returns The fetch response or throws an error.
 */
export async function sendEmail(emailResponse: EmailResponse) {
  const url = process.env.ZEPTOMAIL_URL
  if (!url) {
    throw new Error("ZEPTOMAIL_URL environment variable is not set.")
  }

  // Helper to extract username from email
  const getUsernameFromEmail = (email: string) => {
    if (!email) return "User"
    return email.split("@")[0]
  }

  const payload = {
    mail_template_key: process.env.ZEPTOMAIL_TEMPLATE_KEY,
    from: {
      address: process.env.ZEPTOMAIL_FROM_EMAIL,
      name: process.env.ZEPTOMAIL_FROM_NAME,
    },
    to: [
      {
        email_address: {
          address: emailResponse.email,
          name: getUsernameFromEmail(emailResponse.email),
        },
      },
    ],
    merge_info: {
      secret_provider: emailResponse.provider,
      secret_state: emailResponse.state,
      secret_service: emailResponse.service,
      secret_report: emailResponse.response,
    },
    subject: "How2Validate Secret Validation Report",
  }

  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    authorization: `${process.env.ZEPTOMAIL_TOKEN}`,
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText)
    }
    return response
  } catch (e) {
    throw e
  }
}
