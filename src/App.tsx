import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  IndianRupee, 
  Compass, 
  Activity, 
  Award, 
  Settings,
  Heart,
  Menu,
  X,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Clock,
  Play,
  Square,
  Sparkles,
  Plus,
  CreditCard,
  Percent,
  Target
} from 'lucide-react';
import { LifeOSState, PrayerName, Task, Bill, CustomAlarm } from './types';
import { loadState, saveState } from './utils/storage';
import { playAlarmSound, stopAlarmSound } from './utils/audio';
import { calculatePrayerTimes } from './utils/prayerCalc';
import { getTranslation } from './utils/translations';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import Finance from './components/Finance';
import Prayer from './components/Prayer';
import Health from './components/Health';
import Reports from './components/Reports';
import SettingsComponent from './components/Settings';
import confetti from 'canvas-confetti';

export default function App() {
  const [state, setState] = useState<LifeOSState>(() => loadState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [plannerSubTab, setPlannerSubTab] = useState<'tasks' | 'habits'>('tasks');
  const [financeSubTab, setFinanceSubTab] = useState<'overview' | 'transactions' | 'accounts' | 'bills' | 'debts-loans' | 'budgets'>('overview');
  const [prayerSubTab, setPrayerSubTab] = useState<'tracker' | 'settings' | 'sunnah-dhikr'>('tracker');
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [fabDirection, setFabDirection] = useState<'up-left' | 'up-right' | 'down-left' | 'down-right'>('up-left');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveringSidebar, setHoveringSidebar] = useState(false);
  const [autoCollapseProgress, setAutoCollapseProgress] = useState(100);

  // Active ringing alarm state
  const [activeAlarm, setActiveAlarm] = useState<{
    id: string;
    title: string;
    type: 'task' | 'bill' | 'prayer' | 'custom';
    time: string;
    originalId?: string;
    alarmType?: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
  } | null>(null);

  // List of alarm keys that have rung today in the current minute (prevents infinite ringing)
  const [rungKeys, setRungKeys] = useState<string[]>([]);

  const currentTheme = state.theme || 'light';
  const autoHideEnabled = state.menuAutoHide ?? false;
  const autoHideDelay = state.menuHideDelay ?? 5; // default 5 seconds

  // Apply dark mode CSS classes at root level
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  // Sidebar auto-collapse delay control
  useEffect(() => {
    if (!sidebarOpen || !autoHideEnabled || hoveringSidebar) {
      setAutoCollapseProgress(100);
      return;
    }

    let elapsed = 0;
    const totalMs = autoHideDelay * 1000;
    const intervalTime = 100; // update progress every 100ms

    const timer = setInterval(() => {
      elapsed += intervalTime;
      const progress = Math.max(0, 100 - (elapsed / totalMs) * 100);
      setAutoCollapseProgress(progress);

      if (elapsed >= totalMs) {
        setSidebarOpen(false);
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [sidebarOpen, autoHideEnabled, autoHideDelay, hoveringSidebar]);

  // Dynamic drag constraints tracking for the mobile Floating Action Button
  const [dragConstraints, setDragConstraints] = useState({ left: -300, right: 0, top: -500, bottom: 0 });
  useEffect(() => {
    const handleResize = () => {
      setDragConstraints({
        left: -window.innerWidth + 80,
        right: 0,
        top: -window.innerHeight + 140,
        bottom: 0
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFabClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!fabMenuOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isTop = rect.top < window.innerHeight / 2;
      const isLeft = rect.left < window.innerWidth / 2;
      
      let dir = '';
      if (isTop && isLeft) dir = 'down-right';
      else if (isTop && !isLeft) dir = 'down-left';
      else if (!isTop && isLeft) dir = 'up-right';
      else dir = 'up-left';
      
      setFabDirection(dir as any);
    }
    setFabMenuOpen(!fabMenuOpen);
  };
  useEffect(() => {
    if (!fabMenuOpen) return;
    const hideTime = state.fabSettings?.autoHideTime || 0;
    if (hideTime <= 0) return;

    const timer = setTimeout(() => {
      setFabMenuOpen(false);
    }, hideTime * 1000);

    return () => clearTimeout(timer);
  }, [fabMenuOpen, state.fabSettings?.autoHideTime]);

  // Request Notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const triggerSystemNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (e) {
        console.error('System Notification Error:', e);
      }
    }
  };

  // Real-time alarm checking loop
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hh}:${mm}`;
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., Mon, Tue

      // 1. Check Custom Alarms
      if (state.customAlarms) {
        state.customAlarms.forEach(alarm => {
          if (alarm.active) {
            const targetTime = alarm.snoozedUntil || alarm.time;
            const matchesDate = !alarm.date || alarm.date === todayStr;
            if (matchesDate && targetTime === currentTimeStr) {
              const key = `custom_${alarm.id}_${todayStr}_${targetTime}`;
              if (!rungKeys.includes(key)) {
                setActiveAlarm({
                  id: alarm.id,
                  title: alarm.title,
                  type: 'custom',
                  time: targetTime
                });
                setRungKeys(prev => [...prev, key]);
                triggerSystemNotification("Alarm Triggered", alarm.title);
                playAlarmSound('custom');
              }
            }
          }
        });
      }

      // 2. Check Tasks Alarms
      state.tasks.forEach(task => {
        if (!task.completed && task.alarmEnabled && task.dueTime && task.dueDate === todayStr) {
          if (task.dueTime === currentTimeStr) {
            const key = `task_${task.id}_${todayStr}_${currentTimeStr}`;
            if (!rungKeys.includes(key)) {
              setActiveAlarm({
                id: task.id,
                title: `Task Deadline: ${task.title}`,
                type: 'task',
                time: task.dueTime,
                alarmType: task.alarmType
              });
              setRungKeys(prev => [...prev, key]);
              triggerSystemNotification("Task Deadline", task.title);
              if (task.alarmType !== 'Vibration Only') {
                playAlarmSound('task');
              }
              if ((task.alarmType === 'Vibration Only' || task.alarmType === 'Vibration & Ringtone') && navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
              }
            }
          }
        }
      });

      // 2.5 Check Habits Alarms
      state.habits.forEach(habit => {
        if (habit.alarmEnabled && habit.dueTime) {
          const isMondayToFriday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dayOfWeek);
          const matchesRepeat = 
            !habit.repeat || 
            habit.repeat === 'Once' ||
            habit.repeat === 'Every day' || 
            (habit.repeat === 'Monday to Friday' && isMondayToFriday) ||
            (habit.repeat === 'Custom' && habit.repeatCustomDays?.includes(dayOfWeek));

          if (matchesRepeat && habit.dueTime === currentTimeStr) {
            const key = `habit_${habit.id}_${todayStr}_${currentTimeStr}`;
            if (!rungKeys.includes(key)) {
              setActiveAlarm({
                id: habit.id,
                title: `Habit Goal: ${habit.name}`,
                type: 'custom',
                time: habit.dueTime,
                alarmType: habit.alarmType
              });
              setRungKeys(prev => [...prev, key]);
              triggerSystemNotification("Habit Reminder", habit.name);
              if (habit.alarmType !== 'Vibration Only') {
                playAlarmSound('custom');
              }
              if ((habit.alarmType === 'Vibration Only' || habit.alarmType === 'Vibration & Ringtone') && navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
              }
            }
          }
        }
      });

      // 2.6 Check Goals Alarms
      state.goals.forEach(goal => {
        if (!goal.completed && goal.alarmEnabled && goal.dueTime && goal.targetDate === todayStr) {
          if (goal.dueTime === currentTimeStr) {
            const key = `goal_${goal.id}_${todayStr}_${currentTimeStr}`;
            if (!rungKeys.includes(key)) {
              setActiveAlarm({
                id: goal.id,
                title: `Core Goal Milestone: ${goal.title}`,
                type: 'custom',
                time: goal.dueTime,
                alarmType: goal.alarmType
              });
              setRungKeys(prev => [...prev, key]);
              triggerSystemNotification("Goal Target Time", goal.title);
              if (goal.alarmType !== 'Vibration Only') {
                playAlarmSound('custom');
              }
              if ((goal.alarmType === 'Vibration Only' || goal.alarmType === 'Vibration & Ringtone') && navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
              }
            }
          }
        }
      });

      // 3. Check Bills Alarms
      state.bills.forEach(bill => {
        if (!bill.paid && bill.alarmEnabled && bill.dueTime && bill.dueDate === todayStr) {
          if (bill.dueTime === currentTimeStr) {
            const key = `bill_${bill.id}_${todayStr}_${currentTimeStr}`;
            if (!rungKeys.includes(key)) {
              setActiveAlarm({
                id: bill.id,
                title: `Bill Due Reminder: ${bill.title} (₹${bill.amount})`,
                type: 'bill',
                time: bill.dueTime,
                alarmType: bill.alarmType || 'Vibration & Ringtone'
              });
              setRungKeys(prev => [...prev, key]);
              triggerSystemNotification("Bill Due Today", `${bill.title} (₹${bill.amount})`);
              if (bill.alarmType !== 'Vibration Only') {
                playAlarmSound('bill');
              }
              if ((bill.alarmType === 'Vibration Only' || bill.alarmType === 'Vibration & Ringtone') && navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
              }
            }
          }
        }
      });

      // 3b. Check Debts Alarms
      if (state.debts) {
        state.debts.forEach(debt => {
          if (debt.status === 'Pending' && debt.alarmEnabled && debt.dueTime && debt.dueDate === todayStr) {
            if (debt.dueTime === currentTimeStr) {
              const key = `debt_${debt.id}_${todayStr}_${currentTimeStr}`;
              if (!rungKeys.includes(key)) {
                setActiveAlarm({
                  id: debt.id,
                  title: `Debt Reminder: ${debt.personName} (${debt.type === 'Lent' ? 'Collect ₹' : 'Pay ₹'}${debt.amount})`,
                  type: 'custom',
                  time: debt.dueTime,
                  alarmType: debt.alarmType || 'Vibration & Ringtone'
                });
                setRungKeys(prev => [...prev, key]);
                triggerSystemNotification("Debt Reminder", `${debt.personName}: ${debt.type === 'Lent' ? 'Collect ₹' : 'Pay ₹'}${debt.amount}`);
                if (debt.alarmType !== 'Vibration Only') {
                  playAlarmSound('custom');
                }
                if ((debt.alarmType === 'Vibration Only' || debt.alarmType === 'Vibration & Ringtone') && navigator.vibrate) {
                  navigator.vibrate([200, 100, 200, 100, 200]);
                }
              }
            }
          }
        });
      }

      // 3c. Check Loans Alarms
      if (state.loans) {
        state.loans.forEach(loan => {
          if (loan.status === 'Active' && loan.alarmEnabled && loan.dueTime && loan.startDate) {
            const startDay = new Date(loan.startDate).getDate();
            const todayDay = now.getDate();
            if (startDay === todayDay && loan.dueTime === currentTimeStr) {
              const key = `loan_${loan.id}_${todayStr}_${currentTimeStr}`;
              if (!rungKeys.includes(key)) {
                setActiveAlarm({
                  id: loan.id,
                  title: `Loan EMI Reminder: ${loan.lenderOrBorrower} (EMI: ₹${loan.emiAmount})`,
                  type: 'custom',
                  time: loan.dueTime,
                  alarmType: loan.alarmType || 'Vibration & Ringtone'
                });
                setRungKeys(prev => [...prev, key]);
                triggerSystemNotification("Loan EMI Due Today", `${loan.lenderOrBorrower} (₹${loan.emiAmount})`);
                if (loan.alarmType !== 'Vibration Only') {
                  playAlarmSound('custom');
                }
                if ((loan.alarmType === 'Vibration Only' || loan.alarmType === 'Vibration & Ringtone') && navigator.vibrate) {
                  navigator.vibrate([200, 100, 200, 100, 200]);
                }
              }
            }
          }
        });
      }

      // Check Extra Sunnah Prayers Alarms
      if (state.extraPrayers) {
        state.extraPrayers.forEach(prayer => {
          if (prayer.alarmEnabled && prayer.time === currentTimeStr) {
            const matchesRepeat = 
              !prayer.repeat || 
              prayer.repeat === 'Once' ||
              prayer.repeat === 'Every day' || 
              (prayer.repeat === 'Monday to Friday' && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dayOfWeek)) ||
              (prayer.repeat === 'Custom' && prayer.repeatCustomDays?.includes(dayOfWeek));

            if (matchesRepeat) {
              const key = `sunnah_${prayer.id}_${todayStr}_${currentTimeStr}`;
              if (!rungKeys.includes(key)) {
                setActiveAlarm({
                  id: prayer.id,
                  title: `Sunnah Prayer: ${prayer.name}`,
                  type: 'custom',
                  time: prayer.time,
                  alarmType: prayer.alarmType || 'Vibration & Ringtone'
                });
                setRungKeys(prev => [...prev, key]);
                triggerSystemNotification(`Sunnah Prayer: ${prayer.name}`, `Time for ${prayer.name} (${prayer.time})`);
                if (prayer.alarmType !== 'Vibration Only') {
                  playAlarmSound('custom');
                }
                if ((prayer.alarmType === 'Vibration Only' || prayer.alarmType === 'Vibration & Ringtone') && navigator.vibrate) {
                  navigator.vibrate([200, 100, 200, 100, 200]);
                }
              }
            }
          }
        });
      }

      // Check Dhikr Alarms
      if (state.dhikrs) {
        state.dhikrs.forEach(dhikr => {
          if (dhikr.alarmEnabled && dhikr.time === currentTimeStr) {
            const matchesRepeat = 
              !dhikr.repeat || 
              dhikr.repeat === 'Once' ||
              dhikr.repeat === 'Every day' || 
              (dhikr.repeat === 'Monday to Friday' && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dayOfWeek)) ||
              (dhikr.repeat === 'Custom' && dhikr.repeatCustomDays?.includes(dayOfWeek));

            if (matchesRepeat) {
              const key = `dhikr_${dhikr.id}_${todayStr}_${currentTimeStr}`;
              if (!rungKeys.includes(key)) {
                setActiveAlarm({
                  id: dhikr.id,
                  title: `Dhikr Reminder: ${dhikr.name}`,
                  type: 'custom',
                  time: dhikr.time || '',
                  alarmType: dhikr.alarmType || 'Vibration & Ringtone'
                });
                setRungKeys(prev => [...prev, key]);
                triggerSystemNotification(`Dhikr Reminder: ${dhikr.name}`, `Time to recite ${dhikr.name} (Target: ${dhikr.targetCount})`);
                if (dhikr.alarmType !== 'Vibration Only') {
                  playAlarmSound('custom');
                }
                if ((dhikr.alarmType === 'Vibration Only' || dhikr.alarmType === 'Vibration & Ringtone') && navigator.vibrate) {
                  navigator.vibrate([200, 100, 200, 100, 200]);
                }
              }
            }
          }
        });
      }

      // Helper to add minutes to HH:MM
      const addMinutes = (timeStr: string, mins: number) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        d.setMinutes(d.getMinutes() + mins);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      };

      // 4. Check Prayer Alarms
      const prayerAlarms = state.prayerAlarms || {};
      const prayersToday = state.prayers.find(p => p.date === todayStr);
      const currentTimes = calculatePrayerTimes(todayStr, state.prayerSettings);

      const prayersList: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      prayersList.forEach(prayer => {
        const isAlarmOn = prayerAlarms[prayer] !== false;
        const isDone = prayersToday?.completed[prayer] === true;
        const pTime = currentTimes[prayer];
        
        // Calculate Iqamah and Pre-Iqamah Alarm time
        const iqamahOffset = (state.prayerSettings.iqamahOffsets && state.prayerSettings.iqamahOffsets[prayer]) || 0;
        const alarmOffset = (state.prayerSettings.alarmOffsets && state.prayerSettings.alarmOffsets[prayer]) || 0;
        
        const iqamahTime = addMinutes(pTime, iqamahOffset);
        const alarmTime = addMinutes(iqamahTime, -alarmOffset);

        // Standard Adhan Alarm (if enabled and it's time)
        if (isAlarmOn && !isDone && pTime === currentTimeStr) {
          const key = `prayer_adhan_${prayer}_${todayStr}_${currentTimeStr}`;
          if (!rungKeys.includes(key)) {
            setActiveAlarm({
              id: `prayer_adhan_${prayer}`,
              title: `${prayer} Adhan: Time to offer your prayers!`,
              type: 'prayer',
              time: pTime,
              originalId: prayer
            });
            setRungKeys(prev => [...prev, key]);
            triggerSystemNotification(`${prayer} Adhan`, `Time to offer your ${prayer} prayer!`);
            playAlarmSound('prayer');
          }
        }

        // Custom Iqamah Pre-Alarm
        if (isAlarmOn && !isDone && alarmOffset > 0 && alarmTime === currentTimeStr) {
          const key = `prayer_iqamah_alarm_${prayer}_${todayStr}_${currentTimeStr}`;
          if (!rungKeys.includes(key)) {
            setActiveAlarm({
              id: `prayer_iqamah_${prayer}`,
              title: `${prayer} Iqamah in ${alarmOffset} mins!`,
              type: 'prayer',
              time: alarmTime,
              originalId: prayer
            });
            setRungKeys(prev => [...prev, key]);
            triggerSystemNotification(`${prayer} Iqamah Pre-Alarm`, `${prayer} Iqamah in ${alarmOffset} mins!`);
            playAlarmSound('prayer');
          }
        }
      });
    };

    const alarmInterval = setInterval(checkAlarms, 2000);
    return () => clearInterval(alarmInterval);
  }, [state, rungKeys]);

  const handleUpdateState = (newState: LifeOSState) => {
    setState(newState);
    saveState(newState);
  };

  const lang = state.language || 'en';
  const t = (key: any) => getTranslation(key, lang);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'planner', label: t('planner'), icon: Calendar },
    { id: 'finance', label: t('finance'), icon: IndianRupee },
    { id: 'prayer', label: t('prayer'), icon: Compass },
    { id: 'health', label: t('health'), icon: Activity },
    { id: 'reports', label: t('reports'), icon: Award },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const bottomNavItems = [
    { id: 'dashboard', label: lang === 'ml' ? 'ഹോം' : 'Home', shortLabel: lang === 'ml' ? 'ഹോം' : 'Home', icon: LayoutDashboard },
    { id: 'planner', label: lang === 'ml' ? 'പ്ലാനർ' : 'Daily', shortLabel: lang === 'ml' ? 'പ്ലാനർ' : 'Daily', icon: Calendar },
    { id: 'finance', label: lang === 'ml' ? 'പേഴ്സണൽ' : 'Personal', shortLabel: lang === 'ml' ? 'പേഴ്സണൽ' : 'Personal', icon: IndianRupee },
    { id: 'prayer', label: lang === 'ml' ? 'പ്രാർത്ഥന' : 'Prayer', shortLabel: lang === 'ml' ? 'പ്രാർത്ഥന' : 'Prayer', icon: Compass },
    { id: 'settings', label: lang === 'ml' ? 'ക്രമീകരണങ്ങൾ' : 'Settings', shortLabel: lang === 'ml' ? 'ക്രമീകരണങ്ങൾ' : 'Settings', icon: Settings },
  ];

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Alarm action: Snooze for 5 minutes
  const handleSnoozeAlarm = () => {
    if (!activeAlarm) return;
    stopAlarmSound();

    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const snoozedHrsStr = String(now.getHours()).padStart(2, '0');
    const snoozedMinsStr = String(now.getMinutes()).padStart(2, '0');
    const snoozedTimeStr = `${snoozedHrsStr}:${snoozedMinsStr}`;

    if (activeAlarm.type === 'custom') {
      const updatedCustom = (state.customAlarms || []).map(a => {
        if (a.id === activeAlarm.id) {
          return { ...a, snoozedUntil: snoozedTimeStr };
        }
        return a;
      });
      handleUpdateState({ ...state, customAlarms: updatedCustom });
    } else if (activeAlarm.type === 'task') {
      const updatedTasks = state.tasks.map(t => {
        if (t.id === activeAlarm.id) {
          return { ...t, dueTime: snoozedTimeStr };
        }
        return t;
      });
      handleUpdateState({ ...state, tasks: updatedTasks });
    } else if (activeAlarm.type === 'bill') {
      const updatedBills = state.bills.map(b => {
        if (b.id === activeAlarm.id) {
          return { ...b, dueTime: snoozedTimeStr };
        }
        return b;
      });
      handleUpdateState({ ...state, bills: updatedBills });
    }

    setActiveAlarm(null);
    confetti({ particleCount: 20, spread: 25 });
  };

  // Alarm action: Stop & Mark as completed/paid/off
  const handleStopAlarm = () => {
    if (!activeAlarm) return;
    stopAlarmSound();

    const todayStr = new Date().toISOString().split('T')[0];

    if (activeAlarm.type === 'task') {
      const updatedTasks = state.tasks.map(t => {
        if (t.id === activeAlarm.id) {
          return { ...t, completed: true };
        }
        return t;
      });
      handleUpdateState({ ...state, tasks: updatedTasks });
      confetti({ particleCount: 40, spread: 45 });
    } else if (activeAlarm.type === 'bill') {
      // Find a bank account if available to pay
      const defaultAccountId = state.accounts[0]?.id || '';
      if (defaultAccountId) {
        const bill = state.bills.find(b => b.id === activeAlarm.id);
        if (bill) {
          // Pay the bill automatically
          const updatedBills = state.bills.map(b => b.id === activeAlarm.id ? { ...b, paid: true } : b);
          const updatedAccounts = state.accounts.map(acc => acc.id === defaultAccountId ? { ...acc, balance: acc.balance - bill.amount } : acc);
          handleUpdateState({
            ...state,
            bills: updatedBills,
            accounts: updatedAccounts,
            transactions: [
              {
                id: `tx-${Date.now()}`,
                type: 'Expense',
                amount: bill.amount,
                description: `Auto-Paid: ${bill.title}`,
                category: bill.category,
                accountId: defaultAccountId,
                date: todayStr
              },
              ...state.transactions
            ]
          });
          confetti({ particleCount: 50, spread: 50 });
        }
      } else {
        const updatedBills = state.bills.map(b => b.id === activeAlarm.id ? { ...b, paid: true } : b);
        handleUpdateState({ ...state, bills: updatedBills });
      }
    } else if (activeAlarm.type === 'prayer' && activeAlarm.originalId) {
      const prayerName = activeAlarm.originalId as PrayerName;
      let updatedPrayers = [...state.prayers];
      const index = updatedPrayers.findIndex(p => p.date === todayStr);
      if (index >= 0) {
        updatedPrayers[index] = {
          ...updatedPrayers[index],
          completed: { ...updatedPrayers[index].completed, [prayerName]: true }
        };
      } else {
        updatedPrayers.push({
          date: todayStr,
          completed: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false, [prayerName]: true }
        });
      }
      handleUpdateState({ ...state, prayers: updatedPrayers });
      confetti({ particleCount: 40, spread: 40 });
    } else if (activeAlarm.type === 'custom') {
      // Turn off snooze and reset
      const updatedCustom = (state.customAlarms || []).map(a => {
        if (a.id === activeAlarm.id) {
          return { ...a, snoozedUntil: undefined };
        }
        return a;
      });
      handleUpdateState({ ...state, customAlarms: updatedCustom });
    }

    setActiveAlarm(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} onUpdateState={handleUpdateState} onNavigate={handleNavigate} />;
      case 'planner':
        return <Planner state={state} onUpdateState={handleUpdateState} subTab={plannerSubTab} onSubTabChange={setPlannerSubTab} />;
      case 'finance':
        return <Finance state={state} onUpdateState={handleUpdateState} subTab={financeSubTab} onSubTabChange={setFinanceSubTab} />;
      case 'prayer':
        return <Prayer state={state} onUpdateState={handleUpdateState} subTab={prayerSubTab} onSubTabChange={setPrayerSubTab} />;
      case 'health':
        return <Health state={state} onUpdateState={handleUpdateState} />;
      case 'reports':
        return <Reports state={state} onUpdateState={handleUpdateState} />;
      case 'settings':
        return <SettingsComponent state={state} onUpdateState={handleUpdateState} onNavigate={handleNavigate} />;
      default:
        return <Dashboard state={state} onUpdateState={handleUpdateState} onNavigate={handleNavigate} />;
    }
  };

  const activeLabel = navItems.find(item => item.id === activeTab)?.label || 'Dashboard';

  // FAB Customize Mappings
  const fabSizeClasses = {
    small: { btn: 'h-11 w-11', icon: 'h-5 w-5', text: 'text-[10px]' },
    medium: { btn: 'h-14 w-14', icon: 'h-6 w-6', text: 'text-xs' },
    large: { btn: 'h-16 w-16', icon: 'h-7 w-7', text: 'text-sm' },
  };
  const currentFabSize = state.fabSettings?.size || 'medium';
  const fabSizeConfig = fabSizeClasses[currentFabSize as 'small' | 'medium' | 'large'] || fabSizeClasses.medium;

  const fabColorClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30 text-white',
    sky: 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/30 text-white',
    emerald: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30 text-white',
    rose: 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/30 text-white',
    slate: 'bg-slate-600 hover:bg-slate-500 shadow-slate-500/30 text-white',
  };
  const activeFabColorClass = fabColorClasses[state.fabSettings?.color || 'indigo'] || fabColorClasses.indigo;

  return (
    <div className="flex h-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 lg:pb-0 transition-colors duration-200" id="app_root">
      
      {/* Sidebar Overlay and Collapsible Panel */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          id="sidebar_backdrop"
        />
      )}

      {/* Unified Sidebar Container */}
      <aside 
        onMouseEnter={() => setHoveringSidebar(true)}
        onMouseLeave={() => setHoveringSidebar(false)}
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 transition-all duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        id="collapsible_sidebar"
      >
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md animate-pulse">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none">Livelife</h1>
              <span className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold font-mono">Personal Life OS</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>

                {isActive && item.id === 'planner' && (
                  <div className="pl-8 pr-2 py-1 space-y-1 border-l-2 border-indigo-200 dark:border-indigo-900 ml-6 animate-fade-in">
                    <button
                      onClick={() => setPlannerSubTab('tasks')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        plannerSubTab === 'tasks' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      ✓ {lang === 'ml' ? 'ദിവസേനയുള്ള കാര്യങ്ങൾ' : 'Daily Agenda'}
                    </button>
                    <button
                      onClick={() => setPlannerSubTab('habits')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        plannerSubTab === 'habits' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      ⟲ {lang === 'ml' ? 'ശീലങ്ങൾ' : 'Habits Loop'}
                    </button>
                  </div>
                )}

                {isActive && item.id === 'finance' && (
                  <div className="pl-8 pr-2 py-1 space-y-1 border-l-2 border-indigo-200 dark:border-indigo-900 ml-6 animate-fade-in">
                    <button
                      onClick={() => setFinanceSubTab('overview')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        financeSubTab === 'overview' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      📊 {lang === 'ml' ? 'ധനകാര്യ അവലോകനം' : 'Finance Overview'}
                    </button>
                    <button
                      onClick={() => setFinanceSubTab('transactions')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        financeSubTab === 'transactions' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      ₹ {lang === 'ml' ? 'വരവ് ചിലവ് രേഖകൾ' : 'Ledger Activity'}
                    </button>
                    <button
                      onClick={() => setFinanceSubTab('bills')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        financeSubTab === 'bills' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      ⏰ {lang === 'ml' ? 'ബില്ലുകൾ' : 'Upcoming Bills'}
                    </button>
                    <button
                      onClick={() => setFinanceSubTab('accounts')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        financeSubTab === 'accounts' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      💳 {lang === 'ml' ? 'അക്കൗണ്ടുകൾ' : 'Capital Accounts'}
                    </button>
                    <button
                      onClick={() => setFinanceSubTab('debts-loans')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        financeSubTab === 'debts-loans' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      % {lang === 'ml' ? 'കടം & ലോൺ' : 'Debts & Loans'}
                    </button>
                    <button
                      onClick={() => setFinanceSubTab('budgets')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        financeSubTab === 'budgets' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      🎯 {lang === 'ml' ? 'ബഡ്ജറ്റുകൾ' : 'Monthly Budgets'}
                    </button>
                  </div>
                )}

                {isActive && item.id === 'prayer' && (
                  <div className="pl-8 pr-2 py-1 space-y-1 border-l-2 border-indigo-200 dark:border-indigo-900 ml-6 animate-fade-in">
                    <button
                      onClick={() => setPrayerSubTab('tracker')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        prayerSubTab === 'tracker' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      🧭 {lang === 'ml' ? 'പ്രാർത്ഥന സമയം' : 'Prayer Tracker'}
                    </button>
                    <button
                      onClick={() => setPrayerSubTab('sunnah-dhikr')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        prayerSubTab === 'sunnah-dhikr' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      📿 {lang === 'ml' ? 'സുന്നത്ത് & ദിക്ർ' : 'Sunnah & Dhikr'}
                    </button>
                    <button
                      onClick={() => setPrayerSubTab('settings')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        prayerSubTab === 'settings' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      ⚙ {lang === 'ml' ? 'കണക്കുകൂട്ടൽ രീതി' : 'Calc Engine'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Auto Collapse Visual indicator */}
        {autoHideEnabled && sidebarOpen && !hoveringSidebar && (
          <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
              <span>Auto-closing in {autoHideDelay}s</span>
              <span>{Math.round(autoCollapseProgress / 10)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-100"
                style={{ width: `${autoCollapseProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Settings Widget inside Menu */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/40 text-center">
          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-[10px] font-mono text-slate-500">Auto-collapse menu:</span>
              <button
                onClick={() => {
                  handleUpdateState({ ...state, menuAutoHide: !autoHideEnabled });
                }}
                className={`text-[9px] uppercase px-1.5 py-0.5 font-bold rounded ${
                  autoHideEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {autoHideEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            {autoHideEnabled && (
              <div className="w-full px-2 flex items-center gap-2 justify-center">
                <span className="text-[9px] font-mono text-slate-500">Delay:</span>
                <input 
                  type="range" 
                  min="3" 
                  max="15" 
                  value={autoHideDelay}
                  onChange={(e) => {
                    handleUpdateState({ ...state, menuHideDelay: parseInt(e.target.value) });
                  }}
                  className="w-20 accent-indigo-500 h-1 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
                <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{autoHideDelay}s</span>
              </div>
            )}
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-600 mt-1">Livelife OS • offline sandbox</span>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Standalone Application Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-40 transition-colors duration-200 shadow-sm shadow-slate-100/50 dark:shadow-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="hidden lg:flex p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200/40 dark:border-slate-700/50 cursor-pointer shadow-sm shadow-slate-100/10"
              title="Open Navigation Menu"
              id="sidebar_toggle_button"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  {activeLabel}
                </h2>
                <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">Standalone Mode</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Realtime alarm engine status */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/30 font-mono animate-pulse">
              <Bell className="w-3 h-3 text-indigo-500 inline" /> Engine Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {activeLabel} Active
            </span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-display font-semibold text-xs text-slate-700 dark:text-slate-300">
              J
            </div>
          </div>
        </header>

        {/* Dynamic Standalone Route/View Container */}
        <main className="flex-1 px-4 md:px-6 py-6 max-w-7xl w-full mx-auto" id="standalone_view_container">
          {renderContent()}
        </main>
      </div>

      {/* Floating Action Button (FAB) for Mobile - Floating Speed Dial Menu */}
      <motion.div 
        drag
        dragMomentum={false}
        dragConstraints={dragConstraints}
        className="fixed bottom-24 right-6 z-40 lg:hidden flex touch-none select-none"
        style={{ opacity: fabMenuOpen ? 1.0 : (state.fabSettings?.opacity ?? 1.0) }}
      >
        {/* Expanded FAB Sub-tabs Menu with Motion/React Spring Animations */}
        <AnimatePresence>
          {fabMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: fabDirection.startsWith('down') ? -20 : 20, originX: fabDirection.endsWith('right') ? 0 : 1, originY: fabDirection.startsWith('down') ? 0 : 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: fabDirection.startsWith('down') ? -20 : 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 24 }}
              className={`absolute bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3.5 rounded-3xl shadow-2xl flex flex-col gap-2.5 min-w-[200px] border-slate-200/60 z-50 ${
                fabDirection.endsWith('right') ? 'left-0' : 'right-0'
              } ${
                fabDirection.startsWith('down') ? 'top-[calc(100%+12px)]' : 'bottom-[calc(100%+12px)]'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 mb-1 block">
                {activeTab === 'planner'
                  ? (lang === 'ml' ? 'പ്ലാനർ ഉപവിഭാഗങ്ങൾ' : 'Daily Sub-Tabs')
                  : activeTab === 'finance'
                  ? (lang === 'ml' ? 'ധനകാര്യ ഉപവിഭാഗങ്ങൾ' : 'Finance Sub-Tabs')
                  : activeTab === 'prayer'
                  ? (lang === 'ml' ? 'പ്രാർത്ഥന ഉപവിഭാഗങ്ങൾ' : 'Prayer Sub-Tabs')
                  : (lang === 'ml' ? 'ദ്രുത പ്രവൃത്തികൾ' : 'Quick Actions')}
              </span>
              
              {activeTab === 'planner' && (
                <>
                  <button
                    onClick={() => { setPlannerSubTab('tasks'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      plannerSubTab === 'tasks' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'ദിവസേനയുള്ള കാര്യങ്ങൾ' : 'Daily Planner'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'കാര്യങ്ങൾ നിയന്ത്രിക്കക്കുക' : 'Manage daily agenda'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setPlannerSubTab('habits'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      plannerSubTab === 'habits' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'ശീലങ്ങൾ' : 'Habits Loop'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'നല്ല ശീലങ്ങൾ വളർത്തുക' : 'Build good routines'}</span>
                    </div>
                  </button>
                </>
              )}

              {activeTab === 'finance' && (
                <>
                  <button
                    onClick={() => { setFinanceSubTab('overview'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      financeSubTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'ധനകാര്യ അവലോകനം' : 'Overview Dashboard'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'ആകെ സാമ്പത്തിക സ്ഥിതി' : 'Total financial state'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setFinanceSubTab('transactions'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      financeSubTab === 'transactions' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <IndianRupee className="h-4 w-4 text-rose-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'രേഖകൾ' : 'Ledger'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'വരവ് ചിലവ് കണക്കുകൾ' : 'View cash flow logs'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setFinanceSubTab('bills'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      financeSubTab === 'bills' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Bell className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'ബില്ലുകൾ' : 'Pending Bills'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'അടയ്ക്കാനുള്ള ബില്ലുകൾ' : 'Track upcoming expenses'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setFinanceSubTab('accounts'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      financeSubTab === 'accounts' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'അക്കൗണ്ടുകൾ' : 'Capital Accounts'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'ബാങ്ക് അക്കൗണ്ടുകൾ' : 'Manage bank balance'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setFinanceSubTab('debts-loans'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      financeSubTab === 'debts-loans' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Percent className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'കടം & ലോൺ' : 'Debts & Loans'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'ലോണുകളും ബാധ്യതകളും' : 'Manage loans, EMI & debts'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setFinanceSubTab('budgets'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      financeSubTab === 'budgets' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Target className="h-4 w-4 text-rose-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'ബഡ്ജറ്റുകൾ' : 'Monthly Budgets'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'പരിധി നിശ്ചയിക്കുക' : 'Enforce spending caps'}</span>
                    </div>
                  </button>
                </>
              )}

              {activeTab === 'prayer' && (
                <>
                  <button
                    onClick={() => { setPrayerSubTab('tracker'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      prayerSubTab === 'tracker' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Compass className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'പ്രാർത്ഥന സമയം' : 'Prayer Tracker'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'പ്രാർത്ഥനകൾ രേഖപ്പെടുത്തുക' : 'Log daily prayers'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setPrayerSubTab('sunnah-dhikr'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      prayerSubTab === 'sunnah-dhikr' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Compass className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'സുന്നത്ത് & ദിക്ർ' : 'Sunnah & Dhikr'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'സുന്നത്ത് നിസ്കാരങ്ങളും ദിക്റുകളും' : 'Sunnah prayers & dhikr counters'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setPrayerSubTab('settings'); setFabMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      prayerSubTab === 'settings' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                      <Settings className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'കണക്കുകൂട്ടൽ രീതി' : 'Calculation Engine'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'കണക്കുകൂട്ടലുകൾ മാറ്റുക' : 'Adjust calculation methods'}</span>
                    </div>
                  </button>
                </>
              )}

              {/* General Fallback Actions for Home, Health, Reports, Settings */}
              {['dashboard', 'health', 'reports', 'settings'].includes(activeTab) && (
                <>
                  <button
                    onClick={() => { handleNavigate('planner'); setPlannerSubTab('tasks'); setFabMenuOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                  >
                    <Plus className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'കാര്യം ചേർക്കുക' : 'Add Task'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'പുതിയ കാര്യം നിർമ്മിക്കുക' : 'Create new planner task'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      const updatedMetrics = [...state.healthMetrics];
                      const todayStr = new Date().toISOString().split('T')[0];
                      const index = updatedMetrics.findIndex(h => h.date === todayStr);
                      if (index >= 0) {
                         updatedMetrics[index] = { ...updatedMetrics[index], waterIntakeMl: (updatedMetrics[index].waterIntakeMl || 0) + 250 };
                      } else {
                        updatedMetrics.push({ date: todayStr, steps: 0, sleepHours: 0, waterIntakeMl: 250 });
                      }
                      handleUpdateState({ ...state, healthMetrics: updatedMetrics });
                      confetti({ particleCount: 20, spread: 30, colors: ['#3b82f6', '#60a5fa'] });
                      setFabMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                  >
                    <Heart className="h-4 w-4 text-sky-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'പെട്ടെന്ന് വെള്ളം കുടിക്കുക (+250ml)' : 'Quick Hydrate (+250ml)'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'വെള്ളം കുടിക്കുന്നത് രേഖപ്പെടുത്തുക' : 'Log water intake'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
                      handleUpdateState({ ...state, theme: nextTheme });
                      setFabMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{lang === 'ml' ? 'ലൈറ്റ്/ഡാർക്ക് തീം മാറ്റുക' : 'Toggle Dark Mode'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ml' ? 'സ്റ്റൈൽ മാറ്റുക' : 'Change visual style'}</span>
                    </div>
                  </button>
                </>
              )}

              {/* Add New Button for supported tabs */}
              {['planner', 'finance'].includes(activeTab) && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                  <button 
                    onClick={() => { window.dispatchEvent(new CustomEvent('open-add-modal')); setFabMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    {lang === 'ml' ? 'പുതിയത് ചേർക്കുക' : 'Add New'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Floating Action Button */}
        <button
          onClick={handleFabClick}
          className={`${fabSizeConfig.btn} ${activeFabColorClass} rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer border-2 border-white dark:border-slate-900 relative z-10`}
          title="Floating Action Menu"
          id="mobile_fab"
        >
          <motion.div
            animate={{ 
              rotate: fabMenuOpen ? 135 : 0, 
              scale: fabMenuOpen ? 1.15 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex items-center justify-center transition-colors duration-200 ${fabMenuOpen ? 'text-amber-300' : 'text-white'}`}
          >
            <Sparkles className={fabSizeConfig.icon} />
          </motion.div>
        </button>
      </motion.div>

      {/* Mobile Floating Bottom Navigation - Completely redone to match standalone application aesthetics */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden px-3 py-2 flex items-center justify-around shadow-lg transition-colors duration-200">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold scale-105' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-bold tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Ringing Alarm Modal Overlay */}
      {activeAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" id="ringing_alarm_overlay">
          <motion.div 
            animate={
              (activeAlarm.alarmType === 'Vibration Only' || activeAlarm.alarmType === 'Vibration & Ringtone')
                ? {
                    x: [-4, 4, -4, 4, -4, 4, -4, 4, 0],
                    y: [-1.5, 1.5, -1.5, 1.5, -1.5, 1.5, -1.5, 1.5, 0],
                  }
                : {}
            }
            transition={
              (activeAlarm.alarmType === 'Vibration Only' || activeAlarm.alarmType === 'Vibration & Ringtone')
                ? {
                    repeat: Infinity,
                    duration: 0.25,
                    ease: "linear"
                  }
                : {}
            }
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-6 relative overflow-hidden"
          >
            {/* Visual background pulse effect */}
            <div className="absolute inset-0 bg-indigo-500/5 animate-ping pointer-events-none rounded-3xl" />

            <div className="flex justify-center">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full animate-bounce">
                <Bell className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-xs font-bold font-mono rounded-full uppercase tracking-widest animate-pulse">
                ⏰ {activeAlarm.alarmType ? activeAlarm.alarmType : 'Alarm Ringing'}
              </span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-slate-50 tracking-tight leading-tight px-2">
                {activeAlarm.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold flex items-center justify-center gap-1.5 font-mono">
                <Clock className="h-4 w-4" /> Triggered at {activeAlarm.time}
              </p>
            </div>

            {/* Alarm Action Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSnoozeAlarm}
                className="w-full py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-2xl transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700 flex items-center justify-center gap-2"
              >
                <Clock className="h-4 w-4" /> Snooze 5m
              </button>
              <button
                onClick={handleStopAlarm}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Square className="h-4 w-4" /> Stop & Dismiss
              </button>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal">
              Press Stop to mark this schedule as done or snooze to remind again shortly.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
