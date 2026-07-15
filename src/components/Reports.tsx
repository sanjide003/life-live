import { useState } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Star, 
  Sparkles, 
  BookOpen, 
  CheckSquare, 
  Activity, 
  Compass,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { LifeOSState, DailyReview } from '../types';
import confetti from 'canvas-confetti';

interface ReportsProps {
  state: LifeOSState;
  onUpdateState: (newState: LifeOSState) => void;
}

// Custom High-Contrast Tooltip for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isFinance?: boolean;
}

function CustomTooltip({ active, payload, label, isFinance }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl space-y-1.5 transition-colors duration-200">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase">{label}</p>
        {payload.map((entry: any, index: number) => {
          const value = isFinance ? `₹${entry.value.toLocaleString()}` : `${entry.value}${entry.unit || ''}`;
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{entry.name}:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-50 font-mono ml-auto">{value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

export default function Reports({ state, onUpdateState }: ReportsProps) {
  const lang = state.language || 'en';
  const todayStr = new Date().toISOString().split('T')[0];

  // Chart View Options States
  const [financeView, setFinanceView] = useState<'balance' | 'cashflow'>('balance');
  const [productivityView, setProductivityView] = useState<'rate' | 'counts'>('rate');

  // Review Form States
  const [reviewDate, setReviewDate] = useState(todayStr);
  const [positiveAspects, setPositiveAspects] = useState('');
  const [challenges, setChallenges] = useState('');
  const [improvements, setImprovements] = useState('');
  const [rating, setRating] = useState<number>(5);

  const isDark = state.theme === 'dark';

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!positiveAspects.trim() || !challenges.trim() || !improvements.trim()) return;

    const newReview: DailyReview = {
      date: reviewDate,
      positiveAspects: positiveAspects.trim(),
      challenges: challenges.trim(),
      improvements: improvements.trim(),
      rating,
    };

    // Upsert logic
    let updatedReviews = [...state.dailyReviews];
    const index = updatedReviews.findIndex(r => r.date === reviewDate);
    if (index >= 0) {
      updatedReviews[index] = newReview;
    } else {
      updatedReviews.push(newReview);
    }

    // Sort descending by date
    updatedReviews.sort((a, b) => b.date.localeCompare(a.date));

    onUpdateState({
      ...state,
      dailyReviews: updatedReviews
    });

    // Reset fields
    setPositiveAspects('');
    setChallenges('');
    setImprovements('');
    setRating(5);

    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  };

  const handleDeleteReview = (dateStr: string) => {
    onUpdateState({
      ...state,
      dailyReviews: state.dailyReviews.filter(r => r.date !== dateStr)
    });
  };

  // --- Dynamic Life OS Alignment Score Engine ---
  const calculateDailyScore = () => {
    // 1. Productivity: Tasks completed (Max 25 pts)
    const todayTasks = state.tasks.filter(t => t.dueDate === todayStr);
    const completedTasks = todayTasks.filter(t => t.completed).length;
    const totalTasks = todayTasks.length;
    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 25) : 15; // default 15 if no tasks

    // 2. Discipline: Habits completed (Max 25 pts)
    const totalHabits = state.habits.length;
    const completedHabits = state.habits.filter(h => h.completions.includes(todayStr)).length;
    const habitsScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 25) : 15; // default 15

    // 3. Spiritual: Prayer compliance (Max 30 pts)
    const prayersToday = state.prayers.find(p => p.date === todayStr);
    const completedPrayers = prayersToday ? Object.values(prayersToday.completed).filter(Boolean).length : 0;
    const spiritualScore = Math.round((completedPrayers / 5) * 30);

    // 4. Physical: Steps and water index (Max 20 pts)
    const todayHealth = state.healthMetrics.find(h => h.date === todayStr);
    const stepsRatio = todayHealth ? Math.min(1, todayHealth.steps / 10000) : 0;
    const waterRatio = todayHealth ? Math.min(1, todayHealth.waterIntakeMl / 3000) : 0;
    const physicalScore = Math.round((stepsRatio * 10) + (waterRatio * 10));

    const totalScore = productivityScore + habitsScore + spiritualScore + physicalScore;

    return {
      totalScore,
      productivityScore,
      habitsScore,
      spiritualScore,
      physicalScore,
      tasksCompleted: completedTasks,
      tasksTotal: totalTasks,
      habitsCompleted: completedHabits,
      habitsTotal: totalHabits,
      prayersCount: completedPrayers,
      stepsWalked: todayHealth?.steps || 0,
      waterDrank: todayHealth?.waterIntakeMl || 0,
    };
  };

  const reportScore = calculateDailyScore();

  const getScoreVerdict = (score: number) => {
    if (score >= 90) return { 
      label: lang === 'ml' ? 'അതിശയകരമായ അച്ചടക്കം (Stellar)' : 'Stellar Alignment', 
      desc: lang === 'ml' ? 'ശരീരം, ഉൽപ്പാദനക്ഷമത, വിശ്വാസം എന്നിവയിലെല്ലാം മികച്ച അച്ചടക്കം!' : 'Incredible discipline across physical, productivity, and faith sectors!', 
      color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
    };
    if (score >= 70) return { 
      label: lang === 'ml' ? 'മികച്ച സന്തുലിതാവസ്ഥ (Optimal)' : 'Optimal Alignment', 
      desc: lang === 'ml' ? 'വളരെ സന്തുലിതമായ ദിവസം. പ്രധാന മേഖലകളിൽ സ്ഥിരമായ ശ്രമം രേഖപ്പെടുത്തിയിട്ടുണ്ട്.' : 'Highly balanced day. Consistent effort logged in core areas.', 
      color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60' 
    };
    if (score >= 50) return { 
      label: lang === 'ml' ? 'സാധാരണ പുരോഗതി (Moderate)' : 'Moderate Progress', 
      desc: lang === 'ml' ? 'നല്ല തുടക്കം. ശീലങ്ങളിലും നടത്തത്തിലും കൂടുതൽ ശ്രദ്ധിക്കുക.' : 'Good baseline. Consider locking down habits and step milestones.', 
      color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60' 
    };
    return { 
      label: lang === 'ml' ? 'ശ്രദ്ധ ആവശ്യമാണ് (Calibration)' : 'Calibration Needed', 
      desc: lang === 'ml' ? 'കുറഞ്ഞ പുരോഗതിയുള്ള ദിവസം. പ്ലാനർ, പ്രാർത്ഥനകൾ, ശുദ്ധജല ലഭ്യത എന്നിവയിൽ കൂടുതൽ ശ്രദ്ധിക്കുക.' : 'A slower day. Re-focus on planners, prayer compliance, and physical hydration.', 
      color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60' 
    };
  };

  const verdict = getScoreVerdict(reportScore.totalScore);

  // --- Compute 30-Day Historical Analytics ---
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  // Calculate task progress over last 30 days
  const taskTrendData = last30Days.map(dateStr => {
    const dayTasks = state.tasks.filter(t => t.dueDate === dateStr);
    const total = dayTasks.length;
    const completed = dayTasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      date: dateStr,
      shortDate: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      total,
      completed,
      rate,
    };
  });

  // Calculate finance progress over last 30 days
  const accountsTotalBalance = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getNetChangeAfterDate = (dateStr: string) => {
    return state.transactions
      .filter(tx => tx.date > dateStr)
      .reduce((acc, tx) => {
        const change = tx.type === 'Income' ? tx.amount : -tx.amount;
        return acc + change;
      }, 0);
  };

  const financeTrendData = last30Days.map(dateStr => {
    const futureNetChange = getNetChangeAfterDate(dateStr);
    const balanceAtEnd = accountsTotalBalance - futureNetChange;

    const dailyTransactions = state.transactions.filter(tx => tx.date === dateStr);
    const dailyIncome = dailyTransactions
      .filter(tx => tx.type === 'Income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const dailyExpense = dailyTransactions
      .filter(tx => tx.type === 'Expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      date: dateStr,
      shortDate: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      balance: balanceAtEnd,
      income: dailyIncome,
      expense: dailyExpense,
      netChange: dailyIncome - dailyExpense,
    };
  });

  // Aggregate summaries for last 30 days
  const totalIncome30Days = financeTrendData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense30Days = financeTrendData.reduce((sum, d) => sum + d.expense, 0);
  const totalTasksCompleted30Days = taskTrendData.reduce((sum, d) => sum + d.completed, 0);
  const totalTasksDue30Days = taskTrendData.reduce((sum, d) => sum + d.total, 0);
  const overallTaskRate = totalTasksDue30Days > 0 
    ? Math.round((totalTasksCompleted30Days / totalTasksDue30Days) * 100) 
    : 0;

  const reviewsIn30Days = state.dailyReviews.filter(r => last30Days.includes(r.date));
  const avgRating = reviewsIn30Days.length > 0 
    ? (reviewsIn30Days.reduce((sum, r) => sum + r.rating, 0) / reviewsIn30Days.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6" id="reports_root">
      
      {/* Upper Interactive Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="alignment_score_card">
        {/* Card 1: Today's Core Alignment Meter */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-200">
          <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold mb-3">
            {lang === 'ml' ? 'ഇന്നത്തെ അലൈൻമെന്റ് സ്കോർ' : "Today's Alignment Score"}
          </div>
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="54" stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeWidth="10" fill="transparent" />
              <circle 
                cx="64" cy="64" r="54" 
                stroke={reportScore.totalScore >= 70 ? '#10b981' : reportScore.totalScore >= 50 ? '#6366f1' : '#f43f5e'} 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="339.3"
                strokeDashoffset={339.3 - (339.3 * reportScore.totalScore) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-3xl font-mono font-bold text-slate-800 dark:text-slate-50">{reportScore.totalScore}</div>
          </div>
          <div className="mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
            {verdict.label}
          </div>
        </div>

        {/* Card 2: 30-Day Finance Summary */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold mb-1">
              {lang === 'ml' ? '30 ദിവസത്തെ സാമ്പത്തിക വിവരങ്ങൾ' : '30-Day Finance Index'}
            </div>
            <h4 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-50 mt-1">₹{accountsTotalBalance.toLocaleString()}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {lang === 'ml' ? 'ആകെ പണലഭ്യത' : 'Cumulative Total Liquidity'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" /> {lang === 'ml' ? 'വരുമാനം' : 'Total Income'}
              </span>
              <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-sans">₹{totalIncome30Days.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-rose-500" /> {lang === 'ml' ? 'ചിലവുകൾ' : 'Expenses'}
              </span>
              <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5 font-sans">₹{totalExpense30Days.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/40 p-2 rounded-xl mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {lang === 'ml' ? '30 ദിവസത്തെ ആകെ ലാഭം:' : 'Net 30-Day Surplus:'}
            </span>
            <span className={`text-[11px] font-mono font-bold ${totalIncome30Days - totalExpense30Days >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {totalIncome30Days - totalExpense30Days >= 0 ? '+' : ''}₹{(totalIncome30Days - totalExpense30Days).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: 30-Day Productivity Summary */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold mb-1">
              {lang === 'ml' ? '30 ദിവസത്തെ ഉൽപ്പാദനക്ഷമത' : '30-Day Productivity Index'}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-50">{overallTaskRate}%</h4>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {lang === 'ml' ? 'ശരാശരി വിജയ നിരക്ക്' : 'Avg Success Rate'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {lang === 'ml' ? 'തീയതി നിശ്ചയിച്ച ആകെ ടാസ്കുകൾ' : 'Of total tasks with deadlines'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-indigo-500" /> {lang === 'ml' ? 'പൂർത്തിയായവ' : 'Completed'}
              </span>
              <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 font-sans">
                {lang === 'ml' ? `${totalTasksCompleted30Days} എണ്ണം` : `${totalTasksCompleted30Days} Tasks`}
              </p>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500" /> {lang === 'ml' ? 'ഡയറി റേറ്റിംഗ്' : 'Journal Rating'}
              </span>
              <p className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">{avgRating} / 5.0</p>
            </div>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/40 p-2 rounded-xl mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {lang === 'ml' ? 'ആകെ ക്രമീകരിച്ചവ:' : 'Total Organized:'}
            </span>
            <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {lang === 'ml' ? `${totalTasksDue30Days} എണ്ണം പട്ടികപ്പെടുത്തി` : `${totalTasksDue30Days} Scheduled`}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Trend Lines Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="interactive_trend_lines">
        {/* Column A: Finance Interactive Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-500" /> 
                {lang === 'ml' ? 'സാമ്പത്തിക വിവരങ്ങളും പണമൊഴുക്കും' : 'Finance & Cashflow Trend'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {lang === 'ml' ? 'കഴിഞ്ഞ 30 ദിവസത്തെ വിവരങ്ങൾ കാണിക്കുന്ന ചാർട്ട്' : 'Interactive trend over the last 30 days'}
              </p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 self-start sm:self-center">
              <button 
                onClick={() => setFinanceView('balance')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  financeView === 'balance' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {lang === 'ml' ? 'ബാലൻസ്' : 'Balance'}
              </button>
              <button 
                onClick={() => setFinanceView('cashflow')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  financeView === 'cashflow' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {lang === 'ml' ? 'വരവ് ചിലവ്' : 'Cashflow'}
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            {financeView === 'balance' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financeTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="financeColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} vertical={false} />
                  <XAxis 
                    dataKey="shortDate" 
                    tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000) + 'k' : val}`}
                  />
                  <Tooltip content={<CustomTooltip isFinance={true} />} />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#6366f1" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#financeColor)" 
                    name={lang === 'ml' ? 'അക്കൗണ്ട് ബാലൻസ്' : "Account Balance"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} vertical={false} />
                  <XAxis 
                    dataKey="shortDate" 
                    tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000) + 'k' : val}`}
                  />
                  <Tooltip content={<CustomTooltip isFinance={true} />} />
                  <Legend verticalAlign="top" height={32} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name={lang === 'ml' ? 'ദിവസേനയുള്ള വരവ്' : "Daily Income"} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name={lang === 'ml' ? 'ദിവസേനയുള്ള ചിലവ്' : "Daily Expense"} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Column B: Task Completion Interactive Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                <CheckSquare className="h-4.5 w-4.5 text-indigo-500" /> 
                {lang === 'ml' ? 'ഉൽപ്പാദനക്ഷമതയും ടാസ്ക് പുരോഗതിയും' : 'Productivity & Task Progress'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {lang === 'ml' ? 'കഴിഞ്ഞ 30 ദിവസത്തെ പുരോഗതി കാണിക്കുന്ന ചാർട്ട്' : 'Interactive trend over the last 30 days'}
              </p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 self-start sm:self-center">
              <button 
                onClick={() => setProductivityView('rate')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  productivityView === 'rate' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {lang === 'ml' ? 'വിജയ നിരക്ക്' : 'Success Rate'}
              </button>
              <button 
                onClick={() => setProductivityView('counts')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  productivityView === 'counts' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {lang === 'ml' ? 'ടാസ്ക് എണ്ണം' : 'Task Counts'}
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            {productivityView === 'rate' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={taskTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="taskColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} vertical={false} />
                  <XAxis 
                    dataKey="shortDate" 
                    tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomTooltip isFinance={false} />} />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#3b82f6" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#taskColor)" 
                    name="Success Rate"
                    unit="%"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} vertical={false} />
                  <XAxis 
                    dataKey="shortDate" 
                    tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 9, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip isFinance={false} />} />
                  <Legend verticalAlign="top" height={32} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Tasks Due" />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed Tasks" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Reflection Writer vs Past Reviews Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Review Writer Form */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit transition-colors duration-200">
          <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> 
            {lang === 'ml' ? 'ചിന്തകളുടെ ഡയറി (Journal)' : 'Reflection Journal'}
          </h3>
          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'ml' ? 'അവലോകന തീയതി' : 'Review Date'}
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'ml' ? 'ഇന്നത്തെ റേറ്റിംഗ് (1-5 നക്ഷത്രങ്ങൾ)' : 'Daily Rating (1-5 Stars)'}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`h-6 w-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'ml' ? '1. ഇന്ന് നന്നായി നടന്നത് എന്താണ്? (വിജയങ്ങൾ)' : '1. What went well today? (Positive Aspects)'}
              </label>
              <textarea
                rows={2}
                placeholder={lang === 'ml' ? 'പ്രധാന വിജയങ്ങൾ, നന്ദിയുള്ള നിമിഷങ്ങൾ, നാഴികക്കല്ലുകൾ...' : 'Core successes, moments of gratitude, focus milestones...'}
                value={positiveAspects}
                onChange={(e) => setPositiveAspects(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'ml' ? '2. തടസ്സങ്ങൾ എന്തൊക്കെയായിരുന്നു? (വെല്ലുവിളികൾ)' : '2. What were the friction points? (Challenges)'}
              </label>
              <textarea
                rows={2}
                placeholder={lang === 'ml' ? 'ശ്രദ്ധ തിരിക്കലുകൾ, മടി, വൈകാരിക ബുദ്ധിമുട്ടുകൾ...' : 'Distractions, procrastination, emotional triggers, missed tasks...'}
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                {lang === 'ml' ? '3. നാളെ എങ്ങനെ മെച്ചപ്പെടാം? (പ്രവർത്തനങ്ങൾ)' : '3. How can I improve tomorrow? (Action Points)'}
              </label>
              <textarea
                rows={2}
                placeholder={lang === 'ml' ? 'നാളെ ചെയ്യേണ്ട പ്രധാന കാര്യങ്ങൾ, വരുത്തേണ്ട മാറ്റങ്ങൾ...' : 'Actions to take tomorrow, environmental changes...'}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> 
              {lang === 'ml' ? 'ഡയറി സേവ് ചെയ്യുക (Save Reflection)' : 'Save Reflection Journal'}
            </button>
          </form>
        </div>

        {/* Past Reviews List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px] transition-colors duration-200">
          <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-50 mb-4">
            {lang === 'ml' ? 'കഴിഞ്ഞ ദിവസങ്ങളിലെ അവലോകനങ്ങൾ' : 'Past Reflection Logs'}
          </h3>
          
          {state.dailyReviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-2">
                <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                {lang === 'ml' ? 'ഡയറി ശൂന്യമാണ്' : 'Journal is Vacant'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ml' ? 'സ്വയം വിലയിരുത്തുന്നതിനും മെച്ചപ്പെടുന്നതിനുമായി ഓരോ ദിവസവും രേഖപ്പെടുത്തുക' : 'Review your days to build self-awareness and wisdom'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.dailyReviews.map((review) => (
                <div key={review.date} className="p-4 border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-950/20 hover:border-indigo-100 dark:hover:border-indigo-900/60 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 font-mono">{review.date}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, idx) => (
                          <Star key={idx} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(lang === 'ml' ? 'ഈ റെക്കോർഡ് ഡിലീറ്റ് ചെയ്യണോ?' : 'Are you sure you want to delete this record?')) {
                          handleDeleteReview(review.date);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100/60 dark:border-slate-800/40 mt-1">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
                        {lang === 'ml' ? 'വിജയങ്ങൾ' : 'Successes'}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{review.positiveAspects}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-rose-500 dark:text-rose-400 tracking-wide">
                        {lang === 'ml' ? 'വെല്ലുവിളികൾ' : 'Challenges'}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{review.challenges}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wide">
                        {lang === 'ml' ? 'മാറ്റങ്ങൾ' : 'Improvements'}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{review.improvements}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
