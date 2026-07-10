import {
  Monitor,
  Landmark,
  ShoppingBasket,
  Car,
  BarChart3,
  Factory,
  Rocket,
  Building2,
} from 'lucide-react';

export const SECTORS = [
  { id: 'it_services', label: 'IT Services', icon: Monitor },
  { id: 'banking', label: 'Banking', icon: Landmark },
  { id: 'fmcg', label: 'FMCG', icon: ShoppingBasket },
  { id: 'auto', label: 'Auto', icon: Car },
  { id: 'consulting', label: 'Consulting', icon: BarChart3 },
  { id: 'manufacturing', label: 'Manufacturing', icon: Factory },
  { id: 'startup', label: 'Startup / SaaS', icon: Rocket },
  { id: 'other', label: 'Other', icon: Building2 },
];

export const sectorMeta = (id) => SECTORS.find((s) => s.id === id) || SECTORS[SECTORS.length - 1];

export const QUESTION_LABELS = {
  hr: 'HR',
  technical: 'Technical / Domain',
  case: 'Case',
  guesstimate: 'Guesstimate',
};
