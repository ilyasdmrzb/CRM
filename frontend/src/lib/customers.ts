import { api } from './api';

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
  responsibleUserId?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiCustomer = {
  id: string;
  companyName: string;
  cariCode: string | null;
  taxNumber: string | null;
  city: string | null;
  sector: string | null;
  address: string | null;
  createdByName: string;
  responsibleUserId: string | null;
  createdAt: string;
  updatedAt: string;
  contactCount: number;
  dealCount: number;
  primaryContactName: string | null;
  primaryContactTitle: string | null;
  primaryContactEmail: string | null;
  primaryContactPhone: string | null;
};

const normalizeOptional = (value: FormDataEntryValue | null) => {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : null;
};

const mapApiCustomer = (customer: ApiCustomer): CustomerListItem => ({
  id: customer.id,
  name: customer.companyName,
  code: customer.cariCode,
  tax: customer.taxNumber,
  industry: customer.sector,
  contactName: customer.primaryContactName,
  contactTitle: customer.primaryContactTitle,
  email: customer.primaryContactEmail,
  phone: customer.primaryContactPhone,
  city: customer.city,
  district: null,
  website: null,
  address: customer.address,
  notes: null,
  contacts: customer.contactCount,
  deals: customer.dealCount,
  owner: customer.createdByName || 'Sistem Yöneticisi',
  responsibleUserId: customer.responsibleUserId || undefined,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
});

export async function getCustomersFromDb() {
  const response = await api.get('/Customers');
  if (!response.ok) throw new Error('Müşteriler veritabanından alınamadı.');

  const customers = await response.json() as ApiCustomer[];
  return customers.map(mapApiCustomer);
}

export async function getCustomerByIdFromDb(id: string) {
  const response = await api.get(`/Customers/${id}`);
  if (!response.ok) return null;

  return mapApiCustomer(await response.json() as ApiCustomer);
}

export async function addCustomerToDb(formData: FormData) {
  const response = await api.post('/Customers', {
    companyName: String(formData.get('companyName') ?? '').trim(),
    cariCode: normalizeOptional(formData.get('customerCode')),
    taxNumber: normalizeOptional(formData.get('taxNumber')),
    city: normalizeOptional(formData.get('city')),
    sector: normalizeOptional(formData.get('industry')),
    address: normalizeOptional(formData.get('address')),
    responsibleUserId: normalizeOptional(formData.get('responsibleUserId')),
    contactName: normalizeOptional(formData.get('contactName')),
    contactTitle: normalizeOptional(formData.get('contactTitle')),
    email: normalizeOptional(formData.get('email')),
    phone: normalizeOptional(formData.get('phone')),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? 'Müşteri veritabanına kaydedilemedi.');
  }

  return mapApiCustomer(await response.json() as ApiCustomer);
}

export async function updateCustomerInDb(id: string, formData: FormData) {
  const response = await api.put(`/Customers/${id}`, {
    companyName: String(formData.get('companyName') ?? '').trim(),
    cariCode: normalizeOptional(formData.get('customerCode')),
    taxNumber: normalizeOptional(formData.get('taxNumber')),
    city: normalizeOptional(formData.get('city')),
    sector: normalizeOptional(formData.get('industry')),
    address: normalizeOptional(formData.get('address')),
    responsibleUserId: normalizeOptional(formData.get('responsibleUserId')),
    contactName: normalizeOptional(formData.get('contactName')),
    contactTitle: normalizeOptional(formData.get('contactTitle')),
    email: normalizeOptional(formData.get('email')),
    phone: normalizeOptional(formData.get('phone')),
  });

  if (!response.ok) return null;
  return mapApiCustomer(await response.json() as ApiCustomer);
}

export async function deleteCustomerFromDb(id: string) {
  const response = await api.delete(`/Customers/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? 'Müşteri silinemedi.');
  }
  return true;
}

