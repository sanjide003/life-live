const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const oldPrayerAlarms = `      // 4. Check Prayer Alarms
      const prayerAlarms = state.prayerAlarms || {};
      const prayersToday = state.prayers.find(p => p.date === todayStr);
      const currentTimes = calculatePrayerTimes(todayStr, state.prayerSettings);

      const prayersList: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      prayersList.forEach(prayer => {
        const isAlarmOn = prayerAlarms[prayer] !== false;
        const isDone = prayersToday?.completed[prayer] === true;
        const pTime = currentTimes[prayer];

        if (isAlarmOn && !isDone && pTime === currentTimeStr) {
          const key = \`prayer_\${prayer}_\${todayStr}_\${currentTimeStr}\`;
          if (!rungKeys.includes(key)) {
            setActiveAlarm({
              id: \`prayer_\${prayer}\`,
              title: \`\${prayer} Adhan: Time to offer your prayers!\`,
              type: 'prayer',
              time: pTime,
              originalId: prayer
            });
            setRungKeys(prev => [...prev, key]);
            playAlarmSound('prayer');
          }
        }
      });`;

const newPrayerAlarms = `      // Helper to add minutes to HH:MM
      const addMinutes = (timeStr: string, mins: number) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        d.setMinutes(d.getMinutes() + mins);
        return \`\${String(d.getHours()).padStart(2, '0')}:\${String(d.getMinutes()).padStart(2, '0')}\`;
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
          const key = \`prayer_adhan_\${prayer}_\${todayStr}_\${currentTimeStr}\`;
          if (!rungKeys.includes(key)) {
            setActiveAlarm({
              id: \`prayer_adhan_\${prayer}\`,
              title: \`\${prayer} Adhan: Time to offer your prayers!\`,
              type: 'prayer',
              time: pTime,
              originalId: prayer
            });
            setRungKeys(prev => [...prev, key]);
            playAlarmSound('prayer');
          }
        }

        // Custom Iqamah Pre-Alarm
        if (isAlarmOn && !isDone && alarmOffset > 0 && alarmTime === currentTimeStr) {
          const key = \`prayer_iqamah_alarm_\${prayer}_\${todayStr}_\${currentTimeStr}\`;
          if (!rungKeys.includes(key)) {
            setActiveAlarm({
              id: \`prayer_iqamah_\${prayer}\`,
              title: \`\${prayer} Iqamah in \${alarmOffset} mins!\`,
              type: 'prayer',
              time: alarmTime,
              originalId: prayer
            });
            setRungKeys(prev => [...prev, key]);
            playAlarmSound('prayer');
          }
        }
      });`;

appContent = appContent.replace(oldPrayerAlarms, newPrayerAlarms);

fs.writeFileSync('src/App.tsx', appContent);
