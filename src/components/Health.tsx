import { useState } from 'react';
import { 
  Activity, 
  Droplet, 
  Moon, 
  TrendingUp, 
  Plus, 
  Trash2,
  Heart,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { LifeOSState, HealthMetric } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import confetti from 'canvas-confetti';

interface HealthProps {
  state: LifeOSState;
  onUpdateState: (newState: LifeOSState) => void;
}

export default function Health({ state, onUpdateState }: HealthProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Forms states
  const [date, setDate] = useState(todayStr);
  const [steps, setSteps] = useState('8000');
  const [sleepHours, setSleepHours] = useState('7.5');
  const [waterIntakeMl, setWaterIntakeMl] = useState('2500');
  const [weightKg, setWeightKg] = useState('74');
  const [mood, setMood] = useState<HealthMetric['mood']>('Good');
  const [medicineInput, setMedicineInput] = useState('');
  const [medicines, setMedicines] = useState<string[]>(['Multivitamin']);

  // Log today metric
  const handleLogMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const stepsNum = parseInt(steps);
    const sleepNum = parseFloat(sleepHours);
    const waterNum = parseInt(waterIntakeMl);
    const weightNum = parseFloat(weightKg);

    if (isNaN(stepsNum) || isNaN(sleepNum) || isNaN(waterNum)) return;

    const newMetric: HealthMetric = {
      date,
      steps: stepsNum,
      sleepHours: sleepNum,
      waterIntakeMl: waterNum,
      weightKg: isNaN(weightNum) ? undefined : weightNum,
      mood,
      medicines: medicines.length > 0 ? medicines : undefined,
    };

    // Upsert logic: replace existing date entry if exists, or append
    let updatedMetrics = [...state.healthMetrics];
    const index = updatedMetrics.findIndex(m => m.date === date);
    if (index >= 0) {
      updatedMetrics[index] = newMetric;
    } else {
      updatedMetrics.push(newMetric);
    }

    // Sort by date ascending
    updatedMetrics.sort((a, b) => a.date.localeCompare(b.date));

    onUpdateState({
      ...state,
      healthMetrics: updatedMetrics
    });

    confetti({ particleCount: 35, spread: 35 });
  };

  // Medicine tags helpers
  const handleAddMedicine = () => {
    if (!medicineInput.trim()) return;
    if (!medicines.includes(medicineInput.trim())) {
      setMedicines([...medicines, medicineInput.trim()]);
    }
    setMedicineInput('');
  };

  const handleRemoveMedicine = (med: string) => {
    setMedicines(medicines.filter(m => m !== med));
  };

  // Get current logged values for display
  const currentMetric = state.healthMetrics.find(m => m.date === todayStr) || {
    date: todayStr,
    steps: 0,
    sleepHours: 0,
    waterIntakeMl: 0
  };

  // Process data for Recharts (last 7 entries)
  const chartData = state.healthMetrics.slice(-7).map(m => {
    // Format date for display like "Jul 14"
    const parsed = new Date(m.date);
    const shortDateStr = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      name: shortDateStr,
      steps: m.steps,
      water: m.waterIntakeMl,
      sleep: m.sleepHours
    };
  });

  return (
    <div className="space-y-6" id="health_root">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold">Today Steps</span>
            <h3 className="text-xl font-mono font-bold text-slate-900 mt-0.5">{currentMetric.steps.toLocaleString()}</h3>
            <span className="text-[10px] text-slate-500 font-medium">Target: 10k steps</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold">Today Hydration</span>
            <h3 className="text-xl font-mono font-bold text-slate-900 mt-0.5">{currentMetric.waterIntakeMl} ml</h3>
            <span className="text-[10px] text-slate-500 font-medium">Target: 3,000 ml</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Moon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold">Today Sleep</span>
            <h3 className="text-xl font-mono font-bold text-slate-900 mt-0.5">{currentMetric.sleepHours} hrs</h3>
            <span className="text-[10px] text-slate-500 font-medium">Target: 7-8 hrs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold">Logged Weight</span>
            <h3 className="text-xl font-mono font-bold text-slate-900 mt-0.5">
              {currentMetric.weightKg ? `${currentMetric.weightKg} kg` : 'Not Set'}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Stable tracking</span>
          </div>
        </div>
      </div>

      {/* Grid: Charts vs. Logger Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Logger Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-display font-semibold text-base text-slate-900 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-indigo-600" /> Log Health Metrics
          </h3>
          <form onSubmit={handleLogMetric} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Metric Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Steps Count
                </label>
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Water (ml)
                </label>
                <input
                  type="number"
                  value={waterIntakeMl}
                  onChange={(e) => setWaterIntakeMl(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Sleep (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Current Mood State
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['Awful', 'Bad', 'Neutral', 'Good', 'Excellent'] as HealthMetric['mood'][]).map((mState) => {
                  const smileys = { Awful: '😢', Bad: '🙁', Neutral: '😐', Good: '🙂', Excellent: '🤩' };
                  return (
                    <button
                      key={mState}
                      type="button"
                      onClick={() => setMood(mState)}
                      className={`py-2 text-sm rounded-xl border text-center transition-all ${
                        mood === mState 
                          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-base">{smileys[mState as keyof typeof smileys]}</div>
                      <div className="text-[9px] mt-0.5 tracking-tighter">{mState}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medicines Tracker */}
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Medicines Checklist
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add medicine (e.g. Calcium)"
                  value={medicineInput}
                  onChange={(e) => setMedicineInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="px-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shrink-0"
                >
                  Add
                </button>
              </div>

              {medicines.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {medicines.map((med) => (
                    <span 
                      key={med} 
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-lg border border-slate-200"
                    >
                      {med}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveMedicine(med)}
                        className="text-slate-400 hover:text-rose-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> Log Day Node
            </button>
          </form>
        </div>

        {/* Charts Panel */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[400px]" id="health_charts_card">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-900 mb-1">Health Performance Over Time</h3>
            <p className="text-slate-500 text-xs mb-4">Steps vs. Water Intake correlation index over the last 7 logs</p>

            {/* Recharts Double Area Chart */}
            {chartData.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl">📊</div>
                <h4 className="text-sm font-semibold text-slate-800 mt-2">Insufficient Logs</h4>
                <p className="text-xs text-slate-500 mt-1">Log at least two daily metric nodes to enable visualization charts</p>
              </div>
            ) : (
              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="steps" 
                      name="Steps Logged"
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorSteps)" 
                      strokeWidth={2}
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="water" 
                      name="Water Hydration (ml)"
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorWater)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Health Connect APIs Ready • Local Storage Engine Sandbox
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
