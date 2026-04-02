const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update Card Backgrounds and Borders
content = content.replace(/<Card className="bg-slate-50\/50">/g, '<Card className="bg-white border-slate-200 shadow-sm overflow-hidden">');

// Update CardHeaders to give them a distinct background
content = content.replace(/<CardHeader>/g, '<CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">');

// Update Input fields to make them pop out more
content = content.replace(/<Input /g, '<Input className="bg-white border-slate-300 focus-visible:ring-primary/20 shadow-sm" ');

// Remove duplicate classNames injected by previous replace, fixing the new Input styling
content = content.replace(/className="bg-white border-slate-300 focus-visible:ring-primary\/20 shadow-sm" className="h-8 text-sm bg-white"/g, 'className="h-8 text-sm bg-white border-slate-300 focus-visible:ring-primary/20 shadow-sm"');

// Update Textareas
content = content.replace(/<Textarea /g, '<Textarea className="bg-white border-slate-300 focus-visible:ring-primary/20 shadow-sm resize-none" ');
content = content.replace(/className="bg-white border-slate-300 focus-visible:ring-primary\/20 shadow-sm resize-none" \n                            id=/g, 'id=');
content = content.replace(/className="resize-none"/g, 'className="bg-white border-slate-300 focus-visible:ring-primary/20 shadow-sm min-h-[100px]"');

// Update SelectTriggers
content = content.replace(/<SelectTrigger>/g, '<SelectTrigger className="bg-white border-slate-300 shadow-sm">');

// Update the switches to be clearly separated
content = content.replace(/<div className="flex items-center justify-between p-3 border rounded-lg bg-white">/g, '<div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm">');

// Make Labels a bit more prominent
content = content.replace(/<Label htmlFor=/g, '<Label className="text-slate-700 font-semibold mb-1 block" htmlFor=');
content = content.replace(/<Label className="flex-1 cursor-pointer" htmlFor=/g, '<Label className="flex-1 cursor-pointer font-semibold text-slate-700" htmlFor=');

// The custom fields row
content = content.replace(/className="flex items-start gap-2 bg-slate-50 p-2 rounded-md border border-slate-100"/g, 'className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm"');
content = content.replace(/className="h-8 text-sm bg-white border-slate-300 focus-visible:ring-primary\/20 shadow-sm"/g, 'className="h-9 text-sm bg-white border-slate-300 focus-visible:ring-primary/20 shadow-sm"');

// Custom Fields placeholder
content = content.replace(/bg-slate-50 rounded-md border border-dashed border-slate-200/g, 'bg-slate-50 rounded-xl border-2 border-dashed border-slate-200');

fs.writeFileSync(file, content);
