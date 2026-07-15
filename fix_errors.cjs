const fs = require('fs');

let prayerContent = fs.readFileSync('src/components/Prayer.tsx', 'utf8');

prayerContent = prayerContent.replace("import { AlertCircle, Plus, Trash2, Edit2, Play, Square, ", "import { ");
prayerContent = prayerContent.replace("import { useState, useEffect } from 'react';", "");
prayerContent = "import { useState, useEffect } from 'react';\n" + prayerContent;

prayerContent = prayerContent.replace(/import {([^}]+)} from 'lucide-react';/, (match, p1) => {
    let items = p1.split(',').map(i => i.trim());
    const required = ['AlertCircle', 'Trash2', 'Plus', 'Compass'];
    required.forEach(r => {
        if (!items.includes(r)) items.push(r);
    });
    items = [...new Set(items)];
    return `import { ${items.join(', ')} } from 'lucide-react';`;
});

prayerContent = prayerContent.replace("subTab?: 'tracker' | 'settings';", "subTab?: 'tracker' | 'settings' | 'sunnah-dhikr';");
prayerContent = prayerContent.replace("useState<'tracker' | 'settings'>('tracker');", "useState<'tracker' | 'settings' | 'sunnah-dhikr'>('tracker');");
prayerContent = prayerContent.replace("setSubTab = (tab: 'tracker' | 'settings')", "setSubTab = (tab: 'tracker' | 'settings' | 'sunnah-dhikr')");

prayerContent = prayerContent.replace("const todayStr = new Date().toISOString().split('T')[0];", "const todayStr = new Date().toISOString().split('T')[0];\n  const lang = state.language || 'en';");

fs.writeFileSync('src/components/Prayer.tsx', prayerContent);

