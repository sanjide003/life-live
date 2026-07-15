import { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  ShieldAlert, 
  RotateCcw, 
  Mail, 
  Info,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Bell,
  Plus,
  Volume2,
  Trash2,
  Activity,
  Award,
  ChevronRight
} from 'lucide-react';
import { LifeOSState } from '../types';
import { getInitialState } from '../utils/seedData';
import { saveState } from '../utils/storage';
import { getTranslation, formatString } from '../utils/translations';
import confetti from 'canvas-confetti';

interface SettingsProps {
  state: LifeOSState;
  onUpdateState: (newState: LifeOSState) => void;
  onNavigate?: (tab: string) => void;
}

export default function SettingsComponent({ state, onUpdateState, onNavigate }: SettingsProps) {
  const lang = state.language || 'en';
  const t = (key: any) => getTranslation(key, lang);

  const [backupString, setBackupString] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Custom Alarm Form States
  const [alarmTitle, setAlarmTitle] = useState('');
  const [alarmTime, setAlarmTime] = useState('');
  const [alarmDate, setAlarmDate] = useState('');

  const currentTheme = state.theme || 'light';

  const handleThemeChange = (theme: 'light' | 'dark') => {
    onUpdateState({
      ...state,
      theme
    });
    confetti({ 
      particleCount: 25, 
      spread: 35, 
      colors: theme === 'dark' ? ['#fbbf24', '#f59e0b'] : ['#4f46e5', '#6366f1'] 
    });
  };

  const handleAddCustomAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alarmTitle.trim() || !alarmTime) return;

    const newAlarm = {
      id: `alarm-${Date.now()}`,
      title: alarmTitle.trim(),
      time: alarmTime,
      active: true,
      date: alarmDate || undefined
    };

    onUpdateState({
      ...state,
      customAlarms: [...(state.customAlarms || []), newAlarm]
    });

    setAlarmTitle('');
    setAlarmTime('');
    setAlarmDate('');
    setSuccessMessage(t('alarm_success'));
    setErrorMessage('');
    confetti({ particleCount: 30, spread: 20 });
  };

  const handleToggleCustomAlarm = (alarmId: string) => {
    const updated = (state.customAlarms || []).map(a => 
      a.id === alarmId ? { ...a, active: !a.active } : a
    );
    onUpdateState({ ...state, customAlarms: updated });
  };

  const handleDeleteCustomAlarm = (alarmId: string) => {
    const updated = (state.customAlarms || []).filter(a => a.id !== alarmId);
    onUpdateState({ ...state, customAlarms: updated });
  };

  const handleTogglePrayerAlarm = (prayer: string) => {
    const currentAlarms = state.prayerAlarms || { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
    const currentVal = currentAlarms[prayer] !== false;
    onUpdateState({
      ...state,
      prayerAlarms: {
        ...currentAlarms,
        [prayer]: !currentVal
      }
    });
  };

  // 1. Export Data to Clipboard or File
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      // Copy to clipboard
      navigator.clipboard.writeText(dataStr);
      
      // Auto-trigger text display
      setBackupString(dataStr);
      setSuccessMessage(t('backup_success'));
      setErrorMessage('');
      
      // Trigger download file
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `livelife_os_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 30, spread: 30 });
    } catch (err) {
      setErrorMessage(t('backup_fail'));
    }
  };

  // 2. Import Data from string
  const handleImportData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupString.trim()) return;

    try {
      const parsed = JSON.parse(backupString.trim());
      // basic validation check
      if (!parsed.tasks || !parsed.habits || !parsed.goals || !parsed.accounts) {
        throw new Error('Invalid schema content');
      }

      onUpdateState(parsed);
      setSuccessMessage(t('db_restore_success'));
      setErrorMessage('');
      setBackupString('');
      confetti({ particleCount: 50, spread: 40 });
    } catch (err) {
      setErrorMessage(t('db_restore_fail'));
      setSuccessMessage('');
    }
  };

  // 3. Hard Reset database
  const handleHardReset = () => {
    const msg = lang === 'ml' 
      ? "ആപ്പിലെ എല്ലാ വിവരങ്ങളും മായ്ച്ചു കളഞ്ഞു ആദ്യത്തെ രൂപത്തിലേക്ക് മാറ്റാൻ നിങ്ങൾക്ക് ഉറപ്പാണോ?" 
      : "Are you absolutely sure you want to hard reset Livelife OS? All local custom tasks, habits, and transactions will be cleared and replaced with defaults.";
    if (confirm(msg)) {
      const freshSeed = getInitialState();
      onUpdateState(freshSeed);
      saveState(freshSeed);
      setSuccessMessage(t('db_reset_success'));
      setErrorMessage('');
      confetti({ particleCount: 40, spread: 30 });
    }
  };

  return (
    <div className="space-y-6" id="settings_root">
      {/* Quick Navigation to other System Modules (Health & Reports) */}
      {onNavigate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => onNavigate('health')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-all group flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">{t('health_dashboard')}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t('health_desc')}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 transform group-hover:translate-x-1 transition-transform group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
          </div>

          <div 
            onClick={() => onNavigate('reports')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">{t('closing_reports')}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t('reports_desc')}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 transform group-hover:translate-x-1 transition-transform group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> {t('system_control_center')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            {t('system_control_desc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Language Switcher Option */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => {
                onUpdateState({ ...state, language: 'en' });
                confetti({ particleCount: 20, spread: 25 });
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => {
                onUpdateState({ ...state, language: 'ml' });
                confetti({ particleCount: 20, spread: 25 });
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                lang === 'ml'
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              മലയാളം
            </button>
          </div>

          {/* Light / Dark Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTheme === 'light'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="h-3.5 w-3.5" /> {t('theme_light')}
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTheme === 'dark'
                  ? 'bg-slate-950 text-amber-400 shadow-sm border border-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="h-3.5 w-3.5" /> {t('theme_dark')}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) Settings */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors duration-200" id="fab_customizer_card">
        <div>
          <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> {t('fab_customizer')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {t('fab_customizer_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Size Preset Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('btn_size')}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    const settings = state.fabSettings || { size: 'medium', opacity: 1.0, color: 'indigo', autoHideTime: 0 };
                    onUpdateState({
                      ...state,
                      fabSettings: { ...settings, size: sz }
                    });
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all capitalize cursor-pointer ${
                    (state.fabSettings?.size || 'medium') === sz
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('transparency')}</label>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                {Math.round((state.fabSettings?.opacity || 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.1"
              value={state.fabSettings?.opacity || 1.0}
              onChange={(e) => {
                const settings = state.fabSettings || { size: 'medium', opacity: 1.0, color: 'indigo', autoHideTime: 0 };
                onUpdateState({
                  ...state,
                  fabSettings: { ...settings, opacity: parseFloat(e.target.value) }
                });
              }}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Color Preset Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('color_preset')}</label>
            <div className="flex items-center gap-2">
              {([
                { key: 'indigo', bg: 'bg-indigo-600', border: 'border-indigo-600' },
                { key: 'sky', bg: 'bg-sky-500', border: 'border-sky-500' },
                { key: 'emerald', bg: 'bg-emerald-500', border: 'border-emerald-500' },
                { key: 'rose', bg: 'bg-rose-500', border: 'border-rose-500' },
                { key: 'slate', bg: 'bg-slate-600', border: 'border-slate-600' },
              ] as const).map((clr) => (
                <button
                  key={clr.key}
                  onClick={() => {
                    const settings = state.fabSettings || { size: 'medium', opacity: 1.0, color: 'indigo', autoHideTime: 0 };
                    onUpdateState({
                      ...state,
                      fabSettings: { ...settings, color: clr.key }
                    });
                  }}
                  className={`h-7 w-7 rounded-full ${clr.bg} cursor-pointer transition-all ${
                    (state.fabSettings?.color || 'indigo') === clr.key
                      ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  title={clr.key}
                />
              ))}
            </div>
          </div>

          {/* Auto Hide Delay Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('auto_hide_inactivity')}</label>
            <select
              value={state.fabSettings?.autoHideTime ?? 0}
              onChange={(e) => {
                const settings = state.fabSettings || { size: 'medium', opacity: 1.0, color: 'indigo', autoHideTime: 0 };
                onUpdateState({
                  ...state,
                  fabSettings: { ...settings, autoHideTime: parseInt(e.target.value) }
                });
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="0">{t('always_visible')}</option>
              <option value="5">{t('hide_5s')}</option>
              <option value="10">{t('hide_10s')}</option>
              <option value="15">{t('hide_15s')}</option>
              <option value="30">{t('hide_30s')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Backup & Import vs. App Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Backup export / import panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors duration-200" id="backup_import_card">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-50">{t('offline_backups')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t('offline_backups_desc')}</p>
          </div>

          {/* Feedback messages */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" /> {errorMessage}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            >
              <Download className="h-4 w-4" /> {t('download_backup')}
            </button>
            <span className="text-slate-400 dark:text-slate-500 self-center text-xs font-medium hidden md:inline">{t('or')}</span>
            <div className="text-xs text-slate-500 dark:text-slate-400 self-center">
              {t('restore_desc')}
            </div>
          </div>

          <form onSubmit={handleImportData} className="space-y-3 pt-2">
            <textarea
              rows={6}
              placeholder={t('restore_placeholder')}
              value={backupString}
              onChange={(e) => setBackupString(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Upload className="h-4 w-4" /> {t('restore_state')}
            </button>
          </form>
        </div>

        {/* Info panel & Hard reset */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-200">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-50">{t('app_specs')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t('app_specs_desc')}</p>
          </div>

          <div className="space-y-3.5">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 rounded-lg">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-slate-400">{t('app_name')}</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Livelife</div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 rounded-lg">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-slate-400">{t('owner_credentials')}</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">dsdjamia@gmail.com</div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold">
                id
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-slate-400">{t('android_id')}</div>
                <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">com.dsd003.life</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <span>{t('danger_zone')}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              {t('clear_db_desc')}
            </p>
            <button
              onClick={handleHardReset}
              className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" /> {t('clear_db_btn')}
            </button>
          </div>
        </div>

      </div>

      {/* Alarm, Sound & Reminder Control Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-200" id="alarm_control_panel">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Bell className="h-5 w-5 animate-pulse" />
              </span>
              {t('alarm_control_title')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {t('alarm_control_desc')}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
            Audio Synthesizer Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section A: Daily Prayer Alarms */}
          <div className="space-y-4">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">{t('prayer_alarms')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t('prayer_alarms_desc')}</p>
            </div>

            <div className="space-y-2.5">
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => {
                const isAlarmOn = (state.prayerAlarms?.[prayer] !== false);
                return (
                  <div key={prayer} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 rounded-xl transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg font-mono text-xs font-bold ${
                        isAlarmOn ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600'
                      }`}>
                        {prayer.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{prayer} {t('prayer_alarm_suffix')}</span>
                        <span className="block text-[9px] text-slate-400 font-mono">{t('prayer_alarm_sound_desc')}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleTogglePrayerAlarm(prayer)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                        isAlarmOn ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        isAlarmOn ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Custom Timers and Alarms */}
          <div className="space-y-4">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">{t('create_custom_alarm')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t('create_custom_alarm_desc')}</p>
            </div>

            <form onSubmit={handleAddCustomAlarm} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{t('alarm_label')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('alarm_placeholder')}
                  value={alarmTitle}
                  onChange={(e) => setAlarmTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{t('alarm_time')}</label>
                  <input
                    type="time"
                    required
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{t('alarm_date')}</label>
                  <input
                    type="date"
                    value={alarmDate}
                    onChange={(e) => setAlarmDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4.5 w-4.5" /> {t('add_alarm')}
              </button>
            </form>

            {/* Custom Alarms List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">{t('active_custom_alarms')}</span>
              
              {(!state.customAlarms || state.customAlarms.length === 0) ? (
                <div className="text-center py-5 text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  {t('no_custom_alarms')}
                </div>
              ) : (
                state.customAlarms.map((alarm) => (
                  <div key={alarm.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleToggleCustomAlarm(alarm.id)}
                        className={`p-1.5 rounded-lg ${
                          alarm.active ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <div>
                        <span className={`text-xs font-extrabold block ${alarm.active ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
                          {alarm.title}
                        </span>
                        <span className="text-[9px] font-bold font-mono text-slate-400 flex items-center gap-1">
                          ⏰ {alarm.time} {alarm.date ? `• 📅 ${alarm.date}` : `• ${lang === 'ml' ? 'എല്ലാ ദിവസവും' : 'everyday'}`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCustomAlarm(alarm.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
