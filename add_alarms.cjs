const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Insert after Check Tasks Alarms or something similar. Let's find "Check Bills Alarms" or "Check Prayer Alarms"
const prayerAlarmsMarker = "// 4. Check Prayer Alarms";

const newAlarmsLogic = `
      // Check Extra Sunnah Prayers Alarms
      if (state.extraPrayers) {
        state.extraPrayers.forEach(prayer => {
          if (prayer.alarmEnabled && prayer.time === currentTimeStr) {
            const key = \`sunnah_\${prayer.id}_\${todayStr}_\${currentTimeStr}\`;
            if (!rungKeys.includes(key)) {
              setActiveAlarm({
                id: prayer.id,
                title: \`Sunnah Prayer: \${prayer.name}\`,
                type: 'custom',
                time: prayer.time,
                alarmType: prayer.alarmType || 'Vibration & Ringtone'
              });
              setRungKeys(prev => [...prev, key]);
            }
          }
        });
      }

      // Check Dhikr Alarms
      if (state.dhikrs) {
        state.dhikrs.forEach(dhikr => {
          if (dhikr.alarmEnabled && dhikr.time === currentTimeStr) {
            const key = \`dhikr_\${dhikr.id}_\${todayStr}_\${currentTimeStr}\`;
            if (!rungKeys.includes(key)) {
              setActiveAlarm({
                id: dhikr.id,
                title: \`Dhikr Reminder: \${dhikr.name}\`,
                type: 'custom',
                time: dhikr.time || '',
                alarmType: dhikr.alarmType || 'Vibration & Ringtone'
              });
              setRungKeys(prev => [...prev, key]);
            }
          }
        });
      }

      // 4. Check Prayer Alarms`;

appContent = appContent.replace(prayerAlarmsMarker, newAlarmsLogic);

fs.writeFileSync('src/App.tsx', appContent);
