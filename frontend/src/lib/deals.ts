export type DealStageName = 'Potansiyel' | 'Yeterlilik' | 'Teklif' | 'Müzakere' | 'Taahhüt' | 'Kazanıldı' | 'Kaybedildi';

export type DealItem = {
  id: string;
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
  epcPartner: string | null;
  deliveryDate: string | null;
  lastContactDate: string | null;
  notes: string | null;
  noteHistory: DealNote[];
  createdAt: string;
};

export type DealNote = {
  id: string;
  text: string;
  createdAt: string;
};

const STORAGE_KEY = 'solar-crm-deals';

export const dealStages: { name: DealStageName; color: string; probability: number }[] = [
  { name: 'Potansiyel', color: 'slate', probability: 10 },
  { name: 'Yeterlilik', color: 'indigo', probability: 25 },
  { name: 'Teklif', color: 'blue', probability: 40 },
  { name: 'Müzakere', color: 'orange', probability: 65 },
  { name: 'Taahhüt', color: 'purple', probability: 85 },
  { name: 'Kazanıldı', color: 'emerald', probability: 100 },
  { name: 'Kaybedildi', color: 'rose', probability: 0 },
];

export const defaultDeals: DealItem[] = [];

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeOptional = (value: FormDataEntryValue | null) => {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : null;
};

const numberFromForm = (value: FormDataEntryValue | null) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
};

const formatCurrency = (value: number) => {
  return `$${Math.round(value).toLocaleString('en-US')}`;
};

const getStageConfig = (stageName: string) => {
  return dealStages.find((stage) => stage.name === stageName) ?? dealStages[0];
};

