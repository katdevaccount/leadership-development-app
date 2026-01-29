/**
 * Server-only Twilio SMS helper.
 * Used by send-nudge (manual) and weekly-nudges/send (automated).
 */

const TWILIO_MAX_BODY_LENGTH = 1600

function getTwilioConfig(): {
  accountSid: string
  authToken: string
  fromNumber: string
} | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  if (!accountSid || !authToken || !fromNumber) {
    return null
  }
  return { accountSid, authToken, fromNumber }
}

/**
 * Send an SMS via Twilio.
 * @param to - E.164 phone number (e.g. +1234567890)
 * @param body - Message body (max 1600 chars for single segment)
 * @returns { sid } on success, { error } on failure
 */
export async function sendSms(
  to: string,
  body: string
): Promise<{ sid: string } | { error: string }> {
  const trimmedTo = to?.trim()
  if (!trimmedTo) {
    return { error: 'Missing or empty phone number' }
  }
  if (!body || typeof body !== 'string') {
    return { error: 'Missing or invalid message body' }
  }
  if (body.length > TWILIO_MAX_BODY_LENGTH) {
    return { error: `Message body exceeds ${TWILIO_MAX_BODY_LENGTH} characters` }
  }

  const config = getTwilioConfig()
  if (!config) {
    console.error('Twilio not configured: missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER')
    return { error: 'SMS not configured' }
  }

  try {
    const { Twilio } = await import('twilio')
    const client = new Twilio(config.accountSid, config.authToken)
    const message = await client.messages.create({
      body,
      from: config.fromNumber,
      to: trimmedTo,
    })
    if (message.sid) {
      return { sid: message.sid }
    }
    return { error: 'Twilio returned no message SID' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Twilio error'
    console.error('Twilio sendSms error:', message)
    return { error: message }
  }
}
