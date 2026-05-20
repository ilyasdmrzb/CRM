import { api } from './api';

export type DealStageName = '1 - ilk temas, ilgi belirleme' | '2 - Bütçe & karar yetki doğrulama' | '3 - Ticari teklif sunuldu' | '4 - Fiyat & koşul müzakeresi' | '5 - PO sözleşme bekleniyor' | '6 - Kazanıldı' | '6 - Kaybedildi' | '6 - Durduruldu';

export type DealNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type DealItem = {
  id: string;
  code: string;
  project: string;
  company: string;
  owner: string;
  capacity: string;
  capacityMw: number | null;
  stage: DealStageName;
  probability: number;
  value: string;
  valueAmount: number;
  weighted: string;
  weightedAmount: number;
  color: string;
  city: string;
  jinkoPrice: string | null;
  hsaPrice: string | null;
  targetPrice: string | null;
  competitorName: string | null;
  lossReason: string | null;
  wonReason: string | null;
  finalPrice: number | null;
  closedDate: string | null;
  lossLesson: string | null;
  epcPartner: string | null;
  deliveryDate: string | null;
  lastContactDate: string | null;
  currentUpdate?: string | null;
  lastActivityDate: string | null;
  nextActionDate: string | null;
  nextActionSubject: string | null;
  notes: string | null;
  noteHistory: DealNote[];
  createdAt: string;
};

type ApiDeal = {
  id: string;
  dealCode: string;
  customerId: string;
  companyName: string;
  city: string | null;
  salesUserId: string;
  salesUserName: string;
  salesUserShortName: string;
  projectName: string;
  stageId: number;
  stageName: string;
  capacityMw: number | null;
  probability: number;
  jinkoPrice: number | null;
  hsaPrice: number | null;
  dealValue: number | null;
  weightedValue: number | null;
  targetPrice: number | null;
  competitorName: string | null;
  lossReason: string | null;
  epcPartner: string | null;
  deliveryDate: string | null;
  lastContactDate: string | null;
  currentUpdate: string | null;
  notes: string | null;
  noteHistory?: DealNote[];
  status: string;
  lastActivityDate: string | null;
  nextActionDate: string | null;
  nextActionSubject: string | null;
  createdAt: string;
};

export const dealStages: { name: DealStageName; color: string; probability: number }[] = [
  { name: '1 - ilk temas, ilgi belirleme', color: 'slate', probability: 10 },
  { name: '2 - Bütçe & karar yetki doğrulama', color: 'indigo', probability: 25 },
  { name: '3 - Ticari teklif sunuldu', color: 'blue', probability: 40 },
  { name: '4 - Fiyat & koşul müzakeresi', color: 'orange', probability: 65 },
  { name: '5 - PO sözleşme bekleniyor', color: 'purple', probability: 85 },
  { name: '6 - Kazanıldı', color: 'emerald', probability: 100 },
  { name: '6 - Kaybedildi', color: 'rose', probability: 0 },
  { name: '6 - Durduruldu', color: 'zinc', probability: 0 },
];

export const lossReasonList = [
  'Fiyat (Yüksek)',
  'Teknik Yetersizlik',
  'Teslim Süresi',
  'Müşteri Kararsızlığı',
  'Finansal Nedenler',
  'Rakip Üstünlüğü',
  'İlişki Yönetimi',
  'Proje İptal Edildi',
  'Diğer',
];

const stageIdByName: Record<string, number> = {
  '1 - ilk temas, ilgi belirleme': 1,
  '2 - Bütçe & karar yetki doğrulama': 2,
  '3 - Ticari teklif sunuldu': 3,
  '4 - Fiyat & koşul müzakeresi': 4,
  '5 - PO sözleşme bekleniyor': 5,
  '6 - Kazanıldı': 6,
  '6 - Kaybedildi': 7,
  '6 - Durduruldu': 8,
};

const stageNameById: Record<number, DealStageName> = {
  1: '1 - ilk temas, ilgi belirleme',
  2: '2 - Bütçe & karar yetki doğrulama',
  3: '3 - Ticari teklif sunuldu',
  4: '4 - Fiyat & koşul müzakeresi',
  5: '5 - PO sözleşme bekleniyor',
  6: '6 - Kazanıldı',
  7: '6 - Kaybedildi',
  8: '6 - Durduruldu',
};

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;

const getStageConfig = (stageName: string) => (
  dealStages.find((stage) => stage.name === stageName) ?? dealStages[0]
);

const normalizeOptional = (value: FormDataEntryValue | null) => {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : null;
};