const generateDealCode = (deals: DealItem[]) => {
  const maxCode = deals.reduce((max, deal) => {
    const match = deal.id.match(/^DEAL-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `DEAL-${String(maxCode + 1).padStart(4, '0')}`;
};

const normalizeDeal = (deal: Partial<DealItem>): DealItem => {
  const stage = getStageConfig(deal.stage ?? 'Potansiyel');
  const valueAmount = deal.valueAmount ?? 0;
  const probability = deal.probability ?? stage.probability;
  const weightedAmount = deal.weightedAmount ?? valueAmount * probability / 100;
  const capacityMw = deal.capacityMw ?? null;

  return {
    id: deal.id ?? createId(),
    project: deal.project ?? '',
    company: deal.company ?? '',
    owner: deal.owner ?? 'Sistem Yöneticisi',
    capacity: deal.capacity ?? (capacityMw ? `${capacityMw} MW` : '-'),
    capacityMw,
    stage: stage.name,
    probability,
    value: deal.value ?? formatCurrency(valueAmount),
    valueAmount,
    weighted: deal.weighted ?? formatCurrency(weightedAmount),
    weightedAmount,
    color: deal.color ?? stage.color,
    city: deal.city ?? '',
    jinkoPrice: deal.jinkoPrice ?? null,
    hsaPrice: deal.hsaPrice ?? null,
    targetPrice: deal.targetPrice ?? null,
    competitorName: deal.competitorName ?? null,
    epcPartner: deal.epcPartner ?? null,
    deliveryDate: deal.deliveryDate ?? null,
    lastContactDate: deal.lastContactDate ?? null,
    notes: deal.notes ?? null,
    noteHistory: deal.noteHistory ?? (deal.notes ? [{ id: `${deal.id ?? 'deal'}-initial-note`, text: deal.notes, createdAt: deal.createdAt ?? new Date().toISOString() }] : []),
    createdAt: deal.createdAt ?? new Date().toISOString(),
  };
};

const readStoredDeals = () => {
  if (typeof window === 'undefined') return defaultDeals;

  const rawDeals = window.localStorage.getItem(STORAGE_KEY);
  if (!rawDeals) return defaultDeals;

  try {
    const deals = JSON.parse(rawDeals) as Partial<DealItem>[];
    return deals.map(normalizeDeal);
  } catch {
    return defaultDeals;
  }
};

const saveDeals = (deals: DealItem[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
};

export function getDeals() {
  return readStoredDeals().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function addDeal(formData: FormData) {
  const deals = getDeals();
  const stage = getStageConfig(String(formData.get('stage') ?? 'Potansiyel'));
  const valueAmount = numberFromForm(formData.get('valueAmount'));
  const capacityMw = numberFromForm(formData.get('capacityMw'));
  const weightedAmount = valueAmount * stage.probability / 100;

  const deal: DealItem = {
    id: generateDealCode(deals),
    project: String(formData.get('project') ?? '').trim(),
    company: String(formData.get('company') ?? '').trim(),
    owner: String(formData.get('owner') ?? 'Sistem Yöneticisi').trim(),
    capacity: capacityMw > 0 ? `${capacityMw} MW` : '-',
    capacityMw: capacityMw > 0 ? capacityMw : null,
    stage: stage.name,
    probability: stage.probability,
    value: formatCurrency(valueAmount),
    valueAmount,
    weighted: formatCurrency(weightedAmount),
    weightedAmount,
    color: stage.color,
    city: String(formData.get('city') ?? '').trim(),
    jinkoPrice: normalizeOptional(formData.get('jinkoPrice')),
    hsaPrice: normalizeOptional(formData.get('hsaPrice')),
    targetPrice: normalizeOptional(formData.get('targetPrice')),
    competitorName: normalizeOptional(formData.get('competitorName')),
    epcPartner: normalizeOptional(formData.get('epcPartner')),
    deliveryDate: normalizeOptional(formData.get('deliveryDate')),
    lastContactDate: normalizeOptional(formData.get('lastContactDate')),
    notes: normalizeOptional(formData.get('notes')),
    noteHistory: normalizeOptional(formData.get('notes'))
      ? [{ id: createId(), text: String(formData.get('notes')).trim(), createdAt: new Date().toISOString() }]
      : [],
    createdAt: new Date().toISOString(),
  };

  saveDeals([deal, ...deals]);
  return deal;
}

export function getDealById(id: string) {
  return getDeals().find((deal) => deal.id === id) ?? null;
}

export function updateDeal(id: string, formData: FormData) {
  const deals = getDeals();
  const currentDeal = deals.find((deal) => deal.id === id);
  if (!currentDeal) return null;

  const stage = getStageConfig(String(formData.get('stage') ?? currentDeal.stage));
  const valueAmount = numberFromForm(formData.get('valueAmount'));
  const capacityMw = numberFromForm(formData.get('capacityMw'));
  const weightedAmount = valueAmount * stage.probability / 100;

  const updatedDeal: DealItem = {
    ...currentDeal,
    project: String(formData.get('project') ?? '').trim(),
    company: String(formData.get('company') ?? '').trim(),
    owner: String(formData.get('owner') ?? 'Sistem Yöneticisi').trim(),
    capacity: capacityMw > 0 ? `${capacityMw} MW` : '-',
    capacityMw: capacityMw > 0 ? capacityMw : null,
    stage: stage.name,
    probability: stage.probability,
    value: formatCurrency(valueAmount),
    valueAmount,
    weighted: formatCurrency(weightedAmount),
    weightedAmount,
    color: stage.color,
    city: String(formData.get('city') ?? '').trim(),
    jinkoPrice: normalizeOptional(formData.get('jinkoPrice')),
    hsaPrice: normalizeOptional(formData.get('hsaPrice')),
    targetPrice: normalizeOptional(formData.get('targetPrice')),
    competitorName: normalizeOptional(formData.get('competitorName')),
    epcPartner: normalizeOptional(formData.get('epcPartner')),
    deliveryDate: normalizeOptional(formData.get('deliveryDate')),
    lastContactDate: normalizeOptional(formData.get('lastContactDate')),
    notes: normalizeOptional(formData.get('notes')),
    noteHistory: currentDeal.noteHistory,
  };

  saveDeals(deals.map((deal) => deal.id === id ? updatedDeal : deal));
  return updatedDeal;
}

export function addDealNote(id: string, text: string) {
  const noteText = text.trim();
  if (!noteText) return null;

  const deals = getDeals();
  const currentDeal = deals.find((deal) => deal.id === id);
  if (!currentDeal) return null;

  const note: DealNote = {
    id: createId(),
    text: noteText,
    createdAt: new Date().toISOString(),
  };

  const updatedDeal: DealItem = {
    ...currentDeal,
    notes: noteText,
    noteHistory: [note, ...currentDeal.noteHistory],
  };

  saveDeals(deals.map((deal) => deal.id === id ? updatedDeal : deal));
  return updatedDeal;
}

export function markDealAsWon(id: string) {
  const deals = getDeals();
  const currentDeal = deals.find((deal) => deal.id === id);
  if (!currentDeal) return null;

  const wonStage = getStageConfig('Kazanıldı');
  const updatedDeal: DealItem = {
    ...currentDeal,
    stage: wonStage.name,
    probability: wonStage.probability,
    color: wonStage.color,
    weighted: formatCurrency(currentDeal.valueAmount),
    weightedAmount: currentDeal.valueAmount,
  };

  saveDeals(deals.map((deal) => deal.id === id ? updatedDeal : deal));
  return updatedDeal;
}
