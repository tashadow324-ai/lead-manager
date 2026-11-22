export const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
export const SOURCES = ['Website', 'Referral', 'Social Media', 'LinkedIn', 'Cold Call', 'Other'];

export function validateLead(input = {}) {
  const errors = {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  const status = typeof input.status === 'string' ? input.status : 'New';
  const source = typeof input.source === 'string' ? input.source : 'Other';
  if (!name) errors.name = 'Name is required.';
  if (!email) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!STATUSES.includes(status)) errors.status = 'Choose a valid lead status.';
  if (!SOURCES.includes(source)) errors.source = 'Choose a valid lead source.';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const company = typeof input.company === 'string' ? input.company.trim() : '';
  if (phone.length > 30) errors.phone = 'Phone must be 30 characters or fewer.';
  if (company.length > 100) errors.company = 'Company must be 100 characters or fewer.';
  return { errors, value: { name, email, phone, company, source, status } };
}
