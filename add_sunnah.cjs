const fs = require('fs');
let content = fs.readFileSync('src/components/Prayer.tsx', 'utf8');

// Add sunnah-dhikr tab
const settingsTabMarker = `{/* SETTINGS TAB */}`;

const sunnahTabContent = `
      {/* SUNNAH & DHIKR TAB */}
      {subTab === 'sunnah-dhikr' && (
        <div className="space-y-6" id="sunnah_dhikr_panel">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Extra Sunnah Prayers Section */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <Compass className="h-5 w-5 text-indigo-500" />
                            {lang === 'ml' ? 'സുന്നത്ത് നിസ്കാരങ്ങൾ' : 'Extra Sunnah Prayers'}
                        </h3>
                        <button 
                            onClick={() => {
                                const newPrayer = {
                                    id: Date.now().toString(),
                                    name: 'Tahajjud',
                                    time: '03:00',
                                    alarmEnabled: true,
                                    alarmType: 'Vibration & Ringtone' as const
                                };
                                onUpdateState({
                                    ...state,
                                    extraPrayers: [...(state.extraPrayers || []), newPrayer]
                                });
                            }}
                            className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {!(state.extraPrayers?.length) ? (
                            <div className="text-center py-6">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {lang === 'ml' ? 'സുന്നത്ത് നിസ്കാരങ്ങൾ ചേർത്തിട്ടില്ല.' : 'No extra prayers added.'}
                                </p>
                            </div>
                        ) : (
                            state.extraPrayers.map((prayer, i) => (
                                <div key={prayer.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between gap-3 group">
                                    <div className="flex-1 min-w-0">
                                        <input 
                                            value={prayer.name} 
                                            onChange={(e) => {
                                                const copy = [...state.extraPrayers!];
                                                copy[i].name = e.target.value;
                                                onUpdateState({ ...state, extraPrayers: copy });
                                            }}
                                            className="font-bold text-sm text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 w-full"
                                            placeholder="Prayer Name"
                                        />
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <input 
                                                type="time" 
                                                value={prayer.time}
                                                onChange={(e) => {
                                                    const copy = [...state.extraPrayers!];
                                                    copy[i].time = e.target.value;
                                                    onUpdateState({ ...state, extraPrayers: copy });
                                                }}
                                                className="text-xs font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300"
                                            />
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={prayer.alarmEnabled}
                                                    onChange={(e) => {
                                                        const copy = [...state.extraPrayers!];
                                                        copy[i].alarmEnabled = e.target.checked;
                                                        onUpdateState({ ...state, extraPrayers: copy });
                                                    }}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 h-3.5 w-3.5"
                                                />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Alarm</span>
                                            </label>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setConfirmState({
                                                title: 'Delete Prayer',
                                                message: \`Are you sure you want to delete "\${prayer.name}"?\`,
                                                onConfirm: () => {
                                                    onUpdateState({
                                                        ...state,
                                                        extraPrayers: state.extraPrayers!.filter(p => p.id !== prayer.id)
                                                    });
                                                }
                                            });
                                        }}
                                        className="p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Dhikr Counter Section */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="text-lg leading-none">📿</span>
                            {lang === 'ml' ? 'ദിക്ർ കൗണ്ടറുകൾ' : 'Dhikr Counters'}
                        </h3>
                        <button 
                            onClick={() => {
                                const newDhikr = {
                                    id: Date.now().toString(),
                                    name: 'Subhanallah',
                                    targetCount: 33,
                                    currentCount: 0,
                                    time: '06:00',
                                    alarmEnabled: false,
                                };
                                onUpdateState({
                                    ...state,
                                    dhikrs: [...(state.dhikrs || []), newDhikr]
                                });
                            }}
                            className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {!(state.dhikrs?.length) ? (
                            <div className="text-center py-6">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {lang === 'ml' ? 'ദിക്റുകൾ ചേർത്തിട്ടില്ല.' : 'No dhikrs added.'}
                                </p>
                            </div>
                        ) : (
                            state.dhikrs.map((dhikr, i) => (
                                <div key={dhikr.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3 group">
                                    <div className="flex items-center justify-between gap-3">
                                        <input 
                                            value={dhikr.name} 
                                            onChange={(e) => {
                                                const copy = [...state.dhikrs!];
                                                copy[i].name = e.target.value;
                                                onUpdateState({ ...state, dhikrs: copy });
                                            }}
                                            className="font-bold text-sm text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 w-full"
                                            placeholder="Dhikr Name"
                                        />
                                        <button 
                                            onClick={() => {
                                                setConfirmState({
                                                    title: 'Delete Dhikr',
                                                    message: \`Are you sure you want to delete "\${dhikr.name}"?\`,
                                                    onConfirm: () => {
                                                        onUpdateState({
                                                            ...state,
                                                            dhikrs: state.dhikrs!.filter(d => d.id !== dhikr.id)
                                                        });
                                                    }
                                                });
                                            }}
                                            className="p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        {/* Circular Progress & Clicker */}
                                        <button 
                                            onClick={() => {
                                                const copy = [...state.dhikrs!];
                                                if (copy[i].currentCount < copy[i].targetCount) {
                                                    copy[i].currentCount++;
                                                    onUpdateState({ ...state, dhikrs: copy });
                                                } else {
                                                    // Reset
                                                    copy[i].currentCount = 0;
                                                    onUpdateState({ ...state, dhikrs: copy });
                                                }
                                            }}
                                            className="relative w-16 h-16 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer overflow-hidden"
                                        >
                                            {/* Progress Fill */}
                                            <div 
                                                className="absolute bottom-0 left-0 right-0 bg-emerald-100 dark:bg-emerald-900/30 transition-all duration-300"
                                                style={{ height: \`\${(dhikr.currentCount / dhikr.targetCount) * 100}%\` }}
                                            />
                                            <span className="relative z-10 font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                                {dhikr.currentCount}
                                            </span>
                                        </button>
                                        
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-semibold uppercase">Target</span>
                                                <input 
                                                    type="number"
                                                    value={dhikr.targetCount}
                                                    onChange={(e) => {
                                                        const copy = [...state.dhikrs!];
                                                        copy[i].targetCount = Number(e.target.value) || 1;
                                                        onUpdateState({ ...state, dhikrs: copy });
                                                    }}
                                                    className="w-14 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 font-mono font-bold text-slate-800 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-semibold uppercase">Time</span>
                                                <input 
                                                    type="time"
                                                    value={dhikr.time || '00:00'}
                                                    onChange={(e) => {
                                                        const copy = [...state.dhikrs!];
                                                        copy[i].time = e.target.value;
                                                        onUpdateState({ ...state, dhikrs: copy });
                                                    }}
                                                    className="w-20 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 font-mono font-semibold text-slate-800 dark:text-white"
                                                />
                                            </div>
                                            <label className="flex items-center justify-end gap-1.5 cursor-pointer pt-1">
                                                <input 
                                                    type="checkbox" 
                                                    checked={dhikr.alarmEnabled}
                                                    onChange={(e) => {
                                                        const copy = [...state.dhikrs!];
                                                        copy[i].alarmEnabled = e.target.checked;
                                                        onUpdateState({ ...state, dhikrs: copy });
                                                    }}
                                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 h-3 w-3"
                                                />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Alarm</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
      )}
`;

content = content.replace(settingsTabMarker, sunnahTabContent + '\n      ' + settingsTabMarker);

fs.writeFileSync('src/components/Prayer.tsx', content);
