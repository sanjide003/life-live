import { useState, useEffect, useRef } from 'react';
import { 
  Compass, MapPin, Clock, Sliders, Settings, Award, Activity, 
  Plus, Minus, Sparkles, AlertCircle, Trash2, RotateCcw, 
  Calendar, Check, Volume2, Bell, TrendingUp, Info, Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { LifeOSState, PrayerName, PrayerSettings, ExtraPrayer, Dhikr } from '../types';
import { calculatePrayerTimes } from '../utils/prayerCalc';
import confetti from 'canvas-confetti';

interface PrayerProps {
  state: LifeOSState;
  onUpdateState: (newState: LifeOSState) => void;
  subTab?: 'tracker' | 'settings' | 'sunnah-dhikr';
  onSubTabChange?: (tab: 'tracker' | 'settings' | 'sunnah-dhikr') => void;
}

type SunnahCategory = 'Tahajjud' | 'Duha' | 'Ishraq' | 'Rawatib' | 'Other' | 'All';

export default function Prayer({ state, onUpdateState, subTab: externalSubTab, onSubTabChange }: PrayerProps) {
  const [localSubTab, setLocalSubTab] = useState<'tracker' | 'settings' | 'sunnah-dhikr'>('tracker');
  const subTab = externalSubTab !== undefined ? externalSubTab : localSubTab;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const lang = state.language || 'en';

  const [confirmState, setConfirmState] = useState<{title: string, message: string, onConfirm: () => void, consequence?: string} | null>(null);
  
  // Inner Sub-tab navigation for Sunnah & Dhikr
  const [innerSubTab, setInnerSubTab] = useState<'sunnah' | 'dhikr'>('sunnah');
  
  // Filtering categorized Sunnah prayers
  const [sunnahFilter, setSunnahFilter] = useState<SunnahCategory>('All');

  // Modals for adding entries
  const [isAddingSunnah, setIsAddingSunnah] = useState(false);
  const [isAddingDhikr, setIsAddingDhikr] = useState(false);

  // Form states for Sunnah Prayer Creator
  const [sunnahName, setSunnahName] = useState('');
  const [sunnahCategory, setSunnahCategory] = useState<SunnahCategory>('Tahajjud');
  const [sunnahRakats, setSunnahRakats] = useState(2);
  const [sunnahTime, setSunnahTime] = useState('03:30');
  const [sunnahAlarmEnabled, setSunnahAlarmEnabled] = useState(true);
  const [sunnahAlarmType, setSunnahAlarmType] = useState<'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone'>('Vibration & Ringtone');
  const [sunnahRepeat, setSunnahRepeat] = useState<'Once' | 'Every day' | 'Monday to Friday' | 'Custom'>('Every day');
  const [sunnahRepeatDays, setSunnahRepeatDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  // Form states for Dhikr Counter Creator
  const [dhikrName, setDhikrName] = useState('');
  const [dhikrTarget, setDhikrTarget] = useState(33);
  const [dhikrTime, setDhikrTime] = useState('06:00');
  const [dhikrAlarmEnabled, setDhikrAlarmEnabled] = useState(true);
  const [dhikrAlarmType, setDhikrAlarmType] = useState<'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone'>('Vibration & Ringtone');
  const [dhikrRepeat, setDhikrRepeat] = useState<'Once' | 'Every day' | 'Monday to Friday' | 'Custom'>('Every day');
  const [dhikrRepeatDays, setDhikrRepeatDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  // Touch and mouse long-press timer references for Dhikr Resets
  const [holdingDhikrId, setHoldingDhikrId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const resetIntervalRef = useRef<any>(null);

  // Active expanded Analytics drawer for Dhikrs
  const [expandedDhikrStatsId, setExpandedDhikrStatsId] = useState<string | null>(null);

  // Active selected Dhikr for dropdown selection & large screen/thumb tapping area
  const [selectedDhikrId, setSelectedDhikrId] = useState<string>('');

  // State for fully editing a Sunnah prayer
  const [editingSunnah, setEditingSunnah] = useState<ExtraPrayer | null>(null);

  // State for fully editing a Dhikr counter
  const [editingDhikr, setEditingDhikr] = useState<Dhikr | null>(null);

  // Load times based on current calculation parameters
  const calculatedTimes = calculatePrayerTimes(todayStr, state.prayerSettings);

  // Coordinate editing state
  const [localLat, setLocalLat] = useState(state.prayerSettings.location.latitude);
  const [localLng, setLocalLng] = useState(state.prayerSettings.location.longitude);
  const [localLocName, setLocalLocName] = useState(state.prayerSettings.location.name);

  // Synchronize local edit state with App's global settings when they change
  useEffect(() => {
    setLocalLat(state.prayerSettings.location.latitude);
    setLocalLng(state.prayerSettings.location.longitude);
    setLocalLocName(state.prayerSettings.location.name);
  }, [state.prayerSettings]);

  const isCoordsModified = 
    localLat !== state.prayerSettings.location.latitude ||
    localLng !== state.prayerSettings.location.longitude ||
    localLocName !== state.prayerSettings.location.name;

  const handleApplyCoordinates = () => {
    onUpdateState({
      ...state,
      prayerSettings: {
        ...state.prayerSettings,
        location: {
          latitude: localLat,
          longitude: localLng,
          name: localLocName,
          isManual: true
        }
      }
    });
  };

  // Prayer Completion Tracking for today
  const prayersToday = state.prayers.find(p => p.date === todayStr) || {
    date: todayStr,
    completed: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }
  };

  const handleTogglePrayer = (prayer: PrayerName) => {
    let updatedPrayers = [...state.prayers];
    const index = updatedPrayers.findIndex(p => p.date === todayStr);
    
    if (index >= 0) {
      const nextVal = !updatedPrayers[index].completed[prayer];
      updatedPrayers[index] = {
        ...updatedPrayers[index],
        completed: {
          ...updatedPrayers[index].completed,
          [prayer]: nextVal
        }
      };
      if (nextVal) {
        confetti({ particleCount: 30, spread: 20 });
      }
    } else {
      updatedPrayers.push({
        date: todayStr,
        completed: {
          Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false,
          [prayer]: true
        }
      });
      confetti({ particleCount: 30, spread: 20 });
    }

    onUpdateState({
      ...state,
      prayers: updatedPrayers
    });
  };

  // Settings updating helper
  const handleUpdateSettings = (updates: Partial<PrayerSettings>) => {
    setConfirmState({
      title: lang === 'ml' ? 'കണക്കുകൂട്ടൽ രീതി മാറ്റാൻ ഉറപ്പാണോ?' : 'Confirm Formula Change',
      message: lang === 'ml' ? 'കണക്കുകൂട്ടൽ രീതി മാറ്റുന്നത് പ്രാർത്ഥന സമയങ്ങളെ മാറ്റിമറിക്കും. ഇത് തുടരണോ?' : 'Are you sure you want to change the calculation formula? This might alter prayer times significantly.',
      consequence: lang === 'ml' ? 'പുതിയ രീതിക്കനുസരിച്ച് സമയങ്ങൾ വീണ്ടും കണക്കുകൂട്ടും.' : 'Prayer timings will be recalculated according to the newly selected juristic rules.',
      onConfirm: () => {
        onUpdateState({
          ...state,
          prayerSettings: {
            ...state.prayerSettings,
            ...updates
          }
        });
        setConfirmState(null);
      }
    });
  };

  // Offset update triggers
  const handleUpdateOffset = (prayer: PrayerName, delta: number) => {
    const updatedOffsets = {
      ...state.prayerSettings.manualOffsets,
      [prayer]: (state.prayerSettings.manualOffsets[prayer] || 0) + delta
    };
    onUpdateState({
      ...state,
      prayerSettings: {
        ...state.prayerSettings,
        manualOffsets: updatedOffsets
      }
    });
  };

  const handleUpdateIqamahOffset = (prayer: PrayerName, delta: number) => {
    const currentOffsets = state.prayerSettings.iqamahOffsets || { Fajr: 10, Dhuhr: 15, Asr: 15, Maghrib: 10, Isha: 15 };
    const updated = {
      ...currentOffsets,
      [prayer]: Math.max(0, (currentOffsets[prayer] || 0) + delta)
    };
    onUpdateState({
      ...state,
      prayerSettings: {
        ...state.prayerSettings,
        iqamahOffsets: updated
      }
    });
  };

  const handleUpdateAlarmOffset = (prayer: PrayerName, delta: number) => {
    const currentOffsets = state.prayerSettings.alarmOffsets || { Fajr: 5, Dhuhr: 5, Asr: 5, Maghrib: 5, Isha: 5 };
    const updated = {
      ...currentOffsets,
      [prayer]: Math.max(0, (currentOffsets[prayer] || 0) + delta)
    };
    onUpdateState({
      ...state,
      prayerSettings: {
        ...state.prayerSettings,
        alarmOffsets: updated
      }
    });
  };

  const handleGetGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onUpdateState({
          ...state,
          prayerSettings: {
            ...state.prayerSettings,
            location: {
              latitude: Number(latitude.toFixed(4)),
              longitude: Number(longitude.toFixed(4)),
              name: `Detected (GPS)`,
              isManual: false
            }
          }
        });
        confetti({ particleCount: 30, spread: 30 });
      },
      (error) => {
        console.error("Geolocation failed", error);
        alert(`Could not detect location automatically: ${error.message}.`);
      }
    );
  };

  // Weekday Helpers
  const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const toggleWeekdaySelection = (day: string, currentDays: string[], setDays: (days: string[]) => void) => {
    if (currentDays.includes(day)) {
      setDays(currentDays.filter(d => d !== day));
    } else {
      setDays([...currentDays, day]);
    }
  };

  // Add Custom Sunnah Prayer handler
  const handleAddSunnah = () => {
    if (!sunnahName.trim()) return;

    const newPrayer: ExtraPrayer = {
      id: `sunnah-${Date.now()}`,
      name: sunnahName.trim(),
      rakats: sunnahRakats,
      time: sunnahTime,
      alarmEnabled: sunnahAlarmEnabled,
      alarmType: sunnahAlarmType,
      repeat: sunnahRepeat,
      repeatCustomDays: sunnahRepeat === 'Custom' ? sunnahRepeatDays : undefined
    };

    onUpdateState({
      ...state,
      extraPrayers: [...(state.extraPrayers || []), newPrayer]
    });

    // Reset Form
    setSunnahName('');
    setSunnahRakats(2);
    setSunnahTime('03:30');
    setSunnahAlarmEnabled(true);
    setSunnahAlarmType('Vibration & Ringtone');
    setSunnahRepeat('Every day');
    setSunnahRepeatDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setIsAddingSunnah(false);

    confetti({ particleCount: 20, spread: 20 });
  };

  // Add Custom Dhikr Counter handler
  const handleAddDhikr = () => {
    if (!dhikrName.trim()) return;

    const newDhikr: Dhikr = {
      id: `dhikr-${Date.now()}`,
      name: dhikrName.trim(),
      targetCount: dhikrTarget,
      currentCount: 0,
      time: dhikrTime,
      alarmEnabled: dhikrAlarmEnabled,
      alarmType: dhikrAlarmType,
      repeat: dhikrRepeat,
      repeatCustomDays: dhikrRepeat === 'Custom' ? dhikrRepeatDays : undefined,
      history: {}
    };

    onUpdateState({
      ...state,
      dhikrs: [...(state.dhikrs || []), newDhikr]
    });

    // Reset Form
    setDhikrName('');
    setDhikrTarget(33);
    setDhikrTime('06:00');
    setDhikrAlarmEnabled(true);
    setDhikrAlarmType('Vibration & Ringtone');
    setDhikrRepeat('Every day');
    setDhikrRepeatDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setIsAddingDhikr(false);

    confetti({ particleCount: 20, spread: 20 });
  };

  // Delete handlers
  const handleDeleteSunnah = (id: string) => {
    const list = state.extraPrayers || [];
    onUpdateState({
      ...state,
      extraPrayers: list.filter(p => p.id !== id)
    });
  };

  const handleSaveEditSunnah = () => {
    if (!editingSunnah || !editingSunnah.name.trim()) return;
    const list = state.extraPrayers || [];
    const updated = list.map(p => p.id === editingSunnah.id ? editingSunnah : p);
    onUpdateState({
      ...state,
      extraPrayers: updated
    });
    setEditingSunnah(null);
    confetti({ particleCount: 20, spread: 25 });
  };

  // Initialize and synchronize active selected Dhikr
  useEffect(() => {
    const dhikrs = state.dhikrs || [];
    if (dhikrs.length > 0) {
      const exists = dhikrs.some(d => d.id === selectedDhikrId);
      if (!exists || !selectedDhikrId) {
        setSelectedDhikrId(dhikrs[0].id);
      }
    } else {
      setSelectedDhikrId('');
    }
  }, [state.dhikrs, selectedDhikrId]);

  const handleDeleteDhikrItem = (id: string) => {
    const list = state.dhikrs || [];
    onUpdateState({
      ...state,
      dhikrs: list.filter(d => d.id !== id)
    });
  };

  // Increment Dhikr and update today's history log
  const handleIncrementDhikr = (id: string) => {
    const list = [...(state.dhikrs || [])];
    const index = list.findIndex(d => d.id === id);
    if (index === -1) return;

    const d = list[index];
    const newCount = d.currentCount + 1;
    d.currentCount = newCount;
    
    // Save to history for visual analytics
    if (!d.history) d.history = {};
    d.history[todayStr] = (d.history[todayStr] || 0) + 1;

    // Confetti effect when completing target
    if (newCount === d.targetCount) {
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
    }

    onUpdateState({
      ...state,
      dhikrs: list
    });
  };

  // Reset Dhikr count to 0
  const handleResetDhikr = (id: string) => {
    const list = [...(state.dhikrs || [])];
    const index = list.findIndex(d => d.id === id);
    if (index === -1) return;

    list[index].currentCount = 0;
    
    onUpdateState({
      ...state,
      dhikrs: list
    });

    if (navigator.vibrate) {
      navigator.vibrate([100]);
    }
  };

  // Long press reset trigger routines
  const handleResetPressStart = (id: string) => {
    setHoldingDhikrId(id);
    setHoldProgress(0);
    const startTime = Date.now();
    const duration = 1000; // 1 second hold

    resetIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);

      if (elapsed >= duration) {
        clearInterval(resetIntervalRef.current);
        handleResetDhikr(id);
        setHoldingDhikrId(null);
        setHoldProgress(0);
      }
    }, 40);
  };

  const handleResetPressEnd = () => {
    if (resetIntervalRef.current) {
      clearInterval(resetIntervalRef.current);
    }
    setHoldingDhikrId(null);
    setHoldProgress(0);
  };

  // Calculate stats details for Dhikr visualizer
  const getDhikrMonthlyStats = (dhikr: Dhikr) => {
    const history = dhikr.history || {};
    const keys = Object.keys(history);
    
    // Sum this month
    const currentMonthPrefix = todayStr.substring(0, 7); // e.g. "2026-07"
    let monthlyTotal = 0;
    let daysCompletedTarget = 0;

    keys.forEach(date => {
      if (date.startsWith(currentMonthPrefix)) {
        monthlyTotal += history[date];
        if (history[date] >= dhikr.targetCount) {
          daysCompletedTarget++;
        }
      }
    });

    // Chart Data for last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { weekday: 'short' });
      chartData.push({
        name: dayLabel,
        count: history[dStr] || 0,
        dateStr: dStr
      });
    }

    return {
      monthlyTotal,
      daysCompletedTarget,
      chartData
    };
  };

  const completedCount = Object.values(prayersToday.completed).filter(Boolean).length;

  return (
    <div className="space-y-6" id="prayer_root">
      
      {/* TRACKER TAB */}
      {subTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="prayer_tracker_panel">
          
          {/* Main Checklist Card */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-base text-slate-900">Spiritual Mindful Trackers</h3>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 inline text-emerald-600" /> Complied: {completedCount}/5 Prayers
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(completedCount / 5) * 100}%` }}
                />
              </div>

              {/* Daily Prayers list */}
              <div className="space-y-3">
                {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).map((prayer) => {
                  const time = calculatedTimes[prayer];
                  const isDone = prayersToday.completed[prayer];

                  // Calculate Iqamah Display
                  const iqamahOffset = (state.prayerSettings.iqamahOffsets && state.prayerSettings.iqamahOffsets[prayer]) || 0;
                  const addMinutes = (timeStr: string, mins: number) => {
                    if (!timeStr) return '';
                    const [h, m] = timeStr.split(':').map(Number);
                    const d = new Date();
                    d.setHours(h, m, 0, 0);
                    d.setMinutes(d.getMinutes() + mins);
                    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                  };
                  const iqamahDisplay = addMinutes(time, iqamahOffset);

                  return (
                    <div 
                      key={prayer}
                      onClick={() => handleTogglePrayer(prayer)}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isDone 
                          ? 'bg-indigo-50/40 border-indigo-200/80' 
                          : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-all ${
                          isDone ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          <Check className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-display font-bold text-sm text-slate-900">{prayer}</div>
                          {iqamahOffset > 0 && (
                            <span className="text-[10px] font-mono text-slate-400">
                              Iqamah: {iqamahDisplay} ({iqamahOffset}m wait)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3.5">
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-400 uppercase block tracking-wider">Adhan</span>
                          <span className="text-sm font-mono font-bold text-slate-800">{time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold font-mono">
              <div>Calculation Engine: {state.prayerSettings.calculationMethod}</div>
              <div>School: {state.prayerSettings.school}</div>
            </div>
          </div>

          {/* Quick Location Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Geographical Calibration</h4>
                  <p className="text-xs leading-normal mt-0.5 text-indigo-600">Prayer times adjust in real-time based on local solar angles.</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Location Display</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">{state.prayerSettings.location.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Latitude</div>
                  <div className="text-sm font-mono font-bold text-slate-800 mt-0.5">{state.prayerSettings.location.latitude}° N</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Longitude</div>
                  <div className="text-sm font-mono font-bold text-slate-800 mt-0.5">{state.prayerSettings.location.longitude}° E</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Sun Declination</div>
                <div className="text-sm font-mono font-semibold text-slate-800 mt-0.5">Calculated in real-time</div>
              </div>
            </div>

            <button
              onClick={handleGetGeolocation}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Compass className="h-4 w-4 animate-pulse" /> Re-Scan Current Location
            </button>
          </div>

        </div>
      )}

      
      {/* SUNNAH & DHIKR TAB */}
      {subTab === 'sunnah-dhikr' && (
        <div className="space-y-6" id="sunnah_dhikr_panel">
          
          {/* Internal Navigation & Action row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
            
            {/* Inner Subtab Switchers */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl self-start">
              <button
                onClick={() => setInnerSubTab('sunnah')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  innerSubTab === 'sunnah'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🕌 {lang === 'ml' ? 'സുന്നത്ത് നിസ്കാരങ്ങൾ' : 'Sunnah Prayers'}
              </button>
              <button
                onClick={() => setInnerSubTab('dhikr')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  innerSubTab === 'dhikr'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📿 {lang === 'ml' ? 'ദിക്ർ കൗണ്ടർ' : 'Dhikr Counter'}
              </button>
            </div>

            {/* Action trigger button */}
            <button
              onClick={() => {
                if (innerSubTab === 'sunnah') {
                  setIsAddingSunnah(true);
                } else {
                  setIsAddingDhikr(true);
                }
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {innerSubTab === 'sunnah'
                ? (lang === 'ml' ? 'സുന്നത്ത് നിസ്കാരം ആഡ് ചെയ്യുക' : 'Add Custom Sunnah')
                : (lang === 'ml' ? 'പുതിയ ദിക്ർ ആഡ് ചെയ്യുക' : 'Add New Dhikr')
              }
            </button>
          </div>

          {/* INNER SUNNAH TAB VIEW */}
          {innerSubTab === 'sunnah' && (
            <div className="space-y-6">
              
              {/* Sunnah Prayers Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const filtered = state.extraPrayers || [];
                  
                  if (filtered.length === 0) {
                    return (
                      <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-8 rounded-2xl text-center space-y-3">
                        <Compass className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {lang === 'ml' ? 'ലഭ്യമായ സുന്നത്ത് നിസ്കാരങ്ങൾ ഇല്ല' : 'No Custom Sunnah Prayers'}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          {lang === 'ml' 
                            ? 'സുന്നത്ത് നിസ്കാരങ്ങളും അവയുടെ ആവർത്തന ക്രമീകരണങ്ങളും ക്രമീകരിക്കാൻ മുകളിലെ "+ആഡ്" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.' 
                            : 'Click the "+ Add Custom Sunnah" button above to track your custom prayers with system-level alarm reminders.'}
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((prayer) => {
                    const daysLabel = prayer.repeat === 'Custom' && prayer.repeatCustomDays
                      ? prayer.repeatCustomDays.join(', ')
                      : prayer.repeat || 'Every day';

                    return (
                      <div 
                        key={prayer.id} 
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex items-center justify-between gap-4 relative group hover:border-indigo-300 dark:hover:border-indigo-900/60 transition-all"
                      >
                        <div className="flex-1 min-w-0 flex items-start gap-3">
                          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Clock className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                              {prayer.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                              <span>{prayer.rakats || 2} Rakat</span>
                              <span>•</span>
                              <span>{prayer.time}</span>
                              <span>•</span>
                              <span className="text-indigo-600 dark:text-indigo-400">{daysLabel}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status/Alarm indicator, Edit & Delete buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {prayer.alarmEnabled ? (
                            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs" title="Alarms active">
                              <Bell className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg text-xs" title="Silent">
                              <Volume2 className="h-3.5 w-3.5" />
                            </span>
                          )}

                          {/* Edit Option */}
                          <button
                            onClick={() => {
                              setEditingSunnah(prayer);
                            }}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title={lang === 'ml' ? 'എഡിറ്റ് ചെയ്യുക' : 'Edit'}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Option */}
                          <button
                            onClick={() => {
                              setConfirmState({
                                title: lang === 'ml' ? 'നിസ്കാരം ഒഴിവാക്കണോ?' : 'Delete Sunnah Prayer',
                                message: lang === 'ml' ? `"${prayer.name}" എന്ന സുന്നത്ത് നിസ്കാരം ലിസ്റ്റിൽ നിന്നും ഒഴിവാക്കണോ?` : `Are you sure you want to remove "${prayer.name}" from your Sunnah list?`,
                                onConfirm: () => handleDeleteSunnah(prayer.id)
                              });
                            }}
                            className="p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title={lang === 'ml' ? 'നീക്കം ചെയ്യുക' : 'Delete'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* INNER DHIKR TAB VIEW */}
          {innerSubTab === 'dhikr' && (
            <div className="space-y-6">
              
              {/* Dropdown at the very top */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'ദിക്ർ തിരഞ്ഞെടുക്കുക' : 'Select Active Dhikr'}
                  </label>
                  <select
                    value={selectedDhikrId}
                    onChange={(e) => setSelectedDhikrId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {state.dhikrs && state.dhikrs.length > 0 ? (
                      state.dhikrs.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.currentCount} / {d.targetCount})
                        </option>
                      ))
                    ) : (
                      <option value="">{lang === 'ml' ? 'ദിക്റുകൾ ഒന്നും ലഭ്യമല്ല' : 'No Dhikrs Created'}</option>
                    )}
                  </select>
                </div>
              </div>

              {(() => {
                const dhikrs = state.dhikrs || [];
                const activeDhikr = dhikrs.find(d => d.id === selectedDhikrId) || dhikrs[0];
                
                if (!activeDhikr) {
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-8 rounded-2xl text-center space-y-3">
                      <Sparkles className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {lang === 'ml' ? 'ദിക്റുകൾ ഒന്നും ചേർത്തിട്ടില്ല' : 'No Active Dhikr Counters'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {lang === 'ml' 
                          ? 'പുതിയ ദിക്റുകളും അവയുടെ പ്രതിദിന ടാർഗറ്റുകളും സജ്ജീകരിക്കാൻ മുകളിൽ വലതുവശത്തുള്ള "+ആഡ്" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.' 
                          : 'Create custom daily dhikrs and track your completion rates, monthly stats, and animated visual counts.'}
                      </p>
                    </div>
                  );
                }
                
                const stats = getDhikrMonthlyStats(activeDhikr);
                const isStatsExpanded = expandedDhikrStatsId === activeDhikr.id;
                const isHoldingThis = holdingDhikrId === activeDhikr.id;
                const progress = activeDhikr.targetCount > 0 ? (activeDhikr.currentCount / activeDhikr.targetCount) : 0;
                
                return (
                  <div className="space-y-4">
                    {/* Upper Details Panel */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
                            {lang === 'ml' ? 'സജീവമായ ദിക്ർ' : 'Active Recitation'}
                          </span>
                          <h4 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-2 truncate">
                            {activeDhikr.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 font-semibold">
                            {lang === 'ml' ? 'പ്രതിദിന ലക്ഷ്യം' : 'Daily Target'}: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeDhikr.targetCount}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Edit Active Dhikr Button */}
                          <button
                            onClick={() => {
                              setEditingDhikr(activeDhikr);
                            }}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
                            title={lang === 'ml' ? 'എഡിറ്റ് ചെയ്യുക' : 'Edit Dhikr'}
                          >
                            <Edit className="h-5 w-5" />
                          </button>

                          {/* Delete Active Dhikr Button */}
                          <button
                            onClick={() => {
                              setConfirmState({
                                title: lang === 'ml' ? 'ദിക്ർ ഒഴിവാക്കണോ?' : 'Delete Dhikr Counter',
                                message: lang === 'ml' ? `"${activeDhikr.name}" എന്ന ദിക്ർ കൗണ്ടർ നീക്കം ചെയ്യാൻ ഉറപ്പാണോ?` : `Are you sure you want to delete "${activeDhikr.name}"?`,
                                onConfirm: () => {
                                  handleDeleteDhikrItem(activeDhikr.id);
                                  setSelectedDhikrId('');
                                }
                              });
                            }}
                            className="p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                            title="Delete Dhikr"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Compact Stats Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center justify-between">
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-extrabold">{lang === 'ml' ? 'ഇന്നത്തെ കൗണ്ട്' : "Today's Count"}</span>
                            <span className="text-sm sm:text-base font-mono font-extrabold text-slate-800 dark:text-white mt-0.5 block truncate">
                              {activeDhikr.currentCount} / {activeDhikr.targetCount}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded shrink-0">
                            {Math.round(Math.min(progress, 1) * 100)}%
                          </span>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col justify-center min-w-0">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-extrabold">{lang === 'ml' ? 'ഓർമ്മപ്പെടുത്തൽ' : 'Reminders'}</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                            {activeDhikr.time ? `${activeDhikr.time} (${activeDhikr.alarmEnabled ? 'Alarm ON' : 'Silent'})` : 'No alarm'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Inline Long Press Reset Action */}
                      <div className="flex gap-2">
                        <button
                          onMouseDown={() => handleResetPressStart(activeDhikr.id)}
                          onMouseUp={handleResetPressEnd}
                          onMouseLeave={handleResetPressEnd}
                          onTouchStart={() => handleResetPressStart(activeDhikr.id)}
                          onTouchEnd={handleResetPressEnd}
                          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all relative overflow-hidden select-none cursor-pointer border ${
                            isHoldingThis 
                              ? 'bg-rose-500 border-rose-500 text-white shadow-inner scale-[0.98]' 
                              : 'bg-slate-50 border-slate-100 hover:bg-slate-100 dark:bg-slate-950/60 dark:border-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {/* Progress bar overlay */}
                          {isHoldingThis && (
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-rose-600 opacity-60 transition-all duration-75"
                              style={{ width: `${holdProgress}%` }}
                            />
                          )}
                          <span className="relative z-10 flex items-center justify-center gap-1.5">
                            <RotateCcw className="h-4 w-4" />
                            {isHoldingThis ? (lang === 'ml' ? 'പിടിക്കുക...' : 'Hold...') : (lang === 'ml' ? 'റീസെറ്റ് ചെയ്യാൻ അമർത്തുക' : 'Hold to Reset')}
                          </span>
                        </button>
                        
                        {/* Open Visual Analytics Trigger */}
                        <button
                          onClick={() => setExpandedDhikrStatsId(isStatsExpanded ? null : activeDhikr.id)}
                          className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isStatsExpanded
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-slate-50 border-slate-100 hover:bg-slate-100 dark:bg-slate-950/60 dark:border-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <TrendingUp className="h-4 w-4" />
                          {lang === 'ml' ? 'ചാർട്ട്' : 'Stats'}
                        </button>
                      </div>
                      
                      {/* Collapsible Visual Analytics Chart */}
                      <AnimatePresence>
                        {isStatsExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="pt-2 border-t border-slate-150 dark:border-slate-800 overflow-hidden space-y-4"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">{lang === 'ml' ? 'ഈ മാസത്തെ ആകെ' : 'This Month Total'}</span>
                                <span className="text-base font-mono font-extrabold text-slate-800 dark:text-white mt-1 block">
                                  {stats.monthlyTotal}
                                </span>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">{lang === 'ml' ? 'ലക്ഷ്യം പൂർത്തിയാക്കിയത്' : 'Target Achieved'}</span>
                                <span className="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                                  {stats.daysCompletedTarget} {lang === 'ml' ? 'ദിവസം' : 'days'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                                {lang === 'ml' ? 'കഴിഞ്ഞ 7 ദിവസത്തെ കൗണ്ടുകൾ' : 'Daily Recitation History (Last 7 Days)'}
                              </span>
                              <div className="h-28 w-full bg-slate-50 dark:bg-slate-950/20 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                      contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                      labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                      {stats.chartData.map((entry, idx) => (
                                        <Cell 
                                          key={`cell-${idx}`} 
                                          fill={entry.count >= activeDhikr.targetCount ? '#10b981' : '#6366f1'} 
                                        />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* MASSIVE REACH / THUMB-TAPPING ZONE BELOW DETAILS */}
                    <div className="relative">
                      {/* Glow background matches progress */}
                      <div className={`absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-3xl blur-xl transition-all duration-300 ${progress >= 1 ? 'scale-105 opacity-100' : 'scale-95 opacity-50'}`} />
                      
                      <button
                        onClick={() => {
                          handleIncrementDhikr(activeDhikr.id);
                          if (navigator.vibrate) {
                            navigator.vibrate(40);
                          }
                        }}
                        className="relative w-full min-h-[300px] sm:min-h-[400px] rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 dark:from-emerald-600 dark:to-teal-700 dark:hover:from-emerald-500 dark:hover:to-teal-600 text-white flex flex-col items-center justify-center p-8 transition-all active:scale-[0.98] cursor-pointer select-none border border-emerald-400/20 dark:border-emerald-500/20 shadow-xl shadow-emerald-500/10 group"
                        id="dhikr_massive_tapping_zone"
                      >
                        {/* Circular decoration */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-10">
                          <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full border-4 border-white" />
                          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border-4 border-white" />
                        </div>

                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-100/80 mb-2">
                          {lang === 'ml' ? 'തള്ളവിരൽ കൊണ്ട് ടാപ്പ് ചെയ്യുക' : 'TAP TO RECIATE / COUNT'}
                        </span>

                        {/* Giant Number Indicator */}
                        <div className="relative font-display font-extrabold text-7xl sm:text-8xl tracking-tight leading-none drop-shadow-md py-4">
                          {activeDhikr.currentCount}
                        </div>

                        {/* Target progress ring mini overlay */}
                        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-white/10 dark:bg-black/20 rounded-full backdrop-blur-sm border border-white/10">
                          <span className="text-xs font-semibold text-emerald-50">
                            {lang === 'ml' ? `ലക്ഷ്യം: ${activeDhikr.targetCount}` : `Daily Target: ${activeDhikr.targetCount}`}
                          </span>
                          {progress >= 1 && (
                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-[10px] text-emerald-200/80 mt-6 font-bold uppercase tracking-wider animate-bounce">
                          {lang === 'ml' ? 'ഇവിടെ ടാപ്പ് ചെയ്യുക' : 'Tap Anywhere Inside This Green Area'}
                        </p>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      )}

      {/* SETTINGS TAB */}
      {subTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="prayer_settings_panel">
          
          {/* Main Calculation Settings */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-display font-semibold text-base text-slate-900 border-b border-slate-100 pb-3">
              Calibrate Math Formulas
            </h3>

            {/* Formula select grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Calculation Method
                </label>
                <select
                  value={state.prayerSettings.calculationMethod}
                  onChange={(e) => handleUpdateSettings({ calculationMethod: e.target.value as PrayerSettings['calculationMethod'] })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="Karachi">University of Islamic Sciences, Karachi (18° / 18°)</option>
                  <option value="MWL">Muslim World League (MWL) (18° / 17°)</option>
                  <option value="ISNA">Islamic Society of North America (ISNA) (15° / 15°)</option>
                  <option value="Egypt">Egyptian General Authority of Survey (19.5° / 17.5°)</option>
                  <option value="Makkah">Umm al-Qura University, Makkah (18.5°)</option>
                  <option value="Tehran">Institute of Geophysics, University of Tehran (17.7° / 14°)</option>
                  <option value="Gulf">Gulf Region (19.5°)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  Controls astronomical twilight angles used for Fajr and Isha calculations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Juristic School (Asr Shadow Ratio)
                </label>
                <select
                  value={state.prayerSettings.school}
                  onChange={(e) => handleUpdateSettings({ school: e.target.value as 'Shafi' | 'Hanafi' })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="Hanafi">Hanafi (Shadow ratio of 2x)</option>
                  <option value="Shafi">Shafi / Maliki / Hanbali / Ja'fari (Shadow ratio of 1x)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  Affects Asr prayer. Hanafi starts later when shadows are twice the object height.
                </p>
              </div>
            </div>

            {/* Manual coordinate inputs */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {lang === 'ml' ? 'കണക്റ്റ് ലൊക്കേഷൻ (മാനുവൽ മോഡ്)' : 'Custom Coordinates (Manual Mode)'}
                </h4>
                <button
                  onClick={handleGetGeolocation}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {lang === 'ml' ? 'ലൊക്കേഷൻ കണ്ടെത്തുക' : 'Detect GPS'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'സ്ഥലത്തിന്റെ പേര്' : 'Location Name'}
                  </label>
                  <input
                    type="text"
                    value={localLocName}
                    onChange={(e) => setLocalLocName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'അക്ഷാംശം (Latitude)' : 'Latitude'}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={localLat}
                    onChange={(e) => setLocalLat(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-mono text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'രേഖാംശം (Longitude)' : 'Longitude'}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={localLng}
                    onChange={(e) => setLocalLng(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-mono text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {isCoordsModified && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={handleApplyCoordinates}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Award className="h-3.5 w-3.5" />
                    {lang === 'ml' ? 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക' : 'Save Calibration Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* New Expanded Detailed Calculation Table */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1 lg:col-span-3 space-y-4" id="manual_adjust_card">
            <div className="flex items-start justify-between">
              <div>
                <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 inline-block">
                  <Sliders className="h-5 w-5" />
                </span>
                <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100 mt-2">
                  {lang === 'ml' ? 'വിശദമായ പ്രാർത്ഥന സമയ ക്രമീകരണങ്ങൾ' : 'Detailed Calculation Table'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  {lang === 'ml' 
                    ? 'ഓരോ സമയത്തെയും അദാൻ മാറ്റങ്ങൾ, ഇഖാമ കാത്തിരിപ്പ് സമയം, ഇഖാമയ്ക്ക് മുൻപുള്ള മുൻകൂർ അലാറങ്ങൾ എന്നിവ ക്രമീകരിക്കുക.' 
                    : 'Independently specify Adhan Offsets, Iqamah Wait Time (minutes after Adhan), and Alarm Before (minutes before Iqamah).'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">{lang === 'ml' ? 'പ്രാർത്ഥന' : 'Prayer'}</th>
                    <th className="py-3 px-4">{lang === 'ml' ? 'അദാൻ മാറ്റം' : 'Adhan Offset (min)'}</th>
                    <th className="py-3 px-4">{lang === 'ml' ? 'ഇഖാമ കാത്തിരിപ്പ്' : 'Iqamah Wait (min)'}</th>
                    <th className="py-3 px-4">{lang === 'ml' ? 'ഇഖാമ അലാറം (മുൻപ്)' : 'Alarm Before (min)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).map((pName) => {
                    const manualOffset = state.prayerSettings.manualOffsets[pName] || 0;
                    const iqamahOffset = (state.prayerSettings.iqamahOffsets && state.prayerSettings.iqamahOffsets[pName]) || 0;
                    const alarmOffset = (state.prayerSettings.alarmOffsets && state.prayerSettings.alarmOffsets[pName]) || 0;

                    return (
                      <tr key={pName} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                        <td className="py-3.5 px-4 font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                          {pName}
                        </td>
                        
                        {/* Adhan Offset */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateOffset(pName, -1)}
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 min-w-[36px] text-center">
                              {manualOffset > 0 ? `+${manualOffset}` : manualOffset}m
                            </span>
                            <button
                              onClick={() => handleUpdateOffset(pName, 1)}
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Iqamah Wait Time */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateIqamahOffset(pName, -1)}
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 min-w-[36px] text-center">
                              {iqamahOffset}m
                            </span>
                            <button
                              onClick={() => handleUpdateIqamahOffset(pName, 1)}
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Alarm Before */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateAlarmOffset(pName, -1)}
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 min-w-[36px] text-center">
                              {alarmOffset}m
                            </span>
                            <button
                              onClick={() => handleUpdateAlarmOffset(pName, 1)}
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* CONFIRMATION OVERLAYS */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-left">
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

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmState(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 transition-all cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUNNAH PRAYER CREATOR MODAL */}
      {isAddingSunnah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-extrabold text-lg text-slate-950 dark:text-white flex items-center gap-2">
                🕌 {lang === 'ml' ? 'കസ്റ്റം സുന്നത്ത് നിസ്കാരം ചേർക്കുക' : 'Add Custom Sunnah Prayer'}
              </h3>
              <button 
                onClick={() => setIsAddingSunnah(false)} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'ml' ? 'നിസ്കാരത്തിന്റെ പേര്' : 'Prayer Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tahajjud, Duha, Ishraq"
                  value={sunnahName}
                  onChange={(e) => setSunnahName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                />
              </div>

              {/* Category, Rakats & Time Grids */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'ml' ? 'വിഭാഗം' : 'Category'}
                  </label>
                  <select
                    value={sunnahCategory}
                    onChange={(e) => setSunnahCategory(e.target.value as SunnahCategory)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-850 dark:text-slate-100"
                  >
                    <option value="Tahajjud">Tahajjud</option>
                    <option value="Duha">Duha</option>
                    <option value="Ishraq">Ishraq</option>
                    <option value="Rawatib">Rawatib</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Rakats */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'ml' ? 'റക്അത്തുകൾ' : 'Rakat Count'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={sunnahRakats}
                    onChange={(e) => setSunnahRakats(Number(e.target.value) || 2)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-850 dark:text-white font-mono"
                  />
                </div>

                {/* Scheduled Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'ml' ? 'സമയം' : 'Scheduled Time'}
                  </label>
                  <input
                    type="time"
                    value={sunnahTime}
                    onChange={(e) => setSunnahTime(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-850 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Alarm Configuration */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {lang === 'ml' ? 'അലാറം സജ്ജീകരിക്കുക' : 'Alarm Reminders'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Receive local browser & system notifications.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sunnahAlarmEnabled}
                    onChange={(e) => setSunnahAlarmEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 h-4.5 w-4.5"
                  />
                </div>

                {sunnahAlarmEnabled && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-150/60 dark:border-slate-800/60">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {lang === 'ml' ? 'അലാറം രീതി' : 'Alarm Signal Type'}
                    </label>
                    <select
                      value={sunnahAlarmType}
                      onChange={(e) => setSunnahAlarmType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                    >
                      <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                      <option value="Vibration Only">Vibration Only</option>
                      <option value="Ringtone Only">Ringtone Only</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Repeat Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'ml' ? 'ആവർത്തനം' : 'Recurrence / Repeat Options'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Once', 'Every day', 'Monday to Friday', 'Custom'] as const).map((mode) => {
                    const isSelected = sunnahRepeat === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSunnahRepeat(mode)}
                        className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                            : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {mode === 'Once' ? 'Once' : mode === 'Every day' ? 'Daily' : mode === 'Monday to Friday' ? 'Weekdays' : 'Custom Days'}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Days Weekday Selector */}
                {sunnahRepeat === 'Custom' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Days</span>
                    <div className="flex gap-1.5">
                      {weekdaysShort.map((day) => {
                        const isSel = sunnahRepeatDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWeekdaySelection(day, sunnahRepeatDays, setSunnahRepeatDays)}
                            className={`w-7 h-7 rounded-full text-[10px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                              isSel
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {day[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
              <button
                onClick={() => setIsAddingSunnah(false)}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSunnah}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10 text-center"
              >
                Save Sunnah Prayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DHIKR COUNTER CREATOR MODAL */}
      {isAddingDhikr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-extrabold text-lg text-slate-950 dark:text-white flex items-center gap-2">
                📿 {lang === 'ml' ? 'കസ്റ്റം ദിക്ർ കൗണ്ടർ ചേർക്കുക' : 'Add Custom Dhikr Counter'}
              </h3>
              <button 
                onClick={() => setIsAddingDhikr(false)} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'ml' ? 'ദിക്റിന്റെ പേര്' : 'Dhikr Phrase / Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subhanallah, Astaghfirullah"
                  value={dhikrName}
                  onChange={(e) => setDhikrName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                />
              </div>

              {/* Target & Time Grids */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Target Recitation count */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'ml' ? 'പ്രതിദിന ലക്ഷ്യം (Target)' : 'Target Count'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={dhikrTarget}
                    onChange={(e) => setDhikrTarget(Number(e.target.value) || 33)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-850 dark:text-white font-mono"
                  />
                </div>

                {/* Scheduled Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'ml' ? 'അറിയിപ്പ് സമയം' : 'Reminder Time'}
                  </label>
                  <input
                    type="time"
                    value={dhikrTime}
                    onChange={(e) => setDhikrTime(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-850 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Alarm Configuration */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {lang === 'ml' ? 'അലാറം ഓർമ്മപ്പെടുത്തലുകൾ' : 'Dhikr Alarms'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Receive system alerts at recitation time.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dhikrAlarmEnabled}
                    onChange={(e) => setDhikrAlarmEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 h-4.5 w-4.5"
                  />
                </div>

                {dhikrAlarmEnabled && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-150/60 dark:border-slate-800/60">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {lang === 'ml' ? 'അലാറം സിഗ്നൽ' : 'Alarm Type'}
                    </label>
                    <select
                      value={dhikrAlarmType}
                      onChange={(e) => setDhikrAlarmType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                    >
                      <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                      <option value="Vibration Only">Vibration Only</option>
                      <option value="Ringtone Only">Ringtone Only</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Repeat Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'ml' ? 'ആവർത്തനം' : 'Recurrence Schedule'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Once', 'Every day', 'Monday to Friday', 'Custom'] as const).map((mode) => {
                    const isSelected = dhikrRepeat === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDhikrRepeat(mode)}
                        className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                            : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {mode === 'Once' ? 'Once' : mode === 'Every day' ? 'Daily' : mode === 'Monday to Friday' ? 'Weekdays' : 'Custom Days'}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Days Weekday Selector */}
                {dhikrRepeat === 'Custom' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Days</span>
                    <div className="flex gap-1.5">
                      {weekdaysShort.map((day) => {
                        const isSel = dhikrRepeatDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWeekdaySelection(day, dhikrRepeatDays, setDhikrRepeatDays)}
                            className={`w-7 h-7 rounded-full text-[10px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                              isSel
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {day[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
              <button
                onClick={() => setIsAddingDhikr(false)}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDhikr}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/10 text-center"
              >
                Save Dhikr Counter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DHIKR COUNTER EDITOR MODAL */}
      {editingDhikr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-extrabold text-lg text-slate-950 dark:text-white flex items-center gap-2">
                📿 {lang === 'ml' ? 'ദിക്ർ എഡിറ്റ് ചെയ്യുക' : 'Edit Dhikr Counter'}
              </h3>
              <button 
                onClick={() => setEditingDhikr(null)} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'ml' ? 'ദിക്റിന്റെ പേര്' : 'Dhikr Phrase / Name'}
                </label>
                <input
                  type="text"
                  value={editingDhikr.name}
                  onChange={(e) => setEditingDhikr({ ...editingDhikr, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                />
              </div>

              {/* Target & Time Grids */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Current Count */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'ml' ? 'ഇപ്പോഴത്തെ എണ്ണം' : 'Current Count'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    value={editingDhikr.currentCount}
                    onChange={(e) => setEditingDhikr({ ...editingDhikr, currentCount: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-850 dark:text-white font-mono"
                  />
                </div>

                {/* Target Recitation count */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'ml' ? 'പ്രതിദിന ലക്ഷ്യം (Target)' : 'Target Count'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={editingDhikr.targetCount}
                    onChange={(e) => setEditingDhikr({ ...editingDhikr, targetCount: Number(e.target.value) || 33 })}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-850 dark:text-white font-mono"
                  />
                </div>

                {/* Scheduled Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'ml' ? 'അറിയിപ്പ് സമയം' : 'Reminder Time'}
                  </label>
                  <input
                    type="time"
                    value={editingDhikr.time || '06:00'}
                    onChange={(e) => setEditingDhikr({ ...editingDhikr, time: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-850 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Alarm Configuration */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {lang === 'ml' ? 'അലാറം ഓർമ്മപ്പെടുത്തലുകൾ' : 'Dhikr Alarms'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Receive system alerts at recitation time.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingDhikr.alarmEnabled || false}
                    onChange={(e) => setEditingDhikr({ ...editingDhikr, alarmEnabled: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 h-4.5 w-4.5"
                  />
                </div>

                {editingDhikr.alarmEnabled && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-150/60 dark:border-slate-800/60">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {lang === 'ml' ? 'അലാറം സിഗ്നൽ' : 'Alarm Type'}
                    </label>
                    <select
                      value={editingDhikr.alarmType || 'Vibration & Ringtone'}
                      onChange={(e) => setEditingDhikr({ ...editingDhikr, alarmType: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                    >
                      <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                      <option value="Vibration Only">Vibration Only</option>
                      <option value="Ringtone Only">Ringtone Only</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Repeat Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'ml' ? 'ആവർത്തനം' : 'Recurrence Schedule'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Once', 'Every day', 'Monday to Friday', 'Custom'] as const).map((mode) => {
                    const isSelected = editingDhikr.repeat === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setEditingDhikr({ ...editingDhikr, repeat: mode, repeatCustomDays: mode === 'Custom' ? (editingDhikr.repeatCustomDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) : undefined })}
                        className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                            : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {mode === 'Once' ? 'Once' : mode === 'Every day' ? 'Daily' : mode === 'Monday to Friday' ? 'Weekdays' : 'Custom Days'}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Days Weekday Selector */}
                {editingDhikr.repeat === 'Custom' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Days</span>
                    <div className="flex gap-1.5">
                      {weekdaysShort.map((day) => {
                        const currentDays = editingDhikr.repeatCustomDays || [];
                        const isSel = currentDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const updatedDays = isSel
                                ? currentDays.filter(d => d !== day)
                                : [...currentDays, day];
                              setEditingDhikr({ ...editingDhikr, repeatCustomDays: updatedDays });
                            }}
                            className={`w-7 h-7 rounded-full text-[10px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                              isSel
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {day[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
              <button
                onClick={() => setEditingDhikr(null)}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                {lang === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (!editingDhikr.name.trim()) return;
                  const list = state.dhikrs || [];
                  const updated = list.map(d => d.id === editingDhikr.id ? {
                    ...editingDhikr,
                    name: editingDhikr.name.trim()
                  } : d);
                  onUpdateState({
                    ...state,
                    dhikrs: updated
                  });
                  setEditingDhikr(null);
                  confetti({ particleCount: 20, spread: 25 });
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/10 text-center"
              >
                {lang === 'ml' ? 'സൂക്ഷിക്കുക' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
