import { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Plus, 
  Trash2, X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  FileText,
  Calendar,
  Search,
  Filter,
  Percent,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  HelpCircle,
  Target,
  Sparkles,
  Edit2,
  ChevronRight,
  Bell
} from 'lucide-react';
import { LifeOSState, Transaction, Account, Bill, Debt, Loan, LoanPayment } from '../types';
import confetti from 'canvas-confetti';
import { getTranslation } from '../utils/translations';
import { motion, AnimatePresence } from 'motion/react';

interface FinanceProps {
  state: LifeOSState;
  onUpdateState: (newState: LifeOSState) => void;
  subTab?: 'overview' | 'transactions' | 'accounts' | 'bills' | 'debts-loans' | 'budgets';
  onSubTabChange?: (tab: 'overview' | 'transactions' | 'accounts' | 'bills' | 'debts-loans' | 'budgets') => void;
}

export default function Finance({ state, onUpdateState, subTab: externalSubTab, onSubTabChange }: FinanceProps) {
  const lang = state.language || 'en';
  const t = (key: any) => getTranslation(key, lang);

  const [localSubTab, setLocalSubTab] = useState<'overview' | 'transactions' | 'accounts' | 'bills' | 'debts-loans' | 'budgets'>('overview');
  const subTab = externalSubTab !== undefined ? externalSubTab : localSubTab;
  const setSubTab = (tab: 'overview' | 'transactions' | 'accounts' | 'bills' | 'debts-loans' | 'budgets') => {
    if (onSubTabChange) {
      onSubTabChange(tab);
    } else {
      setLocalSubTab(tab);
    }
  };

  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    consequence: string;
    onConfirm: () => void;
  } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    // Remove previous timeouts if you want, but simple timeout works perfectly here
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Safe structures for Debts & Loans fallback
  const debts = state.debts || [];
  const loans = state.loans || [];

  // Default Category Lists
  const DEFAULT_TX_CATEGORIES = ['Groceries', 'Food & Dining', 'Utilities', 'Healthcare', 'Rent', 'Professional', 'Entertainment', 'Travel', 'Education', 'Investment'];
  const DEFAULT_BILL_CATEGORIES = ['Utilities', 'Rent', 'Healthcare', 'Entertainment', 'Education', 'Tax'];

  const allTxCategories = [...DEFAULT_TX_CATEGORIES, ...(state.customTransactionCategories || [])];
  const allBillCategories = [...DEFAULT_BILL_CATEGORIES, ...(state.customBillCategories || [])];

  // Dynamic Category Creation States
  const [isAddingTxCat, setIsAddingTxCat] = useState(false);
  const [newTxCatName, setNewTxCatName] = useState('');
  const [isAddingBillCat, setIsAddingBillCat] = useState(false);
  const [newBillCatName, setNewBillCatName] = useState('');

  // Budgets & Category Limits Editing States
  const [editingBudgetCategory, setEditingBudgetCategory] = useState<string | null>(null);
  const [newBudgetValue, setNewBudgetValue] = useState('');

  // Editing states for edit modals
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Search & Filter State
  const [txSearch, setTxSearch] = useState('');
  const [txFilterCategory, setTxFilterCategory] = useState<string>('All');
  const [txFilterType, setTxFilterType] = useState<'All' | 'Income' | 'Expense'>('All');

  // New Transaction Form State
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Expense');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState('Groceries');
  const [txAccount, setTxAccount] = useState(state.accounts[0]?.id || '');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // New Bill Form State
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billDueTime, setBillDueTime] = useState('');
  const [billAlarmEnabled, setBillAlarmEnabled] = useState(false);
  const [billAlarmType, setBillAlarmType] = useState<'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone'>('Vibration & Ringtone');
  const [billCategory, setBillCategory] = useState('Utilities');

  // Accounts Form State
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'Bank' | 'UPI'>('Bank');
  const [newAccBalance, setNewAccBalance] = useState('');

  // New Debt Form State
  const [debtType, setDebtType] = useState<'Lent' | 'Borrowed'>('Lent');
  const [debtPersonName, setDebtPersonName] = useState('');
  const [debtPhoneNumber, setDebtPhoneNumber] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtDueTime, setDebtDueTime] = useState('');
  const [debtAlarmEnabled, setDebtAlarmEnabled] = useState(false);
  const [debtAlarmType, setDebtAlarmType] = useState<'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone'>('Vibration & Ringtone');
  const [debtDescription, setDebtDescription] = useState('');
  const [debtLinkAccount, setDebtLinkAccount] = useState(false);
  const [debtAccountId, setDebtAccountId] = useState(state.accounts[0]?.id || '');

  // New Loan Form State
  const [loanType, setLoanType] = useState<'Taken' | 'Given'>('Taken');
  const [loanLenderBorrower, setLoanLenderBorrower] = useState('');
  const [loanPhoneNumber, setLoanPhoneNumber] = useState('');
  const [loanPrincipal, setLoanPrincipal] = useState('');
  const [loanInterestRate, setLoanInterestRate] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [loanStartDate, setLoanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanDueTime, setLoanDueTime] = useState('');
  const [loanAlarmEnabled, setLoanAlarmEnabled] = useState(false);
  const [loanAlarmType, setLoanAlarmType] = useState<'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone'>('Vibration & Ringtone');
  const [loanDescription, setLoanDescription] = useState('');
  const [loanLinkAccount, setLoanLinkAccount] = useState(false);
  const [loanAccountId, setLoanAccountId] = useState(state.accounts[0]?.id || '');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsAddModalOpen(true);
    window.addEventListener('open-add-modal', handleOpenModal);
    return () => window.removeEventListener('open-add-modal', handleOpenModal);
  }, []);

  const handleCloseAddModal = () => setIsAddModalOpen(false);

  // Active view for Debts vs Loans forms
  const [debtsLoansView, setDebtsLoansView] = useState<'list' | 'add-debt' | 'add-loan'>('list');

  // Helper for dynamic monthly EMI calculation
  const getCalculatedEMI = (principal: string, rate: string, months: string) => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseInt(months);
    if (!isNaN(p) && !isNaN(r) && !isNaN(n) && r > 0 && n > 0) {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return Math.round(emi);
    } else if (!isNaN(p) && !isNaN(n) && n > 0) {
      return Math.round(p / n);
    }
    return 0;
  };

  const calculatedEMIResult = getCalculatedEMI(loanPrincipal, loanInterestRate, loanTenure);

  // 1. Transaction Operations
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0 || !txDescription.trim() || !txAccount) {
      showToast("ദയവായി എല്ലാ വിവരങ്ങളും ശരിയായി രേഖപ്പെടുത്തുക.", "warning");
      return;
    }

    // Create Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: txType,
      amount: amountNum,
      description: txDescription.trim(),
      category: txCategory,
      accountId: txAccount,
      date: txDate,
    };

    // Update Account Balance
    let isNegativeBalance = false;
    let targetAccountName = '';
    const updatedAccounts = state.accounts.map(acc => {
      if (acc.id === txAccount) {
        targetAccountName = acc.name;
        const balanceChange = txType === 'Income' ? amountNum : -amountNum;
        const finalBal = acc.balance + balanceChange;
        if (finalBal < 0) {
          isNegativeBalance = true;
        }
        return { ...acc, balance: finalBal };
      }
      return acc;
    });

    onUpdateState({
      ...state,
      transactions: [newTx, ...state.transactions],
      accounts: updatedAccounts,
    });

    // Check budget limit
    let isBudgetExceeded = false;
    let budgetLimit = 0;
    let currentMonthSpent = 0;
    if (txType === 'Expense' && state.categoryBudgets?.[txCategory]) {
      budgetLimit = state.categoryBudgets[txCategory];
      const currentMonthStr = txDate.substring(0, 7);
      currentMonthSpent = [newTx, ...state.transactions]
        .filter(t => t.type === 'Expense' && t.category === txCategory && t.date.substring(0, 7) === currentMonthStr)
        .reduce((sum, t) => sum + t.amount, 0);
      if (currentMonthSpent > budgetLimit) {
        isBudgetExceeded = true;
      }
    }

    // Reset Form
    setTxAmount('');
    setTxDescription('');
    confetti({ particleCount: 30, spread: 40 });

    if (isBudgetExceeded) {
      showToast(`മാസ ബഡ്ജറ്റ് പരിധി കവിഞ്ഞു! ${txCategory} വിഭാഗത്തിൽ ₹${currentMonthSpent.toLocaleString('en-IN')} ചിലവഴിച്ചു. പരിധി ₹${budgetLimit.toLocaleString('en-IN')} ആണ്.`, 'warning');
    } else if (isNegativeBalance) {
      showToast(`അക്കൗണ്ട് ബാലൻസ് നെഗറ്റീവ് ആണ്! ${targetAccountName} അക്കൗണ്ടിൽ മതിയായ ഫണ്ടില്ല.`, 'warning');
    } else {
      showToast(`ഇടപാട് വിജയകരമായി രേഖപ്പെടുത്തി: ₹${amountNum.toLocaleString('en-IN')} - ${newTx.description}`, 'success');
    }
  };

  const handleDeleteTransaction = (txId: string) => {
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;
    setConfirmState({
      title: 'Delete Ledger Transaction',
      message: `Are you sure you want to delete the transaction record for "${tx.description}"?`,
      consequence: `This will reverse the amount of ₹${tx.amount} and adjust the linked capital account balance accordingly.`,
      onConfirm: () => {
        // Revert Account Balance
        const updatedAccounts = state.accounts.map(acc => {
          if (acc.id === tx.accountId) {
            const balanceChange = tx.type === 'Income' ? -tx.amount : tx.amount;
            return { ...acc, balance: acc.balance + balanceChange };
          }
          return acc;
        });

        onUpdateState({
          ...state,
          transactions: state.transactions.filter(t => t.id !== txId),
          accounts: updatedAccounts,
        });

        showToast("ഇടപാട് വിജയകരമായി റദ്ദാക്കി.", "info");
      }
    });
  };

  // 2. Bill Operations (Pay Bill)
  const handlePayBill = (billId: string, accountId: string) => {
    const bill = state.bills.find(b => b.id === billId);
    if (!bill || bill.paid) return;
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return;

    setConfirmState({
      title: 'Pay Bill Confirmation',
      message: `Are you sure you want to pay the bill: "${bill.title}" (₹${bill.amount})?`,
      consequence: `This will instantly deduct ₹${bill.amount} from your capital account "${account.name}" and log an Expense in your ledger.`,
      onConfirm: () => {
        // Create corresponding Expense transaction
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          type: 'Expense',
          amount: bill.amount,
          description: `Auto-Paid Bill: ${bill.title}`,
          category: bill.category,
          accountId: accountId,
          date: new Date().toISOString().split('T')[0],
        };

        // Update Account Balance
        const updatedAccounts = state.accounts.map(acc => {
          if (acc.id === accountId) {
            return { ...acc, balance: acc.balance - bill.amount };
          }
          return acc;
        });

        // Set Bill to paid
        const updatedBills = state.bills.map(b => {
          if (b.id === billId) {
            return { ...b, paid: true };
          }
          return b;
        });

        onUpdateState({
          ...state,
          bills: updatedBills,
          transactions: [newTx, ...state.transactions],
          accounts: updatedAccounts,
        });

        confetti({ particleCount: 50, spread: 40 });
      }
    });
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(billAmount);
    if (isNaN(amountNum) || amountNum <= 0 || !billTitle.trim()) return;

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      title: billTitle.trim(),
      amount: amountNum,
      dueDate: billDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paid: false,
      category: billCategory,
      dueTime: billDueTime || undefined,
      alarmEnabled: billAlarmEnabled && !!billDueTime,
      alarmType: billAlarmEnabled && !!billDueTime ? billAlarmType : undefined,
    };

    onUpdateState({
      ...state,
      bills: [...state.bills, newBill],
    });

    setBillTitle('');
    setBillAmount('');
    setBillDueDate('');
    setBillDueTime('');
    setBillAlarmEnabled(false);
    confetti({ particleCount: 30, spread: 30 });
  };

  const handleDeleteBill = (billId: string) => {
    const bill = state.bills.find(b => b.id === billId);
    if (!bill) return;
    setConfirmState({
      title: 'Delete Upcoming Bill Reminder',
      message: `Are you sure you want to delete the bill reminder: "${bill.title}"?`,
      consequence: 'This reminder, its due date, and any scheduled alarms will be permanently removed.',
      onConfirm: () => {
        onUpdateState({
          ...state,
          bills: state.bills.filter(b => b.id !== billId),
        });
      }
    });
  };

  // 3. Account Operations
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(newAccBalance);
    if (isNaN(balanceNum) || !newAccName.trim()) {
      showToast("ദയവായി സാധുവായ ഒരു അക്കൗണ്ട് പേരും തുകയും നൽകുക.", "warning");
      return;
    }

    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      name: newAccName.trim(),
      type: newAccType,
      balance: balanceNum,
    };

    onUpdateState({
      ...state,
      accounts: [...state.accounts, newAcc],
    });

    setNewAccName('');
    setNewAccBalance('');
    confetti({ particleCount: 35, spread: 30 });
    showToast(`അക്കൗണ്ട് വിജയകരമായി ചേർത്തു: "${newAcc.name}" (ബാലൻസ്: ₹${balanceNum})`, "success");
  };

  const handleDeleteAccount = (accountId: string) => {
    if (state.accounts.length <= 1) {
      showToast("കുറഞ്ഞത് ഒരു അക്കൗണ്ട് എങ്കിലും ആക്റ്റീവ് ആയിരിക്കണം.", "warning");
      return;
    }
    const acc = state.accounts.find(a => a.id === accountId);
    if (!acc) return;
    setConfirmState({
      title: 'Delete Capital Account',
      message: `Are you sure you want to delete the account: "${acc.name}"?`,
      consequence: 'All records of this account, its balance, and its reference from ledger entries will be removed. This cannot be undone.',
      onConfirm: () => {
        onUpdateState({
          ...state,
          accounts: state.accounts.filter(a => a.id !== accountId),
        });
        showToast("ക്യാപിറ്റൽ അക്കൗണ്ട് വിജയകരമായി ഇല്ലാതാക്കി.", "info");
      }
    });
  };

  // 4. DEBT OPERATIONS
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(debtAmount);
    if (isNaN(amountNum) || amountNum <= 0 || !debtPersonName.trim()) return;

    const newDebt: Debt = {
      id: `debt-${Date.now()}`,
      type: debtType,
      personName: debtPersonName.trim(),
      phoneNumber: debtPhoneNumber.trim() || undefined,
      amount: amountNum,
      dueDate: debtDueDate || undefined,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      description: debtDescription.trim() || undefined,
      dueTime: debtDueTime || undefined,
      alarmEnabled: debtAlarmEnabled && !!debtDueTime,
      alarmType: debtAlarmEnabled && !!debtDueTime ? debtAlarmType : undefined,
    };

    let updatedAccounts = [...state.accounts];
    let updatedTxs = [...state.transactions];

    // If account linking is checked, adjust ledger
    if (debtLinkAccount && debtAccountId) {
      updatedAccounts = state.accounts.map(acc => {
        if (acc.id === debtAccountId) {
          // If we LENT money, it leaves our account (subtract). 
          // If we BORROWED money, it enters our account (add).
          const balanceChange = debtType === 'Lent' ? -amountNum : amountNum;
          return { ...acc, balance: acc.balance + balanceChange };
        }
        return acc;
      });

      // Create a transaction record as well
      const newTx: Transaction = {
        id: `tx-debt-${Date.now()}`,
        type: debtType === 'Lent' ? 'Expense' : 'Income',
        amount: amountNum,
        description: `${debtType === 'Lent' ? 'Lent cash to' : 'Borrowed cash from'} ${debtPersonName.trim()}`,
        category: 'Professional',
        accountId: debtAccountId,
        date: new Date().toISOString().split('T')[0]
      };
      updatedTxs = [newTx, ...updatedTxs];
    }

    onUpdateState({
      ...state,
      debts: [newDebt, ...debts],
      accounts: updatedAccounts,
      transactions: updatedTxs
    });

    // Reset Form & return to list
    setDebtPersonName('');
    setDebtPhoneNumber('');
    setDebtAmount('');
    setDebtDueDate('');
    setDebtDueTime('');
    setDebtAlarmEnabled(false);
    setDebtDescription('');
    setDebtLinkAccount(false);
    setDebtsLoansView('list');
    confetti({ particleCount: 30, spread: 30 });
  };

  const handleSettleDebt = (debtId: string, accountId: string) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt || debt.status === 'Paid') return;
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return;

    setConfirmState({
      title: 'Settle Debt Account',
      message: `Are you sure you want to settle the debt of ₹${debt.amount} with ${debt.personName}?`,
      consequence: `This will mark the debt as fully Paid, adjust the linked account "${account.name}" by ${debt.type === 'Lent' ? '+' : '-'}₹${debt.amount}, and log a transaction.`,
      onConfirm: () => {
        // Settle means:
        // If it was LENT: the person pays us back -> Income (+) to selected account.
        // If it was BORROWED: we pay them back -> Expense (-) from selected account.
        const updatedAccounts = state.accounts.map(acc => {
          if (acc.id === accountId) {
            const balanceChange = debt.type === 'Lent' ? debt.amount : -debt.amount;
            return { ...acc, balance: acc.balance + balanceChange };
          }
          return acc;
        });

        const newTx: Transaction = {
          id: `tx-settle-${Date.now()}`,
          type: debt.type === 'Lent' ? 'Income' : 'Expense',
          amount: debt.amount,
          description: `Settled Debt: ${debt.type === 'Lent' ? 'Received from' : 'Paid back to'} ${debt.personName}`,
          category: 'Professional',
          accountId: accountId,
          date: new Date().toISOString().split('T')[0]
        };

        const updatedDebts = debts.map(d => {
          if (d.id === debtId) {
            return { ...d, status: 'Paid' as const };
          }
          return d;
        });

        onUpdateState({
          ...state,
          debts: updatedDebts,
          accounts: updatedAccounts,
          transactions: [newTx, ...state.transactions]
        });

        confetti({ particleCount: 40, spread: 45 });
      }
    });
  };

  const handleDeleteDebt = (debtId: string) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;
    setConfirmState({
      title: 'Delete Debt Entry',
      message: `Are you sure you want to delete the debt record for "${debt.personName}"?`,
      consequence: 'The lending or borrowing tracking history with this individual will be permanently deleted.',
      onConfirm: () => {
        onUpdateState({
          ...state,
          debts: debts.filter(d => d.id !== debtId)
        });
      }
    });
  };

  // 5. LOAN OPERATIONS
  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const principalNum = parseFloat(loanPrincipal);
    const rateNum = parseFloat(loanInterestRate) || 0;
    const tenureNum = parseInt(loanTenure);

    if (isNaN(principalNum) || principalNum <= 0 || isNaN(tenureNum) || tenureNum <= 0 || !loanLenderBorrower.trim()) return;

    const calculatedEmi = getCalculatedEMI(loanPrincipal, loanInterestRate, loanTenure);

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      type: loanType,
      lenderOrBorrower: loanLenderBorrower.trim(),
      phoneNumber: loanPhoneNumber.trim() || undefined,
      principalAmount: principalNum,
      interestRatePercent: rateNum,
      tenureMonths: tenureNum,
      emiAmount: calculatedEmi,
      startDate: loanStartDate,
      remainingBalance: principalNum,
      status: 'Active',
      payments: [],
      description: loanDescription.trim() || undefined,
      dueTime: loanDueTime || undefined,
      alarmEnabled: loanAlarmEnabled && !!loanDueTime,
      alarmType: loanAlarmEnabled && !!loanDueTime ? loanAlarmType : undefined,
    };

    let updatedAccounts = [...state.accounts];
    let updatedTxs = [...state.transactions];

    // Link Account logic:
    // If loan is Taken: we receive the principal lump-sum into our bank account (+)
    // If loan is Given: we give the principal lump-sum out of our bank account (-)
    if (loanLinkAccount && loanAccountId) {
      updatedAccounts = state.accounts.map(acc => {
        if (acc.id === loanAccountId) {
          const balanceChange = loanType === 'Taken' ? principalNum : -principalNum;
          return { ...acc, balance: acc.balance + balanceChange };
        }
        return acc;
      });

      const newTx: Transaction = {
        id: `tx-loan-princ-${Date.now()}`,
        type: loanType === 'Taken' ? 'Income' : 'Expense',
        amount: principalNum,
        description: `Principal ${loanType === 'Taken' ? 'Disbursed' : 'Lent'} for Loan: ${loanLenderBorrower.trim()}`,
        category: 'Professional',
        accountId: loanAccountId,
        date: new Date().toISOString().split('T')[0]
      };
      updatedTxs = [newTx, ...updatedTxs];
    }

    onUpdateState({
      ...state,
      loans: [newLoan, ...loans],
      accounts: updatedAccounts,
      transactions: updatedTxs
    });

    // Reset Form & return to list
    setLoanLenderBorrower('');
    setLoanPhoneNumber('');
    setLoanPrincipal('');
    setLoanInterestRate('');
    setLoanTenure('');
    setLoanDueTime('');
    setLoanAlarmEnabled(false);
    setLoanDescription('');
    setLoanLinkAccount(false);
    setDebtsLoansView('list');
    confetti({ particleCount: 30, spread: 35 });
  };

  const handlePayEMI = (loanId: string, accountId: string, customAmount?: number) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan || loan.status === 'Closed') return;
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return;

    const paymentAmount = customAmount || loan.emiAmount;
    if (paymentAmount <= 0) return;

    setConfirmState({
      title: 'Pay Loan Installment (EMI)',
      message: `Are you sure you want to log a payment of ₹${paymentAmount} for the loan with "${loan.lenderOrBorrower}"?`,
      consequence: `This will deduct/add ₹${paymentAmount} to your account "${account.name}", decrease the loan's outstanding balance, and log a ledger transaction.`,
      onConfirm: () => {
        // Deduct EMI payment from account:
        // Taken loan: we pay EMI -> Expense (-)
        // Given loan: borrower pays us EMI -> Income (+)
        const updatedAccounts = state.accounts.map(acc => {
          if (acc.id === accountId) {
            const balanceChange = loan.type === 'Taken' ? -paymentAmount : paymentAmount;
            return { ...acc, balance: acc.balance + balanceChange };
          }
          return acc;
        });

        // Log transaction
        const newTx: Transaction = {
          id: `tx-emi-${Date.now()}`,
          type: loan.type === 'Taken' ? 'Expense' : 'Income',
          amount: paymentAmount,
          description: `EMI installment for Loan: ${loan.lenderOrBorrower}`,
          category: 'Rent', // Utilities/Rent appropriate
          accountId: accountId,
          date: new Date().toISOString().split('T')[0]
        };

        // Add payment entry & update loan balance
        const newPayment: LoanPayment = {
          id: `pay-${Date.now()}`,
          amount: paymentAmount,
          date: new Date().toISOString().split('T')[0],
          paymentType: 'EMI'
        };

        const newBalance = Math.max(0, loan.remainingBalance - paymentAmount);
        const updatedLoans = loans.map(l => {
          if (l.id === loanId) {
            return {
              ...l,
              remainingBalance: newBalance,
              status: newBalance <= 0 ? 'Closed' as const : 'Active' as const,
              payments: [...l.payments, newPayment]
            };
          }
          return l;
        });

        onUpdateState({
          ...state,
          loans: updatedLoans,
          accounts: updatedAccounts,
          transactions: [newTx, ...state.transactions]
        });

        confetti({ particleCount: 30, spread: 40 });
      }
    });
  };

  const handleDeleteLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    setConfirmState({
      title: 'Delete Loan Record',
      message: `Are you sure you want to delete the loan from "${loan.lenderOrBorrower}"?`,
      consequence: 'All amortization details, monthly EMI trackers, remaining balances, and historic payment sheets will be permanently lost.',
      onConfirm: () => {
        onUpdateState({
          ...state,
          loans: loans.filter(l => l.id !== loanId)
        });
      }
    });
  };

  // Total balance sum
  const totalBalance = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Quick statistics for current month
  const todayStr = new Date().toISOString().split('T')[0];
  const monthTransactions = state.transactions.filter(t => t.date.substring(0, 7) === todayStr.substring(0, 7));
  const monthIncome = monthTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = monthTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);

  // Debts & Liabilities summaries
  const pendingLentSum = debts.filter(d => d.type === 'Lent' && d.status === 'Pending').reduce((sum, d) => sum + d.amount, 0);
  const pendingBorrowedSum = debts.filter(d => d.type === 'Borrowed' && d.status === 'Pending').reduce((sum, d) => sum + d.amount, 0);
  const outstandingLoansTakenSum = loans.filter(l => l.type === 'Taken' && l.status === 'Active').reduce((sum, l) => sum + l.remainingBalance, 0);
  const outstandingLoansGivenSum = loans.filter(l => l.type === 'Given' && l.status === 'Active').reduce((sum, l) => sum + l.remainingBalance, 0);

  // Receivable Asset wealth = Lent Debts + Outstanding loans we gave to others
  const totalReceivableAssets = pendingLentSum + outstandingLoansGivenSum;
  // Payable Liability = Borrowed Debts + Outstanding loans we took from banks/others
  const totalPayableLiabilities = pendingBorrowedSum + outstandingLoansTakenSum;

  const netFinancialHealth = totalBalance + totalReceivableAssets - totalPayableLiabilities;

  // Helper to style category badges nicely in dark mode (improves Entertainment, Professional, etc contrast)
  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
            case 'Healthcare':
      case 'ആരോഗ്യം':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-800/40';
      case 'Education':
      case 'വിദ്യാഭ്യാസം':
        return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 border border-cyan-200/40 dark:border-cyan-800/40';
      case 'Groceries':
      case 'പലചരക്ക്':
        return 'bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-300 border border-lime-200/40 dark:border-lime-800/40';
      case 'Travel':
      case 'യാത്ര':
        return 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 border border-teal-200/40 dark:border-teal-800/40';
      case 'Other':
      case 'മറ്റുള്ളവ':
        return 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/40';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200/40 dark:border-indigo-800/40';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="finance_root">
      
      {/* 0. FINANCIAL OVERVIEW DASHBOARD STATS */}
      {subTab === 'overview' && (
        <div className="space-y-6 animate-fade-in" id="finance_overview_dashboard_stats">
          
          {/* Upper stats summary - Redesigned to be highly detailed and professional */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Net Financial Health Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-5 rounded-2xl border border-indigo-950 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">Net Asset Position</span>
                  <span className="text-[9px] bg-indigo-800 text-indigo-100 font-mono px-2 py-0.5 rounded font-bold uppercase">Dynamic</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-mono font-black tracking-tight mt-1">
                  ₹{netFinancialHealth.toLocaleString('en-IN')}
                </h2>
              </div>
              <div className="flex flex-col gap-1 text-[10px] text-indigo-200 mt-4 border-t border-indigo-900/50 pt-2.5 font-medium">
                <div className="flex justify-between">
                  <span>Liquid Capital:</span>
                  <span className="font-mono font-bold">₹{totalBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span>+ Receivables:</span>
                  <span className="font-mono font-bold">₹{totalReceivableAssets.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>- Liabilities:</span>
                  <span className="font-mono font-bold">₹{totalPayableLiabilities.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Liquid Wealth Account Count Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Capital Balance</span>
                <h3 className="text-lg font-mono font-black text-slate-900 dark:text-white mt-0.5">₹{totalBalance.toLocaleString('en-IN')}</h3>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold font-mono">In {state.accounts.length} Liquid accounts</span>
              </div>
            </div>

            {/* Month Inflow */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Month Inflow</span>
                <h3 className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹{monthIncome.toLocaleString('en-IN')}</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Credited this cycle</span>
              </div>
            </div>

            {/* Month Outflow */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                <TrendingDown className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Month Outflow</span>
                <h3 className="text-lg font-mono font-black text-rose-500 dark:text-rose-450 mt-0.5 font-mono">₹{monthExpense.toLocaleString('en-IN')}</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Debited this cycle</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {subTab === 'overview' && (
        <div className="space-y-6 animate-fade-in" id="finance_overview_dashboard">
          {/* Welcome Message / Quick Greeting Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/10 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-950/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> {lang === 'ml' ? 'ധനകാര്യ അവലോകനം (Finance Overview)' : 'Finance Overview Dashboard'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ml' ? 'നിങ്ങളുടെ വരുമാനം, ചിലവുകൾ, കടബാധ്യതകൾ, ബഡ്ജറ്റുകൾ എന്നിവ കൃത്യമായി ഇവിടെ കാണാൻ സാധിക്കും.' : 'A consolidated read-only cockpit summarizing your assets, budgets, bills, and recent ledger activity.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSubTab('transactions')}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Search className="h-3.5 w-3.5" /> {lang === 'ml' ? 'Ledger തിരയുക' : 'Search Ledger'}
              </button>
            </div>
          </div>

          {/* Quick Shortcuts Grid */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">{lang === 'ml' ? 'ദ്രുത നാവിഗേഷൻ (Quick Sub-Tab Navigation)' : 'Quick Navigation'}</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'transactions', label: lang === 'ml' ? 'ഇടപാടുകൾ (Ledger)' : 'Transactions (Ledger)', desc: lang === 'ml' ? 'വരവ് ചിലവ് രേഖകൾ' : 'Ledger cash flows', icon: IndianRupee, count: `${state.transactions.length} entries` },
                { id: 'bills', label: lang === 'ml' ? 'ബില്ലുകൾ (Bills)' : 'Bills', desc: lang === 'ml' ? 'അടയ്ക്കാനുള്ള തുകകൾ' : 'Upcoming bills due', icon: Bell, count: `${state.bills.filter(b => !b.paid).length} pending` },
                { id: 'accounts', label: lang === 'ml' ? 'അക്കൗണ്ടുകൾ (Accounts)' : 'Accounts', desc: lang === 'ml' ? 'ബാങ്ക് UPI അക്കൗണ്ടുകൾ' : 'Bank & UPI wallets', icon: CreditCard, count: `${state.accounts.length} active` },
                { id: 'debts-loans', label: lang === 'ml' ? 'കടം & ലോൺ (Loans)' : 'Debts & Loans', desc: lang === 'ml' ? 'ബാധ്യതകൾ, തിരികെ ലഭിക്കാനുള്ളവ' : 'Pending liabilities', icon: Percent, count: `${(state.debts?.filter(d => d.status==='Pending').length || 0) + (state.loans?.filter(l => l.status==='Active').length || 0)} open` },
                { id: 'budgets', label: lang === 'ml' ? 'ബഡ്ജറ്റുകൾ (Budgets)' : 'Budgets', desc: lang === 'ml' ? 'പ്രതിമാസ ചിലവ് പരിധികൾ' : 'Monthly budget caps', icon: Target, count: `${Object.keys(state.categoryBudgets || {}).length} set` }
              ].map((shortcut) => {
                const IconComp = shortcut.icon;
                return (
                  <button
                    key={shortcut.id}
                    onClick={() => setSubTab(shortcut.id as any)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-950 rounded-2xl text-left transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between min-h-[110px]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono font-bold rounded">
                        {shortcut.count}
                      </span>
                    </div>
                    <div className="mt-3">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                        {shortcut.label} <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-0.5 shrink-0" />
                      </h5>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{shortcut.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Row: Capital Distribution & Budgets (Left) & Alerts & Pending Bills (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Capital Distribution & Budget Progress (Read-Only) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Capital Accounts List */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-500" /> {lang === 'ml' ? 'അക്കൗണ്ടുകൾ' : 'Capital Accounts'}
                  </h3>
                  <button 
                    onClick={() => setSubTab('accounts')}
                    className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    {lang === 'ml' ? 'വിശദമായി കാണുക' : 'View All'}
                  </button>
                </div>
                <div className="space-y-2.5">
                  {state.accounts.map(acc => (
                    <div key={acc.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-150/50 dark:border-slate-850/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
                          {acc.type}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{acc.name}</span>
                      </div>
                      <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200">
                        ₹{acc.balance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  {state.accounts.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">{lang === 'ml' ? 'ബാങ്ക് അക്കൗണ്ടുകൾ ഒന്നും ലഭ്യമല്ല.' : 'No active capital accounts.'}</p>
                  )}
                </div>
              </div>

              {/* Monthly Budgets Status */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" /> {lang === 'ml' ? 'പ്രതിമാസ ബഡ്ജറ്റുകൾ' : 'Monthly Category Budgets'}
                  </h3>
                  <button 
                    onClick={() => setSubTab('budgets')}
                    className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    {lang === 'ml' ? 'വിശദമായി കാണുക' : 'View All'}
                  </button>
                </div>
                <div className="space-y-3.5">
                  {allTxCategories.slice(0, 4).map(cat => {
                    const limit = state.categoryBudgets?.[cat] || 0;
                    if (limit <= 0) return null;
                    const spent = state.transactions
                      .filter(t => t.type === 'Expense' && t.category === cat && t.date.substring(0, 7) === new Date().toISOString().substring(0, 7))
                      .reduce((sum, t) => sum + t.amount, 0);
                    const percent = Math.min(100, Math.round((spent / limit) * 100));
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>{cat}</span>
                          <span className="font-mono text-[11px]">₹{spent.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {(!state.categoryBudgets || Object.keys(state.categoryBudgets).length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-4">{lang === 'ml' ? 'ബഡ്ജറ്റ് പരിധികൾ ഒന്നും ഇതുവരെ നിശ്ചയിച്ചിട്ടില്ല.' : 'No budget limits configured for categories.'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Active Alerts, Warnings & Upcoming Unpaid Bills */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Warnings and Over Budget Highlights */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">{lang === 'ml' ? 'മുന്നറിയിപ്പുകൾ & അലേർട്ടുകൾ (Financial Alerts)' : 'Alerts'}</h4>
                
                {/* Check budget limit exceeded */}
                {(() => {
                  const currentMonthStr = new Date().toISOString().substring(0, 7);
                  const overBudgets = allTxCategories.map(cat => {
                    const spent = state.transactions
                      .filter(t => t.type === 'Expense' && t.category === cat && t.date.substring(0, 7) === currentMonthStr)
                      .reduce((sum, t) => sum + t.amount, 0);
                    const limit = state.categoryBudgets?.[cat] || 0;
                    return { cat, spent, limit };
                  }).filter(x => x.limit > 0 && x.spent >= x.limit * 0.8);

                  const negativeAccounts = state.accounts.filter(a => a.balance < 0);

                  if (overBudgets.length === 0 && negativeAccounts.length === 0) {
                    return (
                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-150/50 dark:border-emerald-950/40 rounded-2xl flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 text-white rounded-xl">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">{lang === 'ml' ? 'ശരിയായ ധനസ്ഥിതി! (Capital State Secure)' : 'Capital State Secure'}</p>
                          <p className="text-[10px] text-emerald-600/90 dark:text-emerald-500 mt-0.5">{lang === 'ml' ? 'ഒരു അക്കൗണ്ടിലും നെഗറ്റീവ് ബാലൻസോ അല്ലെങ്കിൽ ബഡ്ജറ്റ് കവിയലോ റിപ്പോർട്ട് ചെയ്തിട്ടില്ല.' : 'No over-budgets or negative balances reported across active accounts.'}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {negativeAccounts.map(acc => (
                        <div key={acc.id} className="p-3.5 bg-rose-50/70 dark:bg-rose-950/10 border border-rose-150 dark:border-rose-950/40 rounded-2xl flex items-start gap-3">
                          <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-rose-800 dark:text-rose-400">{lang === 'ml' ? 'അക്കൗണ്ടിൽ മതിയായ ബാലൻസില്ല! (Low Balance Alert)' : 'Low Balance Alert'}</p>
                            <p className="text-[10px] text-rose-600 dark:text-rose-500 mt-0.5">
                              {lang === 'ml' 
                                ? `"${acc.name}" എന്ന അക്കൗണ്ടിന്റെ ബാലൻസ് ₹${acc.balance.toLocaleString('en-IN')} ആണ്. ചിലവുകൾ നിയന്ത്രിക്കാൻ ശ്രദ്ധിക്കുക.`
                                : `"${acc.name}" account balance is critically low: ₹${acc.balance.toLocaleString('en-IN')}. Please monitor your expenses.`
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                      {overBudgets.map(ob => {
                        const ratio = ob.spent / ob.limit;
                        const isOver = ob.spent > ob.limit;
                        return (
                          <div key={ob.cat} className={`p-3.5 border rounded-2xl flex items-start gap-3 ${
                            isOver ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40' : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40'
                          }`}>
                            <div className={`p-2 rounded-xl text-white shrink-0 ${isOver ? 'bg-rose-500' : 'bg-amber-500'}`}>
                              <AlertCircle className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold ${isOver ? 'text-rose-800 dark:text-rose-400' : 'text-amber-800 dark:text-amber-400'}`}>
                                {isOver 
                                  ? (lang === 'ml' ? 'ബഡ്ജറ്റ് പരിധി കവിഞ്ഞു! (Budget Exceeded)' : 'Budget Exceeded') 
                                  : (lang === 'ml' ? 'ബഡ്ജറ്റ് പരിധിക്ക് അടുത്തെത്തി! (Near Cap)' : 'Near Budget Cap')
                                }
                              </p>
                              <p className={`text-[10px] mt-0.5 ${isOver ? 'text-rose-600/95 dark:text-rose-500' : 'text-amber-600/95 dark:text-amber-500'}`}>
                                {lang === 'ml'
                                  ? `"${ob.cat}" ബഡ്ജറ്റ് പരിധിയുടെ ${Math.round(ratio * 100)}% ഉപയോഗിച്ചു. ചിലവഴിച്ചത്: ₹${ob.spent.toLocaleString('en-IN')} / പരിധി: ₹${ob.limit.toLocaleString('en-IN')}.`
                                  : `"${ob.cat}" has utilized ${Math.round(ratio * 100)}% of its budget. Spent: ₹${ob.spent.toLocaleString('en-IN')} / Limit: ₹${ob.limit.toLocaleString('en-IN')}.`
                                }
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Upcoming Bills in Read-Only Mode */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-indigo-500" /> {lang === 'ml' ? 'വരാനിരിക്കുന്ന ബിൽ പേയ്‌മെന്റുകൾ (Upcoming Bills)' : 'Upcoming Bills'}
                  </h3>
                  <button onClick={() => setSubTab('bills')} className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer">
                    {lang === 'ml' ? 'എല്ലാം കാണുക (View All)' : 'View All'}
                  </button>
                </div>

                {state.bills.filter(b => !b.paid).length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-150 dark:border-slate-850 rounded-2xl">
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                      {lang === 'ml' ? 'അടയ്ക്കാനുള്ള ബില്ലുകൾ ഒന്നുമില്ല. അൺ-പെയ്ഡ് ബില്ലുകൾ ഇവിടെ ലിസ്റ്റ് ചെയ്യും.' : 'No pending bills. Unpaid bills will show up here.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {state.bills.filter(b => !b.paid).slice(0, 3).map((bill) => (
                      <div key={bill.id} className="p-3 bg-slate-50/60 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{bill.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-850 text-slate-500 dark:text-slate-400 rounded">
                              {bill.category}
                            </span>
                            <span className="text-[9px] text-rose-500 font-mono font-bold flex items-center gap-0.5">
                              <Clock className="h-3 w-3" /> {lang === 'ml' ? 'അവസാന തീയതി' : 'Due'}: {bill.dueDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200">₹{bill.amount.toLocaleString('en-IN')}</span>
                          <button
                            onClick={() => setSubTab('bills')}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            {lang === 'ml' ? 'പണമടയ്ക്കുക' : 'Pay'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Ledger timeline - Fully Read-Only */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-500" /> {lang === 'ml' ? 'അവസാനത്തെ പ്രധാന ഇടപാടുകൾ' : 'Recent Cash Flows'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === 'ml' ? 'നിങ്ങൾ അവസാനം നടത്തിയ വരവ് ചിലവ് വിവരങ്ങൾ' : 'Ledger activity feed of your latest transactions'}
                </p>
              </div>
              <button 
                onClick={() => setSubTab('transactions')}
                className="text-[11px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-black px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              >
                {lang === 'ml' ? 'ലോഗ് റെക്കോർഡ് തുറക്കുക (Open Ledger Logs) →' : 'Open Ledger Logs →'}
              </button>
            </div>

            {state.transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 italic text-xs">
                {lang === 'ml' ? 'ഇടപാടുകൾ ഒന്നും ഇതുവരെ രേഖപ്പെടുത്തിയിട്ടില്ല.' : 'No transactions logged yet.'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {state.transactions.slice(0, 5).map((tx) => {
                  const account = state.accounts.find(a => a.id === tx.accountId);
                  const isIncome = tx.type === 'Income';
                  return (
                    <div 
                      key={tx.id} 
                      className="p-3 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-150/60 dark:border-slate-850/50 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-950/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isIncome ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450'
                        }`}>
                          {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{tx.description}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] text-slate-400">
                            <span className="font-bold px-1.5 py-0.5 bg-slate-200/50 dark:bg-slate-850 rounded text-slate-500 dark:text-slate-400">{tx.category}</span>
                            <span>•</span>
                            <span className="font-medium text-slate-500 dark:text-slate-400 truncate max-w-[100px] inline-block">{account ? account.name : 'Unknown Account'}</span>
                            <span>•</span>
                            <span className="font-mono">{tx.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-mono font-black ${isIncome ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isIncome ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. TRANSACTIONS LEDGER PANEL */}
      {subTab === 'transactions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="transactions_panel">
          {/* Transactions Ledger list */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white">Transactions</h3>
              <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2.5 py-1 rounded-full">
                Shown: {
                  state.transactions.filter(t => {
                    const matchesSearch = t.description.toLowerCase().includes(txSearch.toLowerCase()) || t.category.toLowerCase().includes(txSearch.toLowerCase());
                    const matchesCategory = txFilterCategory === 'All' || t.category === txFilterCategory;
                    const matchesType = txFilterType === 'All' || t.type === txFilterType;
                    return matchesSearch && matchesCategory && matchesType;
                  }).length
                } / {state.transactions.length}
              </span>
            </div>

            {/* List */}
            {state.transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <IndianRupee className="h-10 w-10 mx-auto opacity-30 mb-2" />
                <p className="text-sm font-semibold">No transactions logged yet.</p>
                <p className="text-xs">Use the left form to log your first transaction.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] md:max-h-[500px] overflow-y-auto pr-1 overflow-x-hidden">
                <AnimatePresence>
                  {state.transactions
                    .filter(t => {
                      const matchesSearch = t.description.toLowerCase().includes(txSearch.toLowerCase()) || t.category.toLowerCase().includes(txSearch.toLowerCase());
                      const matchesCategory = txFilterCategory === 'All' || t.category === txFilterCategory;
                      const matchesType = txFilterType === 'All' || t.type === txFilterType;
                      return matchesSearch && matchesCategory && matchesType;
                    })
                    .map((t) => {
                      const account = state.accounts.find(a => a.id === t.accountId);
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          key={t.id} 
                          className="relative"
                        >
                          <div className="absolute inset-0 bg-rose-500 rounded-xl flex items-center justify-end px-4">
                            <Trash2 className="h-5 w-5 text-white" />
                          </div>
                          <motion.div
                            drag="x"
                            dragConstraints={{ left: -80, right: 0 }}
                            onDragEnd={(e: any, info: any) => {
                              if (info.offset.x < -50) {
                                handleDeleteTransaction(t.id);
                              }
                            }}
                            className="relative bg-white dark:bg-slate-900 flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/80 rounded-xl transition-all z-10"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`p-2 rounded-xl shrink-0 ${
                                t.type === 'Income' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                              }`}>
                                {t.type === 'Income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{t.description}</h4>
                                <div className="flex items-center gap-2 mt-0.5 truncate">
                                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{t.date}</span>
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold text-slate-500 dark:text-slate-400 shrink-0">{t.category}</span>
                                  {account && (
                                    <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold truncate">via {account.name}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-xs font-mono font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {t.type === 'Income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                              </span>
                              <button
                                onClick={() => setEditingTransaction(t)}
                                className="p-1 text-slate-350 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors cursor-pointer"
                                title="Edit transaction log"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
              </div>
            )}

            {/* Controls (moved below the list for mobile thumb accessibility) */}
            <div className="space-y-3 mt-5 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search logs by description..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="shrink-0">
                  <select
                    value={txFilterType}
                    onChange={(e) => setTxFilterType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">All Cash Flow</option>
                    <option value="Income">Inflow / Income</option>
                    <option value="Expense">Outflow / Expense</option>
                  </select>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mr-1">Categories:</span>
                {['All', ...allTxCategories].map((cat) => {
                  const isSelected = txFilterCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setTxFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add Transaction Form */}
          <div className={`${isAddModalOpen ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in' : 'hidden lg:block'}`}>
            <div className={`bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative ${isAddModalOpen ? 'w-full max-w-md rounded-3xl shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto' : 'rounded-2xl h-fit'}`}>
              {isAddModalOpen && (
                <button type="button" onClick={handleCloseAddModal} className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
                  <X className="h-4 w-4" />
                </button>
              )}
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" /> Add Transaction
              </h3>
              <form onSubmit={(e) => { handleAddTransaction(e); handleCloseAddModal(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('Expense')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    txType === 'Expense' 
                      ? 'bg-rose-500 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('Income')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    txType === 'Income' 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Amount (INR ₹)
                </label>
                <input
                  type="number"
                  placeholder="₹ Amount"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly veggies, salary, coffee..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  {!isAddingTxCat ? (
                    <select
                      value={txCategory}
                      onChange={(e) => {
                        if (e.target.value === 'CREATE_NEW_CAT') {
                          setIsAddingTxCat(true);
                        } else {
                          setTxCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                    >
                      {allTxCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="CREATE_NEW_CAT" className="text-indigo-600 font-bold font-sans">+ Create Custom...</option>
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="New Category"
                          value={newTxCatName}
                          onChange={(e) => setNewTxCatName(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = newTxCatName.trim();
                            if (trimmed && !allTxCategories.includes(trimmed)) {
                              const updatedCustom = [...(state.customTransactionCategories || []), trimmed];
                              onUpdateState({
                                ...state,
                                customTransactionCategories: updatedCustom
                              });
                              setTxCategory(trimmed);
                              setNewTxCatName('');
                              setIsAddingTxCat(false);
                              confetti({ particleCount: 20, spread: 30 });
                            }
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingTxCat(false);
                            setNewTxCatName('');
                          }}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Account Source
                  </label>
                  <select
                    value={txAccount}
                    onChange={(e) => setTxAccount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    {state.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (₹{acc.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Log Transaction
              </button>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* 2. PENDING BILLS PANEL */}
      {subTab === 'bills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="bills_panel">
          {/* Pending Bills List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white mb-4">Upcoming Bills</h3>

            {state.bills.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="h-10 w-10 mx-auto opacity-30 mb-2" />
                <p className="text-sm font-semibold">No bills tracked yet.</p>
                <p className="text-xs font-medium text-slate-400">Track and get auto-reminded of recurring payments.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] md:max-h-[480px] overflow-y-auto">
                {state.bills.map((bill) => (
                  <div 
                    key={bill.id} 
                    className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      bill.paid 
                        ? 'border-slate-100 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-950/20 opacity-70' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-100 bg-white dark:bg-slate-900 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl shrink-0 ${
                        bill.paid 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{bill.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3 inline" /> Due: {bill.dueDate} {bill.dueTime && `@ ${bill.dueTime}`}
                          </span>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-bold uppercase">{bill.category}</span>
                          {bill.alarmEnabled && !bill.paid && (
                            <span className="text-[9px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5 inline shrink-0" /> Alarm Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0">
                      <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                        ₹{bill.amount.toLocaleString()}
                      </span>

                      {!bill.paid ? (
                        <div className="flex items-center gap-2">
                          <select
                            id={`pay-account-${bill.id}`}
                            className="px-2 py-1 bg-slate-50 dark:bg-slate-950 text-[10px] font-bold border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                          >
                            {state.accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const selectEl = document.getElementById(`pay-account-${bill.id}`) as HTMLSelectElement;
                              handlePayBill(bill.id, selectEl.value);
                            }}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                          >
                            Pay Bill
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full">
                          Paid ✓
                        </span>
                      )}

                      <button
                        onClick={() => setEditingBill(bill)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Edit bill reminder"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteBill(bill.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete bill reminder"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Bill Form */}
          <div className={`${isAddModalOpen ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in' : 'hidden lg:block'}`}>
            <div className={`bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative ${isAddModalOpen ? 'w-full max-w-md rounded-3xl shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto' : 'rounded-2xl h-fit'}`}>
              {isAddModalOpen && (
                <button type="button" onClick={handleCloseAddModal} className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
                  <X className="h-4 w-4" />
                </button>
              )}
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" /> Add Bill
              </h3>
              <form onSubmit={(e) => { handleAddBill(e); handleCloseAddModal(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Bill Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electric bill, apartment rent..."
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="₹ Amount"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  {!isAddingBillCat ? (
                    <select
                      value={billCategory}
                      onChange={(e) => {
                        if (e.target.value === 'CREATE_NEW_BILL_CAT') {
                          setIsAddingBillCat(true);
                        } else {
                          setBillCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-250"
                    >
                      {allBillCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="CREATE_NEW_BILL_CAT" className="text-indigo-600 font-bold font-sans">+ Create Custom...</option>
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="New Category"
                          value={newBillCatName}
                          onChange={(e) => setNewBillCatName(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = newBillCatName.trim();
                            if (trimmed && !allBillCategories.includes(trimmed)) {
                              const updatedCustom = [...(state.customBillCategories || []), trimmed];
                              onUpdateState({
                                ...state,
                                customBillCategories: updatedCustom
                              });
                              setBillCategory(trimmed);
                              setNewBillCatName('');
                              setIsAddingBillCat(false);
                              confetti({ particleCount: 20, spread: 30 });
                            }
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingBillCat(false);
                            setNewBillCatName('');
                          }}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Time and Alarm details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Enable Alarm Reminder?</span>
                  <input 
                    type="checkbox" 
                    checked={billAlarmEnabled}
                    onChange={(e) => setBillAlarmEnabled(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 accent-indigo-500"
                  />
                </div>

                {billAlarmEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Alarm Trigger Time
                      </label>
                      <input 
                        type="time" 
                        value={billDueTime}
                        onChange={(e) => setBillDueTime(e.target.value)}
                        className="w-full px-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Alarm Feedback Mode
                      </label>
                      <select
                        value={billAlarmType}
                        onChange={(e) => setBillAlarmType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                      >
                        <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                        <option value="Vibration Only">Vibration Only</option>
                        <option value="Ringtone Only">Ringtone Only</option>
                      </select>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1">Livelife will ring or vibrate according to your selection at this exact hour.</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Instantiate Bill
              </button>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* 3. CAPITAL ACCOUNTS */}
      {subTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="accounts_panel">
          {/* Accounts list */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white mb-4">Accounts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.accounts.map((acc) => (
                <div 
                  key={acc.id} 
                  className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:border-indigo-100 transition-colors bg-slate-50/40 dark:bg-slate-950/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{acc.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">{acc.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{acc.balance.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => setEditingAccount(acc)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Edit account"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Delete account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Account Form */}
          <div className={`${isAddModalOpen ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in' : 'hidden lg:block'}`}>
            <div className={`bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative ${isAddModalOpen ? 'w-full max-w-md rounded-3xl shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto' : 'rounded-2xl h-fit'}`}>
              {isAddModalOpen && (
                <button type="button" onClick={handleCloseAddModal} className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
                  <X className="h-4 w-4" />
                </button>
              )}
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" /> Add Account
              </h3>
              <form onSubmit={(e) => { handleAddAccount(e); handleCloseAddModal(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, ICICI UPI..."
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Account Type
                </label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value as 'Bank' | 'UPI')}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="Bank">Bank Account / Savings</option>
                  <option value="UPI">UPI Digital Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Starting Balance (INR ₹)
                </label>
                <input
                  type="number"
                  placeholder="₹ Starting Balance"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Instantiate Capital
              </button>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* 4. DEBTS & LOANS TRACKING PANEL */}
      {subTab === 'debts-loans' && (
        <div className="space-y-6" id="debts_loans_panel">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Debts & Loans</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Track informal lending, borrowings, EMIs, and monthly principal amortizations.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDebtsLoansView('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                  debtsLoansView === 'list' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Briefcase className="h-3 w-3 shrink-0" /> Active Portfolio
              </button>
              <button 
                onClick={() => setDebtsLoansView('add-debt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                  debtsLoansView === 'add-debt' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Plus className="h-3 w-3" /> Record Debt
              </button>
              <button 
                onClick={() => setDebtsLoansView('add-loan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                  debtsLoansView === 'add-loan' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Plus className="h-3 w-3" /> Instantiate Loan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Right/Bottom column for Active Forms & Placeholders */}
            <div className="lg:col-span-1 order-last lg:order-last space-y-6 sticky bottom-4 lg:top-4 z-20">
              {/* Form: Record Informal Debt (Lent / Borrowed) */}
              {debtsLoansView === 'add-debt' && (
            <div className="bg-white/95 backdrop-blur dark:bg-slate-900/95 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto max-h-[60vh] lg:max-h-[85vh] overflow-y-auto overscroll-contain">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-500" /> Add Debt
              </h3>
              <form onSubmit={handleAddDebt} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDebtType('Lent')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      debtType === 'Lent' 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Lent (Receivable)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType('Borrowed')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      debtType === 'Borrowed' 
                        ? 'bg-rose-500 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Borrowed (Liability)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Counterparty Person
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma, Jane..."
                      value={debtPersonName}
                      onChange={(e) => setDebtPersonName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={debtPhoneNumber}
                      onChange={(e) => setDebtPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Debt Principal (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="₹ Amount"
                      value={debtAmount}
                      onChange={(e) => setDebtAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Expected Repayment Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Purpose / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lent for travel ticket..."
                    value={debtDescription}
                    onChange={(e) => setDebtDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Account Link Switcher */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Link to Bank Balance</span>
                      <span className="text-[9px] text-slate-400 block">Subtract/add principal directly from/to selected account now.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={debtLinkAccount}
                      onChange={(e) => setDebtLinkAccount(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 accent-indigo-500"
                    />
                  </div>

                  {debtLinkAccount && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Deduct/Credit Account Source
                      </label>
                      <select
                        value={debtAccountId}
                        onChange={(e) => setDebtAccountId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                      >
                        {state.accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Alarm trigger details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl space-y-3 text-slate-800 dark:text-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Enable Alarm Reminder?</span>
                      <span className="text-[9px] text-slate-400 block">Livelife will alert you when this debt is due.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={debtAlarmEnabled}
                      onChange={(e) => setDebtAlarmEnabled(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 accent-indigo-500"
                    />
                  </div>

                  {debtAlarmEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Alarm Trigger Time
                        </label>
                        <input 
                          type="time" 
                          value={debtDueTime}
                          onChange={(e) => setDebtDueTime(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-slate-800 dark:text-slate-100"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Alarm Feedback Mode
                        </label>
                        <select
                          value={debtAlarmType}
                          onChange={(e) => setDebtAlarmType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                        >
                          <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                          <option value="Vibration Only">Vibration Only</option>
                          <option value="Ringtone Only">Ringtone Only</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDebtsLoansView('list')}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Record Debt Entry
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form: Setup Loan (Taken / Given) with Dynamic EMI calculator */}
          {debtsLoansView === 'add-loan' && (
            <div className="bg-white/95 backdrop-blur dark:bg-slate-900/95 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto max-h-[60vh] lg:max-h-[85vh] overflow-y-auto overscroll-contain">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Percent className="h-5 w-5 text-indigo-500" /> Add Loan
              </h3>
              
              <form onSubmit={handleAddLoan} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLoanType('Taken')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      loanType === 'Taken' 
                        ? 'bg-rose-500 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Taken (You Borrowed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoanType('Given')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      loanType === 'Given' 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Given (You Lent)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Lender Bank or Borrower Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, SBI, Rahul Car Loan..."
                      value={loanLenderBorrower}
                      onChange={(e) => setLoanLenderBorrower(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={loanPhoneNumber}
                      onChange={(e) => setLoanPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Principal (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="₹ Amount"
                      value={loanPrincipal}
                      onChange={(e) => setLoanPrincipal(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 8.5"
                      value={loanInterestRate}
                      onChange={(e) => setLoanInterestRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Tenure (Months)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 12, 36"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Real-time Interest estimation panel */}
                {(parseFloat(loanPrincipal) > 0 && parseInt(loanTenure) > 0) && (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Estimated Monthly EMI:</span>
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        ₹{calculatedEMIResult.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
                      <span>Total Repayable: ₹{Math.round(calculatedEMIResult * parseInt(loanTenure)).toLocaleString()}</span>
                      <span>Total Interest Cost: ₹{Math.round((calculatedEMIResult * parseInt(loanTenure)) - parseFloat(loanPrincipal)).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={loanStartDate}
                      onChange={(e) => setLoanStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Loan Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Purchased new laptop"
                      value={loanDescription}
                      onChange={(e) => setLoanDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Account Link for Loan */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Link to Bank Balance</span>
                      <span className="text-[9px] text-slate-400 block">Receive or pay loan principal lump-sum instantly to/from selected account.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={loanLinkAccount}
                      onChange={(e) => setLoanLinkAccount(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 accent-indigo-500"
                    />
                  </div>

                  {loanLinkAccount && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Bank / Capital Source
                      </label>
                      <select
                        value={loanAccountId}
                        onChange={(e) => setLoanAccountId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                      >
                        {state.accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Alarm trigger details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl space-y-3 text-slate-800 dark:text-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Enable Alarm Reminder?</span>
                      <span className="text-[9px] text-slate-400 block">Livelife will alert you when EMI is due.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={loanAlarmEnabled}
                      onChange={(e) => setLoanAlarmEnabled(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 accent-indigo-500"
                    />
                  </div>

                  {loanAlarmEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Alarm Trigger Time
                        </label>
                        <input 
                          type="time" 
                          value={loanDueTime}
                          onChange={(e) => setLoanDueTime(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-slate-800 dark:text-slate-100"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Alarm Feedback Mode
                        </label>
                        <select
                          value={loanAlarmType}
                          onChange={(e) => setLoanAlarmType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                        >
                          <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                          <option value="Vibration Only">Vibration Only</option>
                          <option value="Ringtone Only">Ringtone Only</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDebtsLoansView('list')}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Instantiate EMI Loan
                  </button>
                </div>
              </form>
            </div>
          )}

              {/* Action Control Unit Placeholder shown only on desktop when no form is active */}
              {debtsLoansView === 'list' && (
                <div className="hidden lg:block bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center py-16 space-y-4 h-fit">
                  <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h4 className="font-display font-semibold text-sm text-slate-700 dark:text-slate-300">Quick Actions</h4>
                  <p className="text-xs text-slate-400">Choose "Record Debt" or "Instantiate Loan" above to open the entry manager console here.</p>
                </div>
              )}
            </div>

            {/* Left/Top column for Active Portfolio Listings (always visible) */}
            <div className="lg:col-span-2 order-first lg:order-first space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* DEBTS WRAPPER */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-emerald-500" /> Informal Debts Tracker
                    </h4>
                    <span className="text-[10px] text-slate-400">Personal lending & borrowing logs.</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono block text-slate-400">Total Net Debt:</span>
                    <span className={`text-xs font-mono font-bold ${pendingLentSum >= pendingBorrowedSum ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {pendingLentSum >= pendingBorrowedSum ? '+' : '-'}₹{Math.abs(pendingLentSum - pendingBorrowedSum).toLocaleString()}
                    </span>
                  </div>
                </div>

                {debts.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                    <User className="h-8 w-8 mx-auto opacity-30 mb-2" />
                    <p className="text-xs font-semibold">No pending debts logged.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1">
                    {debts.map((debt) => (
                      <div 
                        key={debt.id} 
                        className={`p-3 border rounded-xl flex flex-col justify-between gap-2.5 ${
                          debt.status === 'Paid' 
                            ? 'bg-slate-50/40 dark:bg-slate-950/10 border-slate-100 dark:border-slate-800/40 opacity-60' 
                            : 'border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              debt.type === 'Lent' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
                            }`}>
                              {debt.type === 'Lent' ? 'LENT' : 'BORROWED'}
                            </span>
                            <span className="text-xs font-mono font-black text-slate-900 dark:text-white block">₹{debt.amount.toLocaleString()}</span>
                          </div>
                          
                          <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                            <span className="truncate">{debt.personName}</span>
                          </h5>
                          {debt.description && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{debt.description}</p>
                          )}
                          
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 flex justify-between">
                             <span>{debt.date}</span>
                             {debt.status === 'Paid' && <span className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-1 rounded font-bold">Paid</span>}
                          </div>
                        </div>

                        {/* Settle Action / Details */}
                        {debt.status === 'Pending' && (
                          <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono truncate">
                              <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" /> 
                              {debt.dueDate ? `Due: ${debt.dueDate}` : 'No deadline'}
                            </span>

                            <div className="flex gap-1.5 w-full">
                              <select
                                id={`settle-account-${debt.id}`}
                                className="w-1/2 px-1 py-1 bg-slate-50 dark:bg-slate-950 text-[9px] font-bold border border-slate-200 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 focus:outline-none"
                              >
                                {state.accounts.map(acc => (
                                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  const selectEl = document.getElementById(`settle-account-${debt.id}`) as HTMLSelectElement;
                                  handleSettleDebt(debt.id, selectEl.value);
                                }}
                                className="w-1/2 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded text-[9px] font-bold transition-all cursor-pointer shadow-sm text-center"
                              >
                                Settle
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[10px] pt-1">
                          <button
                            onClick={() => setEditingDebt(debt)}
                            className="text-slate-400 hover:text-indigo-500 flex items-center gap-0.5 cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDebt(debt.id)}
                            className="text-slate-400 hover:text-rose-500 flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" /> Del
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LOANS & EMIS WRAPPER */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Percent className="h-4 w-4 text-amber-500" /> Active Loans & EMIs
                    </h4>
                    <span className="text-[10px] text-slate-400">Structured loans with monthly amortization tracking.</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono block text-slate-400">Total Loan Liability:</span>
                    <span className="text-xs font-mono font-bold text-rose-500">
                      ₹{outstandingLoansTakenSum.toLocaleString()}
                    </span>
                  </div>
                </div>

                {loans.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                    <Percent className="h-8 w-8 mx-auto opacity-30 mb-2" />
                    <p className="text-xs font-semibold">No structured loans configured.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1">
                    {loans.map((loan) => {
                      const totalPaidAmount = loan.payments.reduce((sum, p) => sum + p.amount, 0);
                      const paidEMIsCount = loan.payments.filter(p => p.paymentType === 'EMI').length;
                      
                      return (
                        <div 
                          key={loan.id} 
                          className={`p-3 border rounded-xl flex flex-col gap-2.5 transition-all ${
                            loan.status === 'Closed' 
                              ? 'bg-slate-50/30 dark:bg-slate-950/10 border-slate-100 dark:border-slate-800/40 opacity-60' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                loan.type === 'Taken' 
                                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400' 
                                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                              }`}>
                                {loan.type === 'Taken' ? 'TAKEN' : 'GIVEN'}
                              </span>
                              <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                                Bal: ₹{loan.remainingBalance.toLocaleString()}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {loan.lenderOrBorrower}
                            </h5>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">Total: ₹{loan.principalAmount.toLocaleString()} @ {loan.interestRatePercent}%</p>
                          </div>

                          {/* Progress bar representing tenure paid */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400">
                              <span>Progress</span>
                              <span className="font-mono">{paidEMIsCount} / {loan.tenureMonths}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (paidEMIsCount / loan.tenureMonths) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick Actions (EMI Pay etc) */}
                          {loan.status === 'Active' && (
                            <div className="bg-slate-50 dark:bg-slate-950/30 p-2 rounded-lg border border-slate-100 dark:border-slate-850 mt-1">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[9px] text-slate-400 font-semibold uppercase">EMI:</span>
                                <span className="text-[10px] font-mono font-black text-indigo-600 dark:text-indigo-400">₹{loan.emiAmount.toLocaleString()}</span>
                              </div>

                              <div className="flex gap-1.5">
                                <select
                                  id={`emi-account-${loan.id}`}
                                  className="w-1/2 px-1 py-1 bg-white dark:bg-slate-900 text-[9px] font-bold border border-slate-200 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 focus:outline-none"
                                >
                                  {state.accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => {
                                    const selectEl = document.getElementById(`emi-account-${loan.id}`) as HTMLSelectElement;
                                    handlePayEMI(loan.id, selectEl.value);
                                  }}
                                  className="w-1/2 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded text-[9px] font-bold transition-all cursor-pointer shadow-sm text-center"
                                >
                                  Pay EMI
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[10px] pt-1">
                            <span className="text-[9px] text-slate-400 font-mono">Start: {loan.startDate}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingLoan(loan)}
                                className="text-slate-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="h-3 w-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteLoan(loan.id)}
                                className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" /> Del
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
        </div>
      )}

      {subTab === 'budgets' && (() => {
        const currentMonthStr = new Date().toISOString().substring(0, 7);
        const getCategorySpentThisMonth = (category: string) => {
          return state.transactions
            .filter(t => t.type === 'Expense' && t.category === category && t.date.substring(0, 7) === currentMonthStr)
            .reduce((sum, t) => sum + t.amount, 0);
        };
        const totalBudget = Object.values(state.categoryBudgets || {}).reduce((sum, val) => sum + val, 0);
        const totalSpent = state.transactions
          .filter(t => t.type === 'Expense' && t.date.substring(0, 7) === currentMonthStr)
          .reduce((sum, t) => sum + t.amount, 0);

        return (
          <div className="space-y-6 animate-fade-in" id="budgets_panel">
            
            {/* Header Controls */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" /> Budgets
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Configure spending caps for default and custom categories to enforce rigorous discipline.
                </p>
              </div>
              
              {/* Quick Summary */}
              <div className="flex gap-4 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-150 dark:border-slate-850/50 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Budget Limits</span>
                  <span className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400">
                    ₹{totalBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-150 dark:border-slate-850/50 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Month Outflow</span>
                  <span className="text-sm font-mono font-black text-rose-500">
                    ₹{totalSpent.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Budgets Grid */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {allTxCategories.map((category) => {
                  const spent = getCategorySpentThisMonth(category);
                  const limit = state.categoryBudgets?.[category];
                  const hasLimit = limit !== undefined && limit > 0;
                  const ratio = hasLimit ? spent / limit : 0;
                  const percentage = Math.min(100, Math.round(ratio * 100));
                  const isOverBudget = hasLimit && spent > limit;
                  
                  // Color mapping
                  let progressColor = 'bg-emerald-500';
                  let textColor = 'text-emerald-600 dark:text-emerald-400';
                  if (ratio >= 1) {
                    progressColor = 'bg-rose-500';
                    textColor = 'text-rose-500 dark:text-rose-400 font-bold';
                  } else if (ratio >= 0.7) {
                    progressColor = 'bg-amber-500';
                    textColor = 'text-amber-600 dark:text-amber-400 font-semibold';
                  }

                  const isEditing = editingBudgetCategory === category;

                  return (
                    <div 
                      key={category} 
                      className={`p-5 border rounded-2xl flex flex-col justify-between gap-5 transition-all bg-slate-50/40 dark:bg-slate-950/20 ${
                        isOverBudget ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50/10 dark:bg-rose-950/5 shadow-inner' : 'border-slate-150 dark:border-slate-850 hover:border-indigo-200 dark:hover:border-indigo-950 hover:shadow-sm'
                      }`}
                    >
                      {/* Category Title and Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            {category}
                          </h4>
                          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Category Cap</span>
                        </div>

                        {isOverBudget && (
                          <span className="text-[9px] bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                            <AlertCircle className="h-3 w-3" /> Over Budget
                          </span>
                        )}
                      </div>

                      {/* Progress Stats */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-slate-500">Spent:</span>
                          <div className="space-x-1">
                            <span className="text-sm font-mono font-black text-slate-800 dark:text-slate-100">
                              ₹{spent.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              of {hasLimit ? `₹${limit.toLocaleString('en-IN')}` : 'No limit set'}
                            </span>
                          </div>
                        </div>

                        {hasLimit ? (
                          <div className="space-y-1">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className={`${progressColor} h-full transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                              <span>{percentage}% spent</span>
                              <span>₹{(limit - spent >= 0 ? limit - spent : 0).toLocaleString('en-IN')} remaining</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
                            No limit specified. Expenses track as un-budgeted outflow.
                          </div>
                        )}
                      </div>

                      {/* Quick form to adjust budget */}
                      <div className="border-t border-slate-100 dark:border-slate-850 pt-3">
                        {isEditing ? (
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="number"
                              placeholder="₹ Cap Amount"
                              value={newBudgetValue}
                              onChange={(e) => setNewBudgetValue(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-slate-800 dark:text-slate-100"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                const valNum = parseFloat(newBudgetValue);
                                const updatedBudgets = { ...(state.categoryBudgets || {}) };
                                if (isNaN(valNum) || valNum <= 0) {
                                  delete updatedBudgets[category];
                                } else {
                                  updatedBudgets[category] = valNum;
                                }
                                onUpdateState({
                                  ...state,
                                  categoryBudgets: updatedBudgets
                                });
                                setEditingBudgetCategory(null);
                                setNewBudgetValue('');
                                confetti({ particleCount: 20, spread: 30 });
                              }}
                              className="px-2.5 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-xl"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingBudgetCategory(null);
                                setNewBudgetValue('');
                              }}
                              className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-xl"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingBudgetCategory(category);
                              setNewBudgetValue(limit ? limit.toString() : '');
                            }}
                            className="w-full py-1.5 bg-slate-100/60 dark:bg-slate-950/45 border border-slate-200/40 dark:border-slate-850/30 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Percent className="h-3.5 w-3.5" />
                            {hasLimit ? 'Adjust Spending Limit' : 'Set Spending Limit'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Transaction Modal */}
      {editingTransaction && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in text-left">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {lang === 'ml' ? 'ഇടപാട് വിവരങ്ങൾ മാറ്റുക' : 'Edit Transaction'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={editingTransaction.description}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={editingTransaction.amount}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                    <select
                      value={editingTransaction.type}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, type: e.target.value as 'Income' | 'Expense' })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Expense">Expense / Outflow</option>
                      <option value="Income">Income / Inflow</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                    <select
                      value={editingTransaction.category}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      {allTxCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Account</label>
                    <select
                      value={editingTransaction.accountId}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, accountId: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      {state.accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingTransaction.date}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const oldTx = state.transactions.find(t => t.id === editingTransaction.id);
                    if (!oldTx) return;

                    // Revert old transaction on old account
                    let updatedAccounts = state.accounts.map(acc => {
                      if (acc.id === oldTx.accountId) {
                        const factor = oldTx.type === 'Income' ? -1 : 1;
                        return { ...acc, balance: acc.balance + (oldTx.amount * factor) };
                      }
                      return acc;
                    });

                    // Apply new transaction on new/updated account
                    updatedAccounts = updatedAccounts.map(acc => {
                      if (acc.id === editingTransaction.accountId) {
                        const factor = editingTransaction.type === 'Income' ? 1 : -1;
                        return { ...acc, balance: acc.balance + (editingTransaction.amount * factor) };
                      }
                      return acc;
                    });

                    onUpdateState({
                      ...state,
                      accounts: updatedAccounts,
                      transactions: state.transactions.map(t => t.id === editingTransaction.id ? editingTransaction : t)
                    });
                    setEditingTransaction(null);
                    showToast('ഇടപാട് വിവരങ്ങൾ മാറ്റി (Transaction updated!)', 'success');
                  }}
                  className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold text-xs cursor-pointer text-center font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Bill Modal */}
      {editingBill && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in text-left">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {lang === 'ml' ? 'ബിൽ വിവരങ്ങൾ മാറ്റുക' : 'Edit Bill'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingBill.title}
                    onChange={(e) => setEditingBill({ ...editingBill, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={editingBill.amount}
                      onChange={(e) => setEditingBill({ ...editingBill, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                    <select
                      value={editingBill.category}
                      onChange={(e) => setEditingBill({ ...editingBill, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      {allBillCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editingBill.dueDate}
                      onChange={(e) => setEditingBill({ ...editingBill, dueDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                    <select
                      value={editingBill.paid ? 'Paid' : 'Unpaid'}
                      onChange={(e) => setEditingBill({ ...editingBill, paid: e.target.value === 'Paid' })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Unpaid">Unpaid / Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Optional Alarm settings for Edit Bill */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingBill.alarmEnabled || false}
                        onChange={(e) => setEditingBill({
                          ...editingBill,
                          alarmEnabled: e.target.checked,
                          dueTime: e.target.checked ? (editingBill.dueTime || '09:00') : undefined,
                          alarmType: e.target.checked ? (editingBill.alarmType || 'Vibration & Ringtone') : undefined
                        })}
                        className="h-4 w-4 text-indigo-600 accent-indigo-500 rounded"
                      />
                      Enable Alarm Reminder?
                    </label>
                  </div>

                  {editingBill.alarmEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 animate-fade-in">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Alarm Time
                        </label>
                        <input
                          type="time"
                          value={editingBill.dueTime || '09:00'}
                          onChange={(e) => setEditingBill({ ...editingBill, dueTime: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Alarm Feedback Mode
                        </label>
                        <select
                          value={editingBill.alarmType || 'Vibration & Ringtone'}
                          onChange={(e) => setEditingBill({ ...editingBill, alarmType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200"
                        >
                          <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                          <option value="Vibration Only">Vibration Only</option>
                          <option value="Ringtone Only">Ringtone Only</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setEditingBill(null)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdateState({
                      ...state,
                      bills: state.bills.map(b => b.id === editingBill.id ? editingBill : b)
                    });
                    setEditingBill(null);
                    showToast('ബിൽ വിവരങ്ങൾ വിജയകരമായി മാറ്റി (Bill updated!)', 'success');
                  }}
                  className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold text-xs cursor-pointer text-center font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Account Modal */}
      {editingAccount && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in text-left">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {lang === 'ml' ? 'അക്കൗണ്ട് വിവരങ്ങൾ മാറ്റുക' : 'Edit Account'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={editingAccount.name}
                    onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Account Type</label>
                    <select
                      value={editingAccount.type}
                      onChange={(e) => setEditingAccount({ ...editingAccount, type: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Bank">Bank Account</option>
                      <option value="UPI">UPI Wallet</option>
                      <option value="Cash">Cash Handheld</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Balance (₹)</label>
                    <input
                      type="number"
                      value={editingAccount.balance}
                      onChange={(e) => setEditingAccount({ ...editingAccount, balance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setEditingAccount(null)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdateState({
                      ...state,
                      accounts: state.accounts.map(a => a.id === editingAccount.id ? editingAccount : a)
                    });
                    setEditingAccount(null);
                    showToast('അക്കൗണ്ട് വിവരങ്ങൾ മാറ്റി (Account updated!)', 'success');
                  }}
                  className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold text-xs cursor-pointer text-center font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Debt Modal */}
      {editingDebt && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in text-left">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {lang === 'ml' ? 'കടം രേഖ വിവരങ്ങൾ മാറ്റുക' : 'Edit Debt'}
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Person Name</label>
                    <input
                      type="text"
                      value={editingDebt.personName}
                      onChange={(e) => setEditingDebt({ ...editingDebt, personName: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                    <select
                      value={editingDebt.type}
                      onChange={(e) => setEditingDebt({ ...editingDebt, type: e.target.value as 'Lent' | 'Borrowed' })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Lent">Lent (I lent others money)</option>
                      <option value="Borrowed">Borrowed (I borrowed from others)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={editingDebt.description}
                    onChange={(e) => setEditingDebt({ ...editingDebt, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={editingDebt.amount}
                      onChange={(e) => setEditingDebt({ ...editingDebt, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                    <select
                      value={editingDebt.status}
                      onChange={(e) => setEditingDebt({ ...editingDebt, status: e.target.value as 'Pending' | 'Paid' })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid / Settled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editingDebt.dueDate || ''}
                    onChange={(e) => setEditingDebt({ ...editingDebt, dueDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Optional Alarm settings for Edit Debt */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingDebt.alarmEnabled || false}
                        onChange={(e) => setEditingDebt({
                          ...editingDebt,
                          alarmEnabled: e.target.checked,
                          dueTime: e.target.checked ? (editingDebt.dueTime || '09:00') : undefined,
                          alarmType: e.target.checked ? (editingDebt.alarmType || 'Vibration & Ringtone') : undefined
                        })}
                        className="h-4 w-4 text-indigo-600 accent-indigo-500 rounded"
                      />
                      Enable Alarm Reminder?
                    </label>
                  </div>

                  {editingDebt.alarmEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 animate-fade-in">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Alarm Time
                        </label>
                        <input
                          type="time"
                          value={editingDebt.dueTime || '09:00'}
                          onChange={(e) => setEditingDebt({ ...editingDebt, dueTime: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Alarm Feedback Mode
                        </label>
                        <select
                          value={editingDebt.alarmType || 'Vibration & Ringtone'}
                          onChange={(e) => setEditingDebt({ ...editingDebt, alarmType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200"
                        >
                          <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                          <option value="Vibration Only">Vibration Only</option>
                          <option value="Ringtone Only">Ringtone Only</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setEditingDebt(null)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdateState({
                      ...state,
                      debts: debts.map(d => d.id === editingDebt.id ? editingDebt : d)
                    });
                    setEditingDebt(null);
                    showToast('കടം വിവരങ്ങൾ വിജയകരമായി മാറ്റി (Debt updated!)', 'success');
                  }}
                  className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold text-xs cursor-pointer text-center font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Loan Modal */}
      {editingLoan && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in text-left">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {lang === 'ml' ? 'ലോൺ വിവരങ്ങൾ മാറ്റുക' : 'Edit Loan'}
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Lender / Borrower</label>
                    <input
                      type="text"
                      value={editingLoan.lenderOrBorrower}
                      onChange={(e) => setEditingLoan({ ...editingLoan, lenderOrBorrower: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                    <select
                      value={editingLoan.type}
                      onChange={(e) => setEditingLoan({ ...editingLoan, type: e.target.value as 'Given' | 'Taken' })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Taken">Taken (We borrowed from Bank/Person)</option>
                      <option value="Given">Given (We lent as structured Loan)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={editingLoan.description}
                    onChange={(e) => setEditingLoan({ ...editingLoan, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Principal (₹)</label>
                    <input
                      type="number"
                      value={editingLoan.principalAmount}
                      onChange={(e) => setEditingLoan({ ...editingLoan, principalAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Remaining Balance (₹)</label>
                    <input
                      type="number"
                      value={editingLoan.remainingBalance}
                      onChange={(e) => setEditingLoan({ ...editingLoan, remainingBalance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      value={editingLoan.interestRatePercent}
                      onChange={(e) => setEditingLoan({ ...editingLoan, interestRatePercent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tenure (Months)</label>
                    <input
                      type="number"
                      value={editingLoan.tenureMonths}
                      onChange={(e) => setEditingLoan({ ...editingLoan, tenureMonths: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">EMI Amount (₹)</label>
                    <input
                      type="number"
                      value={editingLoan.emiAmount}
                      onChange={(e) => setEditingLoan({ ...editingLoan, emiAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                    <select
                      value={editingLoan.status}
                      onChange={(e) => setEditingLoan({ ...editingLoan, status: e.target.value as 'Active' | 'Closed' })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Active">Active / Open</option>
                      <option value="Closed">Closed / Terminated</option>
                    </select>
                  </div>
                </div>

                {/* Optional Alarm settings for Edit Loan */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingLoan.alarmEnabled || false}
                        onChange={(e) => setEditingLoan({
                          ...editingLoan,
                          alarmEnabled: e.target.checked,
                          dueTime: e.target.checked ? (editingLoan.dueTime || '09:00') : undefined,
                          alarmType: e.target.checked ? (editingLoan.alarmType || 'Vibration & Ringtone') : undefined
                        })}
                        className="h-4 w-4 text-indigo-600 accent-indigo-500 rounded"
                      />
                      Enable Alarm Reminder?
                    </label>
                  </div>

                  {editingLoan.alarmEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 animate-fade-in">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Alarm Time
                        </label>
                        <input
                          type="time"
                          value={editingLoan.dueTime || '09:00'}
                          onChange={(e) => setEditingLoan({ ...editingLoan, dueTime: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Alarm Feedback Mode
                        </label>
                        <select
                          value={editingLoan.alarmType || 'Vibration & Ringtone'}
                          onChange={(e) => setEditingLoan({ ...editingLoan, alarmType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200"
                        >
                          <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                          <option value="Vibration Only">Vibration Only</option>
                          <option value="Ringtone Only">Ringtone Only</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setEditingLoan(null)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdateState({
                      ...state,
                      loans: loans.map(l => l.id === editingLoan.id ? editingLoan : l)
                    });
                    setEditingLoan(null);
                    showToast('ലോൺ വിവരങ്ങൾ വിജയകരമായി മാറ്റി (Loan updated!)', 'success');
                  }}
                  className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold text-xs cursor-pointer text-center font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Reusable Confirmation Modal overlay */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up text-left">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-50 tracking-tight">
                  {confirmState.title}
                </h3>
                <p className="text-xs text-slate-500">Action confirmation required</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                {confirmState.message}
              </p>
              {confirmState.consequence && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-semibold leading-normal flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Consequence:</strong> {confirmState.consequence}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setConfirmState(null)}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-2xl transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700 text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 text-center"
              >
                Confirm & OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 shadow-2xl animate-fade-in flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' :
            toast.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' :
            'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">
              {toast.type === 'success' ? 'വിജയകരം (Success)' : toast.type === 'warning' ? 'മുന്നറിയിപ്പ് (Warning)' : 'അറിയിപ്പ് (Notice)'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-350 font-medium leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
