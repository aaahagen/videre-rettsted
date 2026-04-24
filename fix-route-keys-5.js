const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

const oldCheck = `{!isEditMode && routeItems.filter(i => i.type === 'place').some(item => item.place?.doorCode && item.place.doorCode.some(dc => dc.category === 'Nøkkel')) && (`;
const newCheck = `{!isEditMode && routeItems.filter(i => i.type === 'place').some(item => { const p = allPlaces.find(pl => pl.id === item.placeId); return p?.doorCode && p.doorCode.some(dc => dc.category === 'Nøkkel'); }) && (`;

code = code.replace(oldCheck, newCheck);

const oldFilter = `                              .filter(item => item.place?.doorCode && item.place.doorCode.some(dc => dc.category === 'Nøkkel'))
                              .map(item => {
                                  const keys = item.place!.doorCode!.filter(dc => dc.category === 'Nøkkel');
                                  return (
                                      <div key={item.id} className="p-3 bg-white border border-amber-200 rounded-md flex flex-col gap-2 shadow-sm">
                                          <p className="font-semibold text-sm truncate text-slate-800">{item.place?.name}</p>`;

const newFilter = `                              .filter(item => { const p = allPlaces.find(pl => pl.id === item.placeId); return p?.doorCode && p.doorCode.some(dc => dc.category === 'Nøkkel'); })
                              .map(item => {
                                  const p = allPlaces.find(pl => pl.id === item.placeId);
                                  const keys = p!.doorCode!.filter(dc => dc.category === 'Nøkkel');
                                  return (
                                      <div key={item.id} className="p-3 bg-white border border-amber-200 rounded-md flex flex-col gap-2 shadow-sm">
                                          <p className="font-semibold text-sm truncate text-slate-800">{p?.name}</p>`;

code = code.replace(oldFilter, newFilter);

fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', code);
