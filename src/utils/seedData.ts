import { LifeOSState, PrayerSettings } from '../types';

export const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
  calculationMethod: 'Karachi',
  school: 'Hanafi',
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
    name: 'New Delhi, India',
    isManual: false,
  },
  manualOffsets: {
    Fajr: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0,
  },
};

export function getInitialState(): LifeOSState {
  const today = new Date().toISOString().split('T')[0];
  
  // Helper to get past dates
  const getPastDate = (daysAgo: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const initialTasks = [
    {
      id: 'task-1',
      title: 'Complete medical health insurance checkup',
      completed: false,
      dueDate: today,
      category: 'Health' as const,
    },
    {
      id: 'task-2',
      title: 'Review and reconcile monthly credit statement',
      completed: true,
      dueDate: getPastDate(1),
      category: 'Finance' as const,
    },
    {
      id: 'task-3',
      title: 'Prepare presentation deck for quarterly review',
      completed: false,
      dueDate: getPastDate(-2), // 2 days in future
      category: 'Work' as const,
    },
    {
      id: 'task-4',
      title: 'Clean workspace and organize bookshelf',
      completed: false,
      dueDate: today,
      category: 'Personal' as const,
    },
    {
      id: 'task-5',
      title: 'Water the balcony plants and clean filters',
      completed: true,
      dueDate: getPastDate(1),
      category: 'Personal' as const,
    }
  ];

  const initialHabits = [
    {
      id: 'habit-1',
      name: 'Drink 3L Water',
      frequency: 'Daily' as const,
      streak: 5,
      completions: [getPastDate(4), getPastDate(3), getPastDate(2), getPastDate(1), today],
      targetCount: 1,
    },
    {
      id: 'habit-2',
      name: 'Walk 10,000 Steps',
      frequency: 'Daily' as const,
      streak: 3,
      completions: [getPastDate(3), getPastDate(2), getPastDate(1)],
      targetCount: 1,
    },
    {
      id: 'habit-3',
      name: 'Read 10 Pages of Book',
      frequency: 'Daily' as const,
      streak: 12,
      completions: [getPastDate(5), getPastDate(4), getPastDate(3), getPastDate(2), getPastDate(1), today],
      targetCount: 1,
    },
    {
      id: 'habit-4',
      name: 'Morning Meditative Reflection',
      frequency: 'Daily' as const,
      streak: 0,
      completions: [getPastDate(2), getPastDate(1)],
      targetCount: 1,
    }
  ];

  const initialGoals = [
    {
      id: 'goal-1',
      title: 'Build ₹1,00,000 Emergency Safety Fund',
      targetDate: getPastDate(-180), // 6 months from now
      category: 'Finance',
      progress: 45,
      completed: false,
    },
    {
      id: 'goal-2',
      title: 'Complete Full Preventive Health Audit',
      targetDate: getPastDate(-30), // 1 month from now
      category: 'Health',
      progress: 80,
      completed: false,
    },
    {
      id: 'goal-3',
      title: 'Read 24 Non-Fiction Books',
      targetDate: getPastDate(-365), // 1 year from now
      category: 'Personal',
      progress: 25,
      completed: false,
    }
  ];

  const initialAccounts = [
    { id: 'acc-1', name: 'HDFC Savings Bank', type: 'Bank' as const, balance: 45200 },
    { id: 'acc-2', name: 'ICICI Digital Wallet', type: 'UPI' as const, balance: 8400 },
    { id: 'acc-3', name: 'Cash Hand', type: 'Bank' as const, balance: 3500 },
  ];

  const initialTransactions = [
    {
      id: 'tx-1',
      type: 'Income' as const,
      amount: 62000,
      description: 'Monthly Freelance Work Credit',
      category: 'Professional',
      date: getPastDate(10),
      accountId: 'acc-1',
    },
    {
      id: 'tx-2',
      type: 'Expense' as const,
      amount: 1450,
      description: 'Supermarket Weekly Groceries',
      category: 'Groceries',
      date: getPastDate(4),
      accountId: 'acc-1',
    },
    {
      id: 'tx-3',
      type: 'Expense' as const,
      amount: 180,
      description: 'UPI QR Scan: Tea & Snacks',
      category: 'Food & Dining',
      date: getPastDate(2),
      accountId: 'acc-2',
    },
    {
      id: 'tx-4',
      type: 'Expense' as const,
      amount: 799,
      description: 'Act Fibernet Broadband WiFi Bill',
      category: 'Utilities',
      date: getPastDate(1),
      accountId: 'acc-2',
    },
    {
      id: 'tx-5',
      type: 'Expense' as const,
      amount: 2400,
      description: 'Medicines & Vitamin Supplements',
      category: 'Healthcare',
      date: today,
      accountId: 'acc-1',
    }
  ];

  const initialBills = [
    {
      id: 'bill-1',
      title: 'WiFi Monthly Broadband',
      amount: 799,
      dueDate: getPastDate(1), // due yesterday
      paid: true,
      category: 'Utilities',
    },
    {
      id: 'bill-2',
      title: 'Apartment Maintenance Rent',
      amount: 6500,
      dueDate: getPastDate(-5), // in 5 days
      paid: false,
      category: 'Rent',
    },
    {
      id: 'bill-3',
      title: 'Premium Streaming Pack',
      amount: 299,
      dueDate: getPastDate(-12), // in 12 days
      paid: false,
      category: 'Entertainment',
    }
  ];

  // Seed historical prayers (last 5 days)
  const initialPrayers = [
    {
      date: getPastDate(4),
      completed: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
    },
    {
      date: getPastDate(3),
      completed: { Fajr: true, Dhuhr: true, Asr: false, Maghrib: true, Isha: true },
    },
    {
      date: getPastDate(2),
      completed: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
    },
    {
      date: getPastDate(1),
      completed: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: false },
    },
    {
      date: today,
      completed: { Fajr: true, Dhuhr: false, Asr: false, Maghrib: false, Isha: false },
    }
  ];

  // Health Metrics logs
  const initialHealthMetrics = [
    {
      date: getPastDate(4),
      steps: 8400,
      sleepHours: 7.2,
      waterIntakeMl: 2800,
      weightKg: 74.2,
      mood: 'Good' as const,
      medicines: ['Multivitamin'],
    },
    {
      date: getPastDate(3),
      steps: 11200,
      sleepHours: 6.8,
      waterIntakeMl: 3200,
      weightKg: 74.1,
      mood: 'Excellent' as const,
      medicines: ['Multivitamin'],
    },
    {
      date: getPastDate(2),
      steps: 9500,
      sleepHours: 7.5,
      waterIntakeMl: 3000,
      weightKg: 74.3,
      mood: 'Neutral' as const,
      medicines: ['Multivitamin', 'Calcium'],
    },
    {
      date: getPastDate(1),
      steps: 10400,
      sleepHours: 8.0,
      waterIntakeMl: 3400,
      weightKg: 74.0,
      mood: 'Excellent' as const,
      medicines: ['Multivitamin'],
    },
    {
      date: today,
      steps: 4200, // active today
      sleepHours: 7.0,
      waterIntakeMl: 1500,
      weightKg: 73.9,
      mood: 'Good' as const,
      medicines: ['Multivitamin'],
    }
  ];

  // Daily review reflections
  const initialDailyReviews = [
    {
      date: getPastDate(2),
      positiveAspects: 'Completed all core professional targets early and went for a beautiful sunset walk.',
      challenges: 'Felt a bit distracted in the afternoon after heavy lunch.',
      improvements: 'Will keep lunch light and do a quick stretch in the afternoon to stay energetic.',
      rating: 4,
    },
    {
      date: getPastDate(1),
      positiveAspects: 'Hit my step goal perfectly, stayed fully hydrated and prayed all prayers in congregation.',
      challenges: 'Stayed up slightly late watching educational tech videos.',
      improvements: 'Need to turn off screens strictly by 10:30 PM to maintain sleep rhythm.',
      rating: 5,
    }
  ];

  return {
    theme: 'light',
    menuAutoHide: false,
    menuHideDelay: 5,
    customAlarms: [],
    prayerAlarms: {
      Fajr: true,
      Dhuhr: true,
      Asr: true,
      Maghrib: true,
      Isha: true
    },
    tasks: initialTasks,
    habits: initialHabits,
    goals: initialGoals,
    accounts: initialAccounts,
    transactions: initialTransactions,
    bills: initialBills,
    prayers: initialPrayers,
    prayerSettings: DEFAULT_PRAYER_SETTINGS,
    healthMetrics: initialHealthMetrics,
    dailyReviews: initialDailyReviews,
    fabSettings: {
      size: 'medium',
      opacity: 1.0,
      color: 'indigo',
      autoHideTime: 0 // 0 means disabled
    },
    debts: [
      {
        id: 'debt-1',
        type: 'Lent',
        personName: 'Rahul Sharma',
        amount: 5000,
        dueDate: getPastDate(-15),
        status: 'Pending',
        date: getPastDate(5),
        description: 'Emergency travel expenses support'
      },
      {
        id: 'debt-2',
        type: 'Borrowed',
        personName: 'Anjali Varma',
        amount: 2500,
        dueDate: getPastDate(-3),
        status: 'Pending',
        date: getPastDate(10),
        description: 'Short-term cash loan for groceries'
      }
    ],
    loans: [
      {
        id: 'loan-1',
        type: 'Taken',
        lenderOrBorrower: 'HDFC Car Loan',
        principalAmount: 350000,
        interestRatePercent: 8.5,
        tenureMonths: 36,
        emiAmount: 11050,
        startDate: getPastDate(120), // 4 months ago
        remainingBalance: 315000,
        status: 'Active',
        payments: [
          { id: 'pay-1', amount: 11050, date: getPastDate(90), paymentType: 'EMI' },
          { id: 'pay-2', amount: 11050, date: getPastDate(60), paymentType: 'EMI' },
          { id: 'pay-3', amount: 11050, date: getPastDate(30), paymentType: 'EMI' }
        ],
        description: 'EMI Loan on Sedan Car Purchase'
      }
    ]
  };
}
