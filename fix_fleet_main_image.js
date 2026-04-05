const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Last time the patch apparently failed to match the Card opening tag exactly.
// Let's find it.
const targetCard = `<Card key={v.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative">`;

const newCard = `<Card key={v.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden bg-white border-slate-200">
                                {v.images && v.images.length > 0 && (
                                    <div className="w-full h-48 relative bg-slate-100 border-b border-slate-100">
                                        <img 
                                            src={v.images.find(img => img.isMain)?.url || v.images[0].url} 
                                            alt={v.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}`;

content = content.replace(targetCard, newCard);
fs.writeFileSync(file, content);
