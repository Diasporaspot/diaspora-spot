import {
  Briefcase,
  CalendarDays,
  FileCheck2,
  FileText,
  Globe2,
  MapPin,
  MessageCircle,
  Presentation,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Workshop, WorkshopIcon, WorkshopIconTone, WorkshopStatus } from '@/content/types';
import styles from './workshops-page.module.css';

export function formatWorkshopDate(date: string, options: Intl.DateTimeFormatOptions = {}) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(parsedDate);
}

export function formatWorkshopPrice(workshop: Pick<Workshop, 'currency' | 'paymentType' | 'price'>) {
  if (workshop.paymentType !== 'paid' || workshop.price <= 0) {
    return 'Free';
  }

  try {
    return new Intl.NumberFormat('en', {
      currency: workshop.currency.toUpperCase(),
      style: 'currency',
    }).format(workshop.price);
  } catch {
    return `${workshop.currency.toUpperCase()} ${workshop.price}`;
  }
}

const workshopIconMap: Record<WorkshopIcon, LucideIcon> = {
  document: FileText,
  briefcase: Briefcase,
  conversation: MessageCircle,
  people: Users,
  calendar: CalendarDays,
  globe: Globe2,
  target: Target,
  presentation: Presentation,
  checklist: FileCheck2,
  'map-pin': MapPin,
};

const workshopIconToneClassMap: Record<WorkshopIconTone, string> = {
  warm: styles.iconWarm,
  gold: styles.iconGold,
  dark: styles.iconDark,
  green: styles.iconGreen,
  blue: styles.iconBlue,
};

export const workshopStatusLabel: Record<WorkshopStatus, string> = {
  'booking-open': 'Booking open',
  'few-spots': 'Few spots left',
  waitlist: 'Waitlist',
};

export function WorkshopIconBadge({ workshop }: { workshop: Workshop }) {
  const Icon = workshopIconMap[workshop.icon];

  return (
    <span className={`${styles.icon} ${workshopIconToneClassMap[workshop.iconTone]}`}>
      <Icon size={24} strokeWidth={1.7} />
    </span>
  );
}
