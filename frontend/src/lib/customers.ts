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

export const defaultCustomers: CustomerListItem[] = [
  {
    id: '1',
    name: 'ABC Solar Energy',
    code: 'CARI-001',
    tax: '1234567890',
    industry: 'Güneş Enerjisi',
    contactName: 'Ayşe Yılmaz',
    contactTitle: 'Satın Alma Müdürü',
    email: 'info@abcsolar.com',
    phone: '+90 212 555 0101',
    city: 'İstanbul',
    district: 'Kadıköy',
    website: 'www.abcsolar.com',
    address: 'İstanbul, Türkiye',
    notes: 'Faz 2 genişleme görüşmeleri devam ediyor.',
    contacts: 4,
    deals: 2,
    owner: 'Gamze K.',
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Z-Tech Industrial',
    code: 'CARI-002',
    tax: '9876543210',
    industry: 'Üretim',
    contactName: 'John Doe',
    contactTitle: 'Operasyon Müdürü',
    email: 'john@ztech.com',
    phone: '+90 312 555 0102',
    city: 'Ankara',
    district: null,
    website: 'www.ztech.com',
    address: null,
    notes: null,
    contacts: 2,
    deals: 5,
    owner: 'John Doe',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Green Power Systems',
    code: 'CARI-003',
    tax: '5554443332',
    industry: 'Güneş Enerjisi',
    contactName: 'Sarah Connor',
    contactTitle: 'Genel Müdür',
    email: 'sarah@greenpower.com',
    phone: '+90 232 555 0103',
    city: 'İzmir',
    district: null,
    website: null,
    address: null,
    notes: null,
    contacts: 8,
    deals: 1,
    owner: 'Sarah C.',
    createdAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-01-08T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Blue Sky Energy',
    code: 'CARI-004',
    tax: '1112223334',
    industry: 'Enerji',
    contactName: 'Michael Scott',
    contactTitle: null,
    email: 'info@bluesky.com',
    phone: '+90 224 555 0104',
    city: 'Bursa',
    district: null,
    website: null,
    address: null,
    notes: null,
    contacts: 1,
    deals: 0,
    owner: 'Michael S.',
    createdAt: '2024-01-06T00:00:00.000Z',
    updatedAt: '2024-01-06T00:00:00.000Z',
  },
  {
    id: '5',
    name: 'Eco-Friendly Solutions',
    code: 'CARI-005',
    tax: '9998887776',
    industry: 'Teknoloji',
    contactName: 'Gamze Kılınç',
    contactTitle: 'Satış Yetkilisi',
    email: 'hello@eco-friendly.com',
    phone: '+90 242 555 0105',
    city: 'Antalya',
    district: null,
    website: null,
    address: null,
    notes: null,
    contacts: 3,
    deals: 3,
    owner: 'Gamze K.',
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z',
  },
];

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

const readStoredCustomers = () => {
  if (typeof window === 'undefined') return defaultCustomers;

  const rawCustomers = window.localStorage.getItem(STORAGE_KEY);
  if (!rawCustomers) return defaultCustomers;

  try {
    const customers = JSON.parse(rawCustomers) as Partial<CustomerListItem>[];
    return customers.map(normalizeCustomer);
  } catch {
    return defaultCustomers;
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
