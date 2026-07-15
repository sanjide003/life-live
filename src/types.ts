export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  category: string;
  goalId?: string;
  dueTime?: string;
  alarmEnabled?: boolean;
  repeat?: 'Once' | 'Every day' | 'Monday to Friday' | 'Custom';
  repeatCustomDays?: string[];
  alarmType?: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'Daily' | 'Weekly' | 'Custom';
  repeat?: 'Once' | 'Every day' | 'Monday to Friday' | 'Custom';
  repeatCustomDays?: string[];
  category?: string;
  streak: number;
  completions: string[];
  targetCount: number;
  dueTime?: string;
  alarmEnabled?: boolean;
  alarmType?: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  category: string;
  progress: number;
  completed: boolean;
  dueTime?: string;
  alarmEnabled?: boolean;
  alarmType?: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
  repeat?: 'Once' | 'Every day' | 'Monday to Friday' | 'Custom';
  repeatCustomDays?: string[];
}

export interface Account {
  id: string;
  name: string;
  type: 'Bank' | 'UPI';
  balance: number;
}

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  accountId: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  category: string;
  dueTime?: string;
  alarmEnabled?: boolean;
  alarmType?: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
}

export interface CustomAlarm {
  id: string;
  title: string;
  time: string;
  active: boolean;
  date?: string;
  snoozedUntil?: string;
}

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerDay {
  date: string;
  completed: Record<PrayerName, boolean>;
}

export interface PrayerSettings {
  calculationMethod: 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'Tehran' | 'Gulf';
  school: 'Shafi' | 'Hanafi';
  location: {
    latitude: number;
    longitude: number;
    name: string;
    isManual: boolean;
  };
  manualOffsets: Record<PrayerName, number>;
  iqamahOffsets?: Record<PrayerName, number>;
  alarmOffsets?: Record<PrayerName, number>;
}

export interface HealthMetric {
  date: string;
  steps: number;
  sleepHours: number;
  waterIntakeMl: number;
  weightKg?: number;
  mood?: 'Excellent' | 'Good' | 'Neutral' | 'Bad' | 'Awful';
  medicines?: string[];
}

export interface DailyReview {
  date: string;
  positiveAspects: string;
  challenges: string;
  improvements: string;
  rating: number;
}

export interface FABSettings {
  size: 'small' | 'medium' | 'large';
  opacity: number;
  color: 'indigo' | 'sky' | 'emerald' | 'rose' | 'slate';
  autoHideTime: number;
}

export interface Debt {
  id: string;
  type: 'Lent' | 'Borrowed';
  personName: string;
  phoneNumber?: string;
  amount: number;
  dueDate?: string;
  status: 'Pending' | 'Paid';
  date: string;
  description?: string;
  dueTime?: string;
  alarmEnabled?: boolean;
  alarmType?: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
}

export interface LoanPayment {
  id: string;
  amount: number;
  date: string;
  paymentType: 'EMI' | 'Prepayment' | 'Close';
}

export interface Loan {
  id: string;
  type: 'Taken' | 'Given';
  lenderOrBorrower: string;
  phoneNumber?: string;
  principalAmount: number;
  interestRatePercent: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  remainingBalance: number;
  status: 'Active' | 'Closed';
  payments: LoanPayment[];
  description?: string;
  dueTime?: string;
  alarmEnabled?: boolean;
  alarmType?: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
}

export interface ExtraPrayer {
  id: string;
  name: string;
  rakats?: number; // റക്അത്ത് എണ്ണം
  time: string; // HH:MM
  alarmEnabled: boolean;
  alarmType: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
  repeat?: 'Once' | 'Every day' | 'Monday to Friday' | 'Custom';
  repeatCustomDays?: string[];
}

export interface Dhikr {
  id: string;
  name: string;
  targetCount: number;
  currentCount: number;
  time?: string; // HH:MM
  alarmEnabled?: boolean;
  alarmType?: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
  repeat?: 'Once' | 'Every day' | 'Monday to Friday' | 'Custom';
  repeatCustomDays?: string[];
  history?: Record<string, number>; // dateStr -> finalCount for visual analytics
}

export interface LifeOSState {
  theme?: 'light' | 'dark';
  language?: 'en' | 'ml';
  menuAutoHide?: boolean;
  menuHideDelay?: number;
  customAlarms?: CustomAlarm[];
  prayerAlarms?: Record<string, boolean>;
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  accounts: Account[];
  transactions: Transaction[];
  bills: Bill[];
  prayers: PrayerDay[];
  prayerSettings: PrayerSettings;
  extraPrayers?: ExtraPrayer[];
  dhikrs?: Dhikr[];
  healthMetrics: HealthMetric[];
  dailyReviews: DailyReview[];
  fabSettings?: FABSettings;
  debts?: Debt[];
  loans?: Loan[];
  customTransactionCategories?: string[];
  customBillCategories?: string[];
  categoryBudgets?: Record<string, number>;
}
