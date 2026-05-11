export type CustomerListItem = {
  id: string;
  name: string;
  code: string | null;
  tax: string | null;
  industry: string | null;
  contactName: string | null;
  contactTitle: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  district: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  contacts: number;
  deals: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'solar-crm-customers';
const DEMO_CUSTOMER_NAMES = new Set(['ornek firma', 'abc solar energy', 'jinko']);

const normalizeOptional = (value: FormDataEntryValue | null) => {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : null;
};

const numberFromForm = (value: FormDataEntryValue | null) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeCustomer = (customer: Partial<CustomerListItem>): CustomerListItem => {
  const now = new Date().toISOString();

  return {
    id: customer.id ?? createId(),
    name: customer.name ?? '',
    code: customer.code ?? null,
    tax: customer.tax ?? null,
    industry: customer.industry ?? null,
    contactName: customer.contactName ?? null,
    contactTitle: customer.contactTitle ?? null,
    email: customer.email ?? null,
    phone: customer.phone ?? null,
    city: customer.city ?? null,
    district: customer.district ?? null,
    website: customer.website ?? null,
    address: customer.address ?? null,
    notes: customer.notes ?? null,
    contacts: customer.contacts ?? (customer.contactName ? 1 : 0),
    deals: customer.deals ?? 0,
    owner: customer.owner ?? 'Gamze K.',
    createdAt: customer.createdAt ?? now,
    updatedAt: customer.updatedAt ?? customer.createdAt ?? now,
  };
};

const isDemoCustomer = (customer: CustomerListItem) => {
  const name = customer.name.trim().toLocaleLowerCase('tr-TR').replace('ö', 'o');
  return DEMO_CUSTOMER_NAMES.has(name);
};

const readStoredCustomers = () => {
  if (typeof window === 'undefined') return [];

  const rawCustomers = window.localStorage.getItem(STORAGE_KEY);
  if (!rawCustomers) return [];

  try {
    const customers = JSON.parse(rawCustomers) as Partial<CustomerListItem>[];
    const normalizedCustomers = customers.map(normalizeCustomer);
    const realCustomers = normalizedCustomers.filter((customer) => !isDemoCustomer(customer));
    if (realCustomers.length !== normalizedCustomers.length) saveCustomers(realCustomers);
    return realCustomers;
  } catch {
    return [];
  }
};

const saveCustomers = (customers: CustomerListItem[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};

export function getCustomers() {
  return readStoredCustomers().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getCustomerById(id: string) {
  return getCustomers().find((customer) => customer.id === id) ?? null;
}

export function addCustomer(formData: FormData) {
  const now = new Date().toISOString();
  const contactName = normalizeOptional(formData.get('contactName'));
  const customer: CustomerListItem = {
    id: createId(),
    name: String(formData.get('companyName') ?? '').trim(),
    code: normalizeOptional(formData.get('customerCode')),
    tax: normalizeOptional(formData.get('taxNumber')),
    industry: normalizeOptional(formData.get('industry')),
    contactName,
    contactTitle: normalizeOptional(formData.get('contactTitle')),
    email: normalizeOptional(formData.get('email')),
    phone: normalizeOptional(formData.get('phone')),
    city: normalizeOptional(formData.get('city')),
    district: normalizeOptional(formData.get('district')),
    website: normalizeOptional(formData.get('website')),
    address: normalizeOptional(formData.get('address')),
    notes: normalizeOptional(formData.get('notes')),
    contacts: contactName ? 1 : 0,
    deals: 0,
    owner: String(formData.get('owner') ?? 'Gamze K.'),
    createdAt: now,
    updatedAt: now,
  };

  const customers = [customer, ...getCustomers()];
  saveCustomers(customers);
  return customer;
}

export function updateCustomer(id: string, formData: FormData) {
  const customers = getCustomers();
  const currentCustomer = customers.find((customer) => customer.id === id);
  if (!currentCustomer) return null;

  const contactName = normalizeOptional(formData.get('contactName'));
  const updatedCustomer: CustomerListItem = {
    ...currentCustomer,
    name: String(formData.get('companyName') ?? '').trim(),
    code: normalizeOptional(formData.get('customerCode')),
    tax: normalizeOptional(formData.get('taxNumber')),
    industry: normalizeOptional(formData.get('industry')),
    contactName,
    contactTitle: normalizeOptional(formData.get('contactTitle')),
    email: normalizeOptional(formData.get('email')),
    phone: normalizeOptional(formData.get('phone')),
    city: normalizeOptional(formData.get('city')),
    district: normalizeOptional(formData.get('district')),
    website: normalizeOptional(formData.get('website')),
    address: normalizeOptional(formData.get('address')),
    notes: normalizeOptional(formData.get('notes')),
    contacts: contactName ? Math.max(currentCustomer.contacts, 1) : 0,
    deals: numberFromForm(formData.get('deals')),
    owner: String(formData.get('owner') ?? currentCustomer.owner),
    updatedAt: new Date().toISOString(),
  };

  saveCustomers(customers.map((customer) => customer.id === id ? updatedCustomer : customer));
  return updatedCustomer;
}
