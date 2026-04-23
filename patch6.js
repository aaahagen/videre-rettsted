const fs = require('fs');

let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

const importStr = "import { MapPin, Clock, FileText, Info, Hash, User, Calendar } from 'lucide-react';";
code = code.replace(importStr, "import { MapPin, Clock, FileText, Info, Hash, User, Calendar, PhoneCall, Mail } from 'lucide-react';");


const oldRender = `{contactPersonsEnabled && place.contactPersons && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  {contactPersonsLabel}
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {place.contactPersons}
                </p>
              </div>
            )}`;

const newRender = `{contactPersonsEnabled && place.contactPersons && place.contactPersons.length > 0 && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  {contactPersonsLabel}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {place.contactPersons.map((contact, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50 flex flex-col gap-1">
                          {contact.name && <div className="font-semibold text-sm">{contact.name}</div>}
                          {contact.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <PhoneCall className="w-3 h-3" />
                                  <span>{contact.phone}</span>
                              </div>
                          )}
                          {contact.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-3 h-3" />
                                  <span>{contact.email}</span>
                              </div>
                          )}
                      </div>
                  ))}
                </div>
              </div>
            )}`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/components/places/print-place.tsx', code);
