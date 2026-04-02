const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetCardStart = `                            <Card key={v.id} className="flex flex-col h-full bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">`;
const newCardStart = `                            <Card key={v.id} className="flex flex-col h-full bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                {v.images && v.images.length > 0 && (
                                    <div className="w-full h-40 relative bg-slate-100 border-b border-slate-100">
                                        <img 
                                            src={v.images.find(img => img.isMain)?.url || v.images[0].url} 
                                            alt={v.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}`;

content = content.replace(targetCardStart, newCardStart);
fs.writeFileSync(file, content);
