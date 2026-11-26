/**
 * Server-side checks for the public contact forms.
 * Required fields match frontend/contact.html, frontend/en/contact.html,
 * frontend/cn/contact.html, and the travel concierge payload in
 * frontend/assets/js/travel.js (inquiry_type, name, company, email, message).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_FIELDS = [
  ['inquiry_type', 'Inquiry type is required.'],
  ['name', 'Name is required.'],
  ['company', 'Company is required.'],
  ['email', 'Email is required.'],
  ['message', 'Message is required.']
];

function asTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateContactPayload(body) {
  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    return {
      ok: false,
      error: 'Request body must be a JSON object with the contact form fields.',
      fields: { body: 'A JSON object is required.' }
    };
  }

  const fields = {};
  for (const [key, message] of REQUIRED_FIELDS) {
    if (!asTrimmedString(body[key])) fields[key] = message;
  }

  if (!fields.email && !EMAIL_RE.test(asTrimmedString(body.email))) {
    fields.email = 'Email must be a valid email address.';
  }

  if (Object.keys(fields).length > 0) {
    const missing = Object.keys(fields);
    return {
      ok: false,
      error: `Validation failed. Check: ${missing.join(', ')}.`,
      fields
    };
  }

  return {
    ok: true,
    value: {
      id: body.id,
      date: body.date,
      inquiry_type: asTrimmedString(body.inquiry_type),
      name: asTrimmedString(body.name),
      company: asTrimmedString(body.company),
      email: asTrimmedString(body.email),
      phone: asTrimmedString(body.phone),
      budget: asTrimmedString(body.budget),
      referral_source: asTrimmedString(body.referral_source),
      message: asTrimmedString(body.message),
      status: asTrimmedString(body.status),
      travel: body.travel
    }
  };
}

module.exports = { validateContactPayload };
