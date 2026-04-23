const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

const importStr = "import { MapPin, Clock, Edit, FileText, ChevronLeft, Map, ExternalLink, Printer, Info, Navigation, Bookmark, BookmarkCheck } from 'lucide-react';";
code = code.replace(importStr, "import { MapPin, Clock, Edit, FileText, ChevronLeft, Map, ExternalLink, Printer, Info, Navigation, Bookmark, BookmarkCheck, PhoneCall, Mail } from 'lucide-react';");


const oldRender = `{contactPersonsEnabled && place.contactPersons && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <Info className="mr-2 h-5 w-5 text-primary" />
                          {contactPersonsLabel}
                      </h2>
                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {place.contactPersons}
                      </p>
                  </section>
                )}`;

const newRender = `{contactPersonsEnabled && place.contactPersons && place.contactPersons.length > 0 && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <Info className="mr-2 h-5 w-5 text-primary" />
                          {contactPersonsLabel}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {place.contactPersons.map((contact, index) => (
                            <div key={index} className="p-4 border rounded-md bg-slate-50 flex flex-col gap-2">
                                {contact.name && <div className="font-semibold">{contact.name}</div>}
                                {contact.phone && (
                                    <div className="flex items-center gap-2">
                                        <PhoneCall className="w-4 h-4 text-slate-500" />
                                        <a href={\`tel:\${contact.phone}\`} className="text-primary hover:underline">{contact.phone}</a>
                                    </div>
                                )}
                                {contact.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                        <a href={\`mailto:\${contact.email}\`} className="text-primary hover:underline">{contact.email}</a>
                                    </div>
                                )}
                            </div>
                        ))}
                      </div>
                  </section>
                )}`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