const nullableNumber = (value: FormDataEntryValue | null) => {
  const numberValue = Number(value ?? '');
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const nullableDate = (value: FormDataEntryValue | string | null | undefined) => {
  const text = String(value ?? '').trim();
  return text ? new Date(`${text}T00:00:00`).toISOString() : null;
};

const mapApiDeal = (deal: ApiDeal): DealItem => {
  const stageName = stageNameById[deal.stageId] ?? '1 - ilk temas, ilgi belirleme';
  const stage = getStageConfig(stageName);
  const valueAmount = deal.dealValue ?? 0;
  const weightedAmount = deal.weightedValue ?? valueAmount * deal.probability / 100;

  return {
    id: deal.id,
    code: deal.dealCode,
    project: deal.projectName,
    company: deal.companyName,
    owner: deal.salesUserShortName || deal.salesUserName || 'Sistem Yöneticisi',
    capacity: deal.capacityMw ? `${deal.capacityMw} MW` : '-',
    capacityMw: deal.capacityMw,
    stage: stage.name,
    probability: deal.probability,
    value: formatCurrency(valueAmount),
    valueAmount,
    weighted: formatCurrency(weightedAmount),
    weightedAmount,
    color: stage.color,
    city: deal.city ?? '',
    jinkoPrice: deal.jinkoPrice?.toString() ?? null,
    hsaPrice: deal.hsaPrice?.toString() ?? null,
    targetPrice: deal.targetPrice?.toString() ?? null,
    competitorName: deal.competitorName,
    lossReason: deal.lossReason,
    wonReason: null,
    finalPrice: null,
    closedDate: null,
    lossLesson: null,
    epcPartner: deal.epcPartner,
    deliveryDate: deal.deliveryDate,
    lastContactDate: deal.lastContactDate,
    currentUpdate: deal.currentUpdate,
    lastActivityDate: deal.lastActivityDate,
    nextActionDate: deal.nextActionDate,
    nextActionSubject: deal.nextActionSubject,
    notes: deal.notes,
    noteHistory: deal.noteHistory ?? (deal.notes ? [{ id: `${deal.id}-note`, text: deal.notes, createdAt: deal.createdAt }] : []),
    createdAt: deal.createdAt,
  };
};

const createDealPayload = (formData: FormData) => {
  const stageName = String(formData.get('stage') ?? '1 - ilk temas, ilgi belirleme');
  const stage = getStageConfig(stageName);

  return {
    salesUserId: String(formData.get('salesUserId') ?? ''),
    projectName: String(formData.get('project') ?? '').trim(),
    stageId: stageIdByName[stageName] ?? 1,
    capacityMw: nullableNumber(formData.get('capacityMw')),
    probability: stage.probability,
    jinkoPrice: nullableNumber(formData.get('jinkoPrice')),
    hsaPrice: nullableNumber(formData.get('hsaPrice')),
    dealValue: nullableNumber(formData.get('valueAmount')),
    targetPrice: nullableNumber(formData.get('targetPrice')),
    competitorName: normalizeOptional(formData.get('competitorName')),
    epcPartner: normalizeOptional(formData.get('epcPartner')),
    deliveryDate: nullableDate(formData.get('deliveryDate')),
    lastContactDate: nullableDate(formData.get('lastContactDate')),
    currentUpdate: normalizeOptional(formData.get('currentUpdate')),
    notes: normalizeOptional(formData.get('notes')),
  };
};

export async function getDealsFromDb() {
  const response = await api.get('/Deals');
  if (!response.ok) throw new Error('Deal verileri veritabanından alınamadı.');

  const deals = await response.json() as ApiDeal[];
  return deals.map(mapApiDeal);
}

export async function getDealByIdFromDb(id: string) {
  const response = await api.get(`/Deals/${id}`);
  if (!response.ok) return null;

  return mapApiDeal(await response.json() as ApiDeal);
}

export async function addDealToDb(formData: FormData) {
  const response = await api.post('/Deals', {
    customerId: String(formData.get('customerId') ?? ''),
    ...createDealPayload(formData),
  });

  if (!response.ok) throw new Error('Deal veritabanına kaydedilemedi.');
  return mapApiDeal(await response.json() as ApiDeal);
}

export async function updateDealInDb(id: string, formData: FormData) {
  const response = await api.put(`/Deals/${id}`, {
    ...createDealPayload(formData),
    status: 'open',
  });

  if (!response.ok) return null;
  return mapApiDeal(await response.json() as ApiDeal);
}

export async function updateDealStageInDb(id: string, stageName: DealStageName) {
  const stage = getStageConfig(stageName);
  const response = await api.put(`/Deals/${id}/stage`, {
    stageId: stageIdByName[stageName] ?? 1,
    probability: stage.probability,
  });

  if (!response.ok) throw new Error('Deal aşaması güncellenemedi.');
  return mapApiDeal(await response.json() as ApiDeal);
}

export async function closeDealInDb(
  id: string,
  result: 'won' | 'lost' | 'stopped',
  data: { lossReason?: string; competitorName?: string; closedDate?: string },
) {
  const response = await api.post(`/Deals/${id}/close`, {
    result,
    lossReason: data.lossReason ?? null,
    competitorName: data.competitorName ?? null,
    closedDate: nullableDate(data.closedDate) ?? new Date().toISOString(),
  });

  if (!response.ok) throw new Error('Deal kapatılamadı.');
  return mapApiDeal(await response.json() as ApiDeal);
}

export async function deleteDealFromDb(id: string) {
  const response = await api.delete(`/Deals/${id}`);
  if (!response.ok) throw new Error('Deal silinemedi.');
  return true;
}

export async function addNoteToDealDb(id: string, text: string) {
  const response = await api.post(`/Deals/${id}/notes`, { text });
  if (!response.ok) throw new Error('Not eklenemedi.');
  return mapApiDeal(await response.json() as ApiDeal);
}

export async function getLossReasonOptionsFromDb() {
  const deals = await getDealsFromDb();
  return Array.from(new Set(
    deals
      .map((deal) => deal.lossReason?.trim())
      .filter((reason): reason is string => Boolean(reason)),
  )).sort((a, b) => a.localeCompare(b, 'tr'));
}


