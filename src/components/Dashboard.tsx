import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckSquare, 
  Calendar, 
  IndianRupee, 
  Compass, 
  Activity, 
  Droplet, 
  TrendingUp, 
  Award, 
  Moon, 
  Sparkles,
  ChevronRight,
  Clock,
  Plus,
  Footprints,
  Trophy,
  Target
} from 'lucide-react';
import { LifeOSState, Task, Habit, Transaction, PrayerName, HealthMetric } from '../types';
import { calculatePrayerTimes, isBeforeTime, getHijriDate } from '../utils/prayerCalc';
import confetti from 'canvas-confetti';
import { getTranslation, formatString } from '../utils/translations';

interface DashboardProps {
  state: LifeOSState;
  onUpdateState: (newState: LifeOSState) => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ state, onUpdateState, onNavigate }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const lang = state.language || 'en';
  const t = (key: any) => getTranslation(key, lang);
  
  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = currentTime.toISOString().split('T')[0];

  // 1. Core metrics calculations
  // Tasks
  const todayTasks = state.tasks.filter(t => t.dueDate === todayStr);
  const completedTasksCount = todayTasks.filter(t => t.completed).length;
  const totalTasksCount = todayTasks.length;
  const taskProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Habits
  const todayHabitCompletions = state.habits.map(h => {
    const isCompleted = h.completions.includes(todayStr);
    return { ...h, isCompleted };
  });
  const completedHabitsCount = todayHabitCompletions.filter(h => h.isCompleted).length;
  const totalHabitsCount = state.habits.length;
  const habitProgress = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  // Finance Summary
  const totalBalance = state.accounts.reduce((acc, current) => acc + current.balance, 0);
  const monthTransactions = state.transactions.filter(t => t.date.substring(0, 7) === todayStr.substring(0, 7));
  const monthIncome = monthTransactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
  const monthExpense = monthTransactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);

  // Health Stats
  const todayHealth: HealthMetric = state.healthMetrics.find(h => h.date === todayStr) || {
    date: todayStr,
    steps: 0,
    sleepHours: 0,
    waterIntakeMl: 0
  };

  // Prayer calculations
  const prayersToday = state.prayers.find(p => p.date === todayStr) || {
    date: todayStr,
    completed: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }
  };

  const currentTimes = calculatePrayerTimes(todayStr, state.prayerSettings);

  // Real-time countdown calculation
  const getNextPrayerCountdown = () => {
    const currentHrs = currentTime.getHours();
    const currentMins = currentTime.getMinutes();
    const currentSecs = currentTime.getSeconds();
    const totalCurrentSecs = (currentHrs * 3600) + (currentMins * 60) + currentSecs;

    const prayerOrder: { name: PrayerName; time: string }[] = [
      { name: 'Fajr', time: currentTimes.Fajr },
      { name: 'Dhuhr', time: currentTimes.Dhuhr },
      { name: 'Asr', time: currentTimes.Asr },
      { name: 'Maghrib', time: currentTimes.Maghrib },
      { name: 'Isha', time: currentTimes.Isha }
    ];

    for (const p of prayerOrder) {
      const [pHrs, pMins] = p.time.split(':').map(Number);
      const totalPrayerSecs = (pHrs * 3600) + (pMins * 60);
      
      if (totalPrayerSecs > totalCurrentSecs) {
        const diffSecs = totalPrayerSecs - totalCurrentSecs;
        const diffHrs = Math.floor(diffSecs / 3600);
        const diffMins = Math.floor((diffSecs % 3600) / 60);
        const remainingSecs = diffSecs % 60;
        return {
          name: p.name,
          time: p.time,
          countdown: `${diffHrs > 0 ? `${diffHrs}h ` : ''}${diffMins}m ${remainingSecs}s`
        };
      }
    }

    // Default to Fajr tomorrow
    const [fHrs, fMins] = currentTimes.Fajr.split(':').map(Number);
    const totalFajrSecsTomorrow = (fHrs * 3600) + (fMins * 60) + (24 * 3600);
    const diffSecs = totalFajrSecsTomorrow - totalCurrentSecs;
    const diffHrs = Math.floor(diffSecs / 3600);
    const diffMins = Math.floor((diffSecs % 3600) / 60);
    const remainingSecs = diffSecs % 60;
    return {
      name: 'Fajr' as PrayerName,
      time: currentTimes.Fajr,
      countdown: `${diffHrs > 0 ? `${diffHrs}h ` : ''}${diffMins}m ${remainingSecs}s (Tomorrow)`
    };
  };

  const nextPrayerInfo = getNextPrayerCountdown();

  // Quick complete prayer on dashboard
  const handleTogglePrayer = (prayer: PrayerName) => {
    const updatedPrayers = [...state.prayers];
    const index = updatedPrayers.findIndex(p => p.date === todayStr);
    
    if (index >= 0) {
      updatedPrayers[index] = {
        ...updatedPrayers[index],
        completed: {
          ...updatedPrayers[index].completed,
          [prayer]: !updatedPrayers[index].completed[prayer]
        }
      };
    } else {
      updatedPrayers.push({
        date: todayStr,
        completed: {
          Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false,
          [prayer]: true
        }
      });
    }

    onUpdateState({
      ...state,
      prayers: updatedPrayers
    });
    confetti({ particleCount: 30, spread: 35, colors: ['#10b981', '#34d399'] });
  };

  // Quick task adder on dashboard
  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: quickTaskTitle.trim(),
      completed: false,
      dueDate: todayStr,
      category: 'Personal'
    };

    onUpdateState({
      ...state,
      tasks: [newTask, ...state.tasks]
    });

    setQuickTaskTitle('');
    confetti({ particleCount: 30, spread: 30 });
  };

  // Quick hydration logger
  const handleQuickAddWater = (amountMl: number) => {
    const updatedMetrics = [...state.healthMetrics];
    const index = updatedMetrics.findIndex(h => h.date === todayStr);

    if (index >= 0) {
      updatedMetrics[index] = {
        ...updatedMetrics[index],
        waterIntakeMl: (updatedMetrics[index].waterIntakeMl || 0) + amountMl
      };
    } else {
      updatedMetrics.push({
        date: todayStr,
        steps: 0,
        sleepHours: 0,
        waterIntakeMl: amountMl
      });
    }

    onUpdateState({
      ...state,
      healthMetrics: updatedMetrics
    });

    confetti({ particleCount: 30, spread: 40, colors: ['#3b82f6', '#60a5fa'] });
  };

  // Hijri Date
  const hijri = getHijriDate(currentTime);

  // Rule-based offline recommendations
  const getInsights = () => {
    const insights = [];
    if (todayHealth.steps < 6000) {
      insights.push({
        icon: 'steps-behind',
        title: lang === 'ml' ? 'നടത്തം ലക്ഷ്യത്തിന് പിന്നിലാണ്' : 'Step Target is Behind',
        desc: lang === 'ml' 
          ? `നിങ്ങൾ ${todayHealth.steps.toLocaleString()} ചുവടുകൾ പൂർത്തിയാക്കി. അല്പം നേരം നടക്കുന്നത് നിങ്ങളുടെ ഉന്മേഷം വർദ്ധിപ്പിക്കും!` 
          : `You have completed ${todayHealth.steps.toLocaleString()} steps. A brief 10-minute walk will boost focus!`,
        color: 'text-amber-600 bg-amber-50 hover:bg-amber-100'
      });
    } else if (todayHealth.steps >= 10000) {
      insights.push({
        icon: 'steps-ahead',
        title: lang === 'ml' ? 'വളരെ മികച്ച നടത്തം!' : 'Outstanding Walking!',
        desc: lang === 'ml'
          ? `അതിശയകരം! നിങ്ങൾ 10,000 ചുവടുകൾ പിന്നിട്ടു. ഇന്ന് നിങ്ങൾ ആകെ നടന്നത് ${todayHealth.steps.toLocaleString()} ചുവടുകൾ.`
          : `Amazing job! You passed the 10,000 steps milestone with ${todayHealth.steps.toLocaleString()} steps.`,
        color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
      });
    }

    if (todayHealth.waterIntakeMl < 2000) {
      insights.push({
        icon: 'water',
        title: lang === 'ml' ? 'വെള്ളം കുടിക്കാനുള്ള മുന്നറിയിപ്പ്' : 'Hydration Advisory',
        desc: lang === 'ml'
          ? `ഇതുവരെ ${todayHealth.waterIntakeMl}മില്ലി വെള്ളം മാത്രമാണ് കുടിച്ചത്. ക്ഷീണം ഒഴിവാക്കാൻ ഇപ്പോൾ തന്നെ ഒരു ഗ്ലാസ്സ് വെള്ളം കുടിക്കൂ.`
          : `Logged ${todayHealth.waterIntakeMl}ml of water. Fill up a 500ml glass now to prevent brain fog.`,
        color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
      });
    }

    if (totalTasksCount > 0 && taskProgress < 50) {
      insights.push({
        icon: 'tasks',
        title: lang === 'ml' ? 'ടാസ്കുകളിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുക' : 'Task Focus Block',
        desc: lang === 'ml'
          ? `ഇന്നത്തേക്ക് നിങ്ങൾക്ക് ചെയ്യാൻ ${totalTasksCount - completedTasksCount} ടാസ്കുകൾ ബാക്കിയുണ്ട്. എളുപ്പമുള്ളതിൽ നിന്ന് തുടങ്ങുക!`
          : `You have ${totalTasksCount - completedTasksCount} pending tasks for today. Start with the easiest one!`,
        color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
      });
    }

    const completedPrayerCount = Object.values(prayersToday.completed).filter(Boolean).length;
    if (completedPrayerCount === 5) {
      insights.push({
        icon: 'prayer',
        title: lang === 'ml' ? 'ആത്മീയ സായൂജ്യം' : 'Spiritual Synergy',
        desc: lang === 'ml'
          ? 'സുബ്ഹാൻ അല്ലാഹ്! ഇന്നത്തെ അഞ്ച് സമയത്തെ നിസ്കാരങ്ങളും നിങ്ങൾ ലോഗ് ചെയ്തിരിക്കുന്നു. ഉത്തമമായ അച്ചടക്കം!'
          : 'SubhanAllah! All five daily prayers logged. Excellent commitment to mindfulness and faith.',
        color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
      });
    }

    if (state.accounts.some(a => a.balance < 5000)) {
      const lowAcc = state.accounts.find(a => a.balance < 5000);
      insights.push({
        icon: 'finance',
        title: lang === 'ml' ? 'പണലഭ്യത മുന്നറിയിപ്പ്' : 'Liquidity Alert',
        desc: lang === 'ml'
          ? `"${lowAcc?.name}" ബാലൻസ് വെറും ₹${lowAcc?.balance.toLocaleString()} മാത്രമാണ്. അക്കൗണ്ടുകൾ റീചാർജ്ജ് ചെയ്തു സൂക്ഷിക്കുക.`
          : `"${lowAcc?.name}" balance is only ₹${lowAcc?.balance.toLocaleString()}. Keep UPI accounts funded.`,
        color: 'text-rose-600 bg-rose-50 hover:bg-rose-100'
      });
    }

    // Debts & Loans due date notifications
    const today = new Date();
    today.setHours(0,0,0,0);
    const debtsList = state.debts || [];
    debtsList.forEach(debt => {
      if (debt.status === 'Pending' && debt.dueDate) {
        const dueDateObj = new Date(debt.dueDate);
        dueDateObj.setHours(0,0,0,0);
        const diffTime = dueDateObj.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7) {
          const isOverdue = diffDays < 0;
          const phoneSuffix = debt.phoneNumber ? ` (📞 ${debt.phoneNumber})` : '';
          
          insights.push({
            icon: 'finance',
            title: isOverdue 
              ? (lang === 'ml' ? 'കടം തിരിച്ചടവ് തീയതി കഴിഞ്ഞു!' : 'Debt Repayment Overdue!')
              : (lang === 'ml' ? 'വരാനിരിക്കുന്ന കടം തിരിച്ചടവ്!' : 'Upcoming Debt Due!'),
            desc: isOverdue
              ? (lang === 'ml'
                ? `പ്രതീക്ഷിച്ച തീയതി കഴിഞ്ഞു: ${debt.personName}${phoneSuffix}-ൽ നിന്നുള്ള ₹${debt.amount.toLocaleString()} തിരിച്ചടവ് തീയതി (${debt.dueDate}) കഴിഞ്ഞിരിക്കുന്നു.`
                : `Expected date passed: The amount of ₹${debt.amount.toLocaleString()} for ${debt.personName}${phoneSuffix} was due on ${debt.dueDate}.`)
              : (lang === 'ml'
                ? `തിരിച്ചടവ് തീയതി അടുത്തു: ${debt.personName}${phoneSuffix}-ൽ നിന്നുള്ള ₹${debt.amount.toLocaleString()} കടം ${diffDays === 0 ? 'ഇന്നാണ്' : diffDays === 1 ? 'നാളെയാണ്' : `${diffDays} ദിവസങ്ങൾക്കുള്ളിലാണ്`}.`
                : `Due soon: The amount of ₹${debt.amount.toLocaleString()} for ${debt.personName}${phoneSuffix} is due in ${diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : `${diffDays} days`} (on ${debt.dueDate}).`),
            color: 'text-rose-600 bg-rose-50 hover:bg-rose-100'
          });
        }
      }
    });

    // Default general insight
    if (insights.length === 0) {
      insights.push({
        icon: 'default',
        title: lang === 'ml' ? 'ദിവസേനയുള്ള ക്രമീകരണം' : 'Daily Alignment',
        desc: lang === 'ml'
          ? 'നിങ്ങളുടെ എല്ലാ ആരോഗ്യ, ധനകാര്യ, പ്രാർത്ഥന ഇൻഡിക്കേറ്ററുകളും തികച്ചും സന്തുലിതമാണ്. ഇത് തുടരുക!'
          : 'All core indicators look excellent and fully balanced. Keep maintaining your health, finances and habits!',
        color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
      });
    }

    return insights;
  };

  const renderInsightIcon = (iconName: string) => {
    switch (iconName) {
      case 'steps-behind':
        return <Footprints className="h-5 w-5 text-amber-600" />;
      case 'steps-ahead':
        return <Trophy className="h-5 w-5 text-emerald-600" />;
      case 'water':
        return <Droplet className="h-5 w-5 text-blue-600" />;
      case 'tasks':
        return <Target className="h-5 w-5 text-indigo-600" />;
      case 'prayer':
        return <Sparkles className="h-5 w-5 text-purple-600" />;
      case 'finance':
        return <IndianRupee className="h-5 w-5 text-rose-600" />;
      default:
        return <Sparkles className="h-5 w-5 text-emerald-600" />;
    }
  };

  const activeInsights = getInsights();

  return (
    <div className="space-y-6" id="dashboard_root">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-br from-sky-50 via-sky-100/70 to-indigo-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-white p-6 rounded-2xl shadow-md border border-sky-100 dark:border-indigo-950 transition-all duration-300">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-200/50 dark:bg-indigo-500/20 text-sky-800 dark:text-indigo-200 border border-sky-300/40 dark:border-white/10 mb-3">
            <Sparkles className="h-3 w-3 animate-pulse text-sky-600 dark:text-indigo-300" /> {t('personal_command_center')}
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-slate-900 dark:text-white">
            {t('assalamu_alaikum')}, Jamia
          </h1>
          <p className="text-slate-600 dark:text-indigo-200 text-sm mt-1 max-w-md">
            {t('welcome_back')}
          </p>
        </div>
        
        {/* Dynamic Clock Section */}
        <div className="mt-4 md:mt-0 flex items-center gap-4 bg-white/80 dark:bg-white/5 backdrop-blur-md p-4 rounded-xl border border-sky-200/40 dark:border-white/10 shadow-sm shadow-sky-100/10">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold tracking-tight text-sky-900 dark:text-indigo-100">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-sky-800 dark:text-indigo-200 font-medium mt-0.5">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5 tracking-tight flex items-center justify-end gap-1">
              <Moon className="h-3.5 w-3.5 text-amber-500 shrink-0 inline" />
              <span>{hijri.day} {hijri.month} {hijri.year} AH</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-sky-100 dark:bg-indigo-500/10 text-sky-600 dark:text-indigo-300 border border-sky-200 dark:border-indigo-500/20">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Animated Task Completion Progress Tracker */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4"
        id="dashboard_task_progress_tracker"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-slate-900 tracking-tight">
                {t('daily_task_alignment')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('visual_summary_tasks')}
              </p>
            </div>
          </div>
          
          <div className="flex items-baseline gap-1 bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-100/30">
            <span className="text-2xl font-mono font-bold text-indigo-600">
              {taskProgress}%
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {t('complete')}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>{t('progress_meter')}</span>
            <span>
              {lang === 'ml' 
                ? `${totalTasksCount}ൽ ${completedTasksCount} കാര്യങ്ങൾ പൂർത്തിയാക്കി` 
                : `${completedTasksCount} of ${totalTasksCount} items completed`}
            </span>
          </div>
          
          {/* Main Animated Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${taskProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 h-full rounded-full relative"
            >
              {/* Highlight shine animation */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* Motivational Guidance & Extra Analytics */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs pt-1 border-t border-slate-50">
          <span className="text-slate-500 italic font-medium flex items-center gap-1 flex-wrap">
            {totalTasksCount === 0 ? (
              t('no_tasks_today')
            ) : taskProgress === 100 ? (
              <span className="flex items-center gap-1 flex-wrap">
                {t('all_conquered')} <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              </span>
            ) : taskProgress >= 75 ? (
              t('momentum')
            ) : taskProgress >= 50 ? (
              t('more_than_half')
            ) : taskProgress > 0 ? (
              t('good_start')
            ) : (
              t('ready_to_begin')
            )}
          </span>
          {totalTasksCount > 0 && (
            <span className="font-semibold text-indigo-600 shrink-0">
              {lang === 'ml' 
                ? `ഇന്നത്തേക്ക് ${totalTasksCount - completedTasksCount} ടാസ്ക് ബാക്കിയുണ്ട്` 
                : `${totalTasksCount - completedTasksCount} task${totalTasksCount - completedTasksCount !== 1 ? 's' : ''} left for today`}
            </span>
          )}
        </div>
      </motion.div>

      {/* Grid of Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Planner Card */}
        <div 
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors cursor-pointer group"
          onClick={() => onNavigate('planner')}
          id="dash_planner_card"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Calendar className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                {t('planner')}
              </span>
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-900">{t('todays_agenda')}</h3>
            <p className="text-slate-500 text-xs mt-1">{t('manage_plans')}</p>
            
            {/* Task summary */}
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>{t('tasks_completed')}</span>
                  <span>{completedTasksCount}/{totalTasksCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${taskProgress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-indigo-600 h-2 rounded-full" 
                  />
                </div>
              </div>

              {/* Habit Summary */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>{t('habits_tracker')}</span>
                  <span>{completedHabitsCount}/{totalHabitsCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${habitProgress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-emerald-500 h-2 rounded-full" 
                  />
                </div>
              </div>
            </div>

            {/* Inline Quick Task Creator */}
            <form onSubmit={handleQuickAddTask} onClick={(e) => e.stopPropagation()} className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
              <input 
                type="text" 
                placeholder={lang === 'ml' ? 'ഇന്നത്തെ ഒരു ടാസ്ക് എളുപ്പത്തിൽ ചേർക്കൂ...' : 'Quick add today\'s task...'}
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-800"
              />
              <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-indigo-600 text-xs font-semibold group-hover:text-indigo-800">
            <span>{t('open_planner')}</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Prayer Progress Card */}
        <div 
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors"
          id="dash_prayer_card"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Compass className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                {lang === 'ml' ? 'അടുത്ത സമയം' : 'Next'}: {lang === 'ml' ? t(nextPrayerInfo.name) : nextPrayerInfo.name} ({nextPrayerInfo.time})
              </span>
            </div>
            
            <h3 className="font-display font-semibold text-lg text-slate-900">{t('spiritual_engine')}</h3>
            <p className="text-slate-500 text-xs mt-1">
              {lang === 'ml' ? 'ബാക്കിയുള്ള സമയം' : 'Remaining'}: <span className="font-mono font-bold text-indigo-600">{nextPrayerInfo.countdown}</span>
            </p>
            
            {/* Quick check prayer dashboard buttons */}
            <div className="grid grid-cols-5 gap-1.5 mt-4">
              {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).map((pName) => {
                const isCompleted = prayersToday.completed[pName];
                return (
                  <button
                    key={pName}
                    onClick={() => handleTogglePrayer(pName)}
                    className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold shadow-sm' 
                        : 'bg-slate-50 border-slate-200/80 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[9px] font-bold block">{t(pName) || pName}</span>
                    <span className="mt-1 text-[10px] font-medium font-mono">
                      {isCompleted ? '✓' : currentTimes[pName]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div 
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-emerald-600 text-xs font-semibold hover:text-emerald-800 cursor-pointer group"
            onClick={() => onNavigate('prayer')}
          >
            <span>{t('open_prayer_engine')}</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Finance Card */}
        <div 
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors cursor-pointer group"
          onClick={() => onNavigate('finance')}
          id="dash_finance_card"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <IndianRupee className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full">
                {t('finance')}
              </span>
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-900">₹{totalBalance.toLocaleString('en-IN')}</h3>
            <p className="text-slate-500 text-xs mt-1">
              {lang === 'ml' ? 'ബാങ്ക്, യുപിഐ അക്കൗണ്ടുകളിലെ ആകെ ബാലൻസ്' : 'Total combined balance in bank & UPI accounts'}
            </p>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">
                  {lang === 'ml' ? 'ഈ മാസത്തെ വരവ്' : 'Month Income'}
                </div>
                <div className="text-sm font-semibold text-emerald-700">₹{monthIncome.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">
                  {lang === 'ml' ? 'ഈ മാസത്തെ ചിലവ്' : 'Month Expense'}
                </div>
                <div className="text-sm font-semibold text-rose-700">₹{monthExpense.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-rose-600 text-xs font-semibold group-hover:text-rose-800">
            <span>{t('view_ledgers')}</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Grid Lower: Health Stats & Smart Offline Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Health Activity Overview */}
        <div 
          className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors cursor-pointer group"
          onClick={() => onNavigate('health')}
          id="dash_health_card"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Activity className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                {t('health')}
              </span>
            </div>
            
            <h3 className="font-display font-semibold text-lg text-slate-900">{t('health_dashboard')}</h3>
            <p className="text-slate-500 text-xs mt-1">{t('daily_wellness')}</p>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span>{lang === 'ml' ? 'ദിവസേനയുള്ള ചുവടുകൾ' : 'Daily Steps'}</span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-900">{todayHealth.steps.toLocaleString()} / 10,000</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span>{t('water_tracker')}</span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-900">{todayHealth.waterIntakeMl} / 3,000 ml</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                  <Moon className="h-4 w-4 text-purple-500" />
                  <span>{lang === 'ml' ? 'ഉറക്കം' : 'Sleep Log'}</span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-900">{todayHealth.sleepHours} hrs</span>
              </div>
            </div>

            {/* Quick Water Logger buttons directly on Dashboard */}
            <div onClick={(e) => e.stopPropagation()} className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'ml' ? 'വെള്ളം രേഖപ്പെടുത്തുക' : 'Log Hydration'}
              </span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleQuickAddWater(250)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/50 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> 250ml
                </button>
                <button 
                  onClick={() => handleQuickAddWater(500)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> 500ml
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-blue-600 text-xs font-semibold group-hover:text-blue-800">
            <span>{t('log_vitals')}</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Smart Offline Recommendations & System Insights */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Award className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
                {lang === 'ml' ? 'ലോഗ് അനാലിസിസ്' : 'Offline AI Suggestions'}
              </span>
            </div>
            
            <h3 className="font-display font-semibold text-lg text-slate-900">{t('action_insights')}</h3>
            <p className="text-slate-500 text-xs mt-1 mb-4">
              {lang === 'ml' ? 'നിങ്ങളുടെ പ്ലാനർ, മരുന്നുകൾ, പ്രാർത്ഥന എന്നിവ പരിശോധിച്ചുള്ള തത്സമയ നിർദ്ദേശങ്ങൾ' : 'Smart local suggestions matching your planner, health, and prayer status'}
            </p>
            
            <div className="space-y-3">
              {activeInsights.map((insight, idx) => (
                <div 
                  key={idx}
                  className={`flex gap-3.5 p-3.5 rounded-xl border border-slate-100 transition-all ${insight.color}`}
                >
                  <div className="shrink-0 mt-0.5">{renderInsightIcon(insight.icon)}</div>
                  <div>
                    <h4 className="text-xs font-bold">{insight.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              {lang === 'ml' ? 'ലോക്കൽ റൂൾസ് എൻജിൻ: v1.0.4 • സിങ്ക്ഡ്' : 'Local Rules Eng: v1.0.4 • Synchronized'}
            </span>
            <button 
              onClick={() => onNavigate('reports')} 
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 group"
            >
              <span>{t('open_reports')}</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
