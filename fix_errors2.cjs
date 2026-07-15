const fs = require('fs');

let prayerContent = fs.readFileSync('src/components/Prayer.tsx', 'utf8');

// Fix Duplicate imports
prayerContent = prayerContent.replace("import { useState, useEffect } from 'react';\nimport { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';");
prayerContent = prayerContent.replace("useState<'tracker' | 'settings'>('tracker')", "useState<'tracker' | 'settings' | 'sunnah-dhikr'>('tracker')");

fs.writeFileSync('src/components/Prayer.tsx', prayerContent);

