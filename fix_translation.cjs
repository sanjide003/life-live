const fs = require('fs');

let prayerContent = fs.readFileSync('src/components/Prayer.tsx', 'utf8');

const oldHandleSettings = `  const handleUpdateSettings = (updates: Partial<PrayerSettings>) => {
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

const newHandleSettings = `  const handleUpdateSettings = (updates: Partial<PrayerSettings>) => {
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
  };`;

prayerContent = prayerContent.replace(oldHandleSettings, newHandleSettings);

fs.writeFileSync('src/components/Prayer.tsx', prayerContent);
