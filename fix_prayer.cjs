const fs = require('fs');

let content = fs.readFileSync('src/components/Prayer.tsx', 'utf8');

// 1. Add new imports if missing
if (!content.includes('AlertCircle')) {
    content = content.replace('import { ', 'import { AlertCircle, Plus, Trash2, Edit2, Play, Square, ');
}

// 2. Add confirmState and pendingSettings
const stateHooks = `
  const [confirmState, setConfirmState] = useState<{title: string, message: string, onConfirm: () => void, consequence?: string} | null>(null);
  const [pendingSettings, setPendingSettings] = useState<Partial<PrayerSettings> | null>(null);
`;
content = content.replace("const todayStr = new Date().toISOString().split('T')[0];", "const todayStr = new Date().toISOString().split('T')[0];\n" + stateHooks);

// 3. Change handleUpdateSettings to prompt confirmation
const oldHandleSettings = `  const handleUpdateSettings = (updates: Partial<PrayerSettings>) => {
    onUpdateState({
      ...state,
      prayerSettings: {
        ...state.prayerSettings,
        ...updates
      }
    });
  };`;

const newHandleSettings = `  const handleUpdateSettings = (updates: Partial<PrayerSettings>) => {
    setConfirmState({
      title: 'Confirm Formula Change',
      message: 'Are you sure you want to change the calculation formula? This might alter prayer times significantly.',
      consequence: 'Prayer timings will be recalculated according to the newly selected juristic rules.',
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
  };`;
content = content.replace(oldHandleSettings, newHandleSettings);

// 4. Update Time Adjustments Card to include Adhan, Iqamah, Alarm offsets
// Let's find the Manual Offsets panel.
const oldOffsets = `          {/* Manual Offsets Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4" id="manual_adjust_card">
            <div>
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 inline-block">
                <Sliders className="h-5 w-5" />
              </span>
              <h3 className="font-display font-semibold text-base text-slate-900 mt-2">Time Adjustments</h3>
              <p className="text-slate-500 text-xs mt-1">Add or subtract minutes for manual overrides</p>
            </div>
            <div className="space-y-2.5">
              {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).map((pName) => {
                const currentOffset = state.prayerSettings.manualOffsets[pName] || 0;
                return (
                  <div key={pName} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">{pName}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateOffset(pName, -1)}
                        className="p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-800 min-w-[32px] text-center">
                        {currentOffset > 0 ? \`+\${currentOffset}\` : currentOffset}m
                      </span>
                      <button
                        onClick={() => handleUpdateOffset(pName, 1)}
                        className="p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>`;

const newOffsets = `          {/* Advanced Time Adjustments Panel */}
          <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6" id="manual_adjust_card">
            <div>
              <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 inline-block">
                <Sliders className="h-5 w-5" />
              </span>
              <h3 className="font-display font-semibold text-base text-slate-900 mt-2">{lang === 'ml' ? 'സമയ ക്രമീകരണങ്ങൾ' : 'Advanced Time Adjustments'}</h3>
              <p className="text-slate-500 text-xs mt-1">{lang === 'ml' ? 'ബാങ്ക്, ഇഖാമത്ത്, അലാറം എന്നിവയുടെ സമയം ക്രമീകരിക്കുക' : 'Adjust Adhan offsets, Iqamah wait times, and Alarm timings'}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2 px-3">Prayer</th>
                    <th className="py-2 px-3">Adhan Offset (mins)</th>
                    <th className="py-2 px-3">Iqamah Wait (mins)</th>
                    <th className="py-2 px-3">Alarm Before (mins)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).map((pName) => {
                    const adhanOffset = state.prayerSettings.manualOffsets[pName] || 0;
                    const iqamahWait = (state.prayerSettings.iqamahOffsets && state.prayerSettings.iqamahOffsets[pName]) || 0;
                    const alarmBefore = (state.prayerSettings.alarmOffsets && state.prayerSettings.alarmOffsets[pName]) || 0;
                    
                    const handleAdjust = (field: 'manualOffsets' | 'iqamahOffsets' | 'alarmOffsets', val: number) => {
                        const current = state.prayerSettings[field] || {};
                        onUpdateState({
                            ...state,
                            prayerSettings: {
                                ...state.prayerSettings,
                                [field]: {
                                    ...current,
                                    [pName]: (current[pName] || 0) + val
                                }
                            }
                        });
                    };

                    return (
                      <tr key={pName} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-sm text-slate-800">{pName}</td>
                        <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleAdjust('manualOffsets', -1)} className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"><Minus className="h-3 w-3" /></button>
                                <span className="text-xs font-mono font-bold w-6 text-center">{adhanOffset > 0 ? \`+\${adhanOffset}\` : adhanOffset}</span>
                                <button onClick={() => handleAdjust('manualOffsets', 1)} className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"><Plus className="h-3 w-3" /></button>
                            </div>
                        </td>
                        <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleAdjust('iqamahOffsets', -1)} className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200" disabled={iqamahWait <= 0}><Minus className="h-3 w-3" /></button>
                                <span className="text-xs font-mono font-bold w-6 text-center">{iqamahWait}</span>
                                <button onClick={() => handleAdjust('iqamahOffsets', 1)} className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"><Plus className="h-3 w-3" /></button>
                            </div>
                        </td>
                        <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleAdjust('alarmOffsets', -1)} className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200" disabled={alarmBefore <= 0}><Minus className="h-3 w-3" /></button>
                                <span className="text-xs font-mono font-bold w-6 text-center">{alarmBefore}</span>
                                <button onClick={() => handleAdjust('alarmOffsets', 1)} className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"><Plus className="h-3 w-3" /></button>
                            </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>`;

content = content.replace(oldOffsets, newOffsets);

// Wait, the newOffsets was added as a col-span-3, let's fix the layout of the settings tab grid:
// Previously: <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="prayer_settings_panel">
// Manual adjust was in a col-span-1. Now they both are inside the grid.
// If newOffsets is col-span-3, it will take the full width below the "Main Calculation Settings".

// Add the Confirm Modal at the end of the return statement
const modalMarkup = `
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
    </div>
  );
}
`;

content = content.replace("    </div>\n  );\n}", modalMarkup);

fs.writeFileSync('src/components/Prayer.tsx', content);
