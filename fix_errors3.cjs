const fs = require('fs');

let prayerContent = fs.readFileSync('src/components/Prayer.tsx', 'utf8');

prayerContent = prayerContent.replace("import { useState, useEffect } from 'react';\nimport { useState } from 'react';", "import { useState, useEffect } from 'react';");
prayerContent = prayerContent.replace("onSubTabChange?: (tab: 'tracker' | 'settings') => void;", "onSubTabChange?: (tab: 'tracker' | 'settings' | 'sunnah-dhikr') => void;");

// Wait, the error is also src/components/Prayer.tsx(20,22): error TS2345: Argument of type '"settings" | "tracker" | "sunnah-dhikr"' is not assignable to parameter of type '"settings" | "tracker"'.
// Wait, at line 22 it might be: `onSubTabChange(tab);` where `tab` is `'tracker' | 'settings' | 'sunnah-dhikr'` but `onSubTabChange` expects `'tracker' | 'settings'`. Updating `PrayerProps` will fix this.

fs.writeFileSync('src/components/Prayer.tsx', prayerContent);

