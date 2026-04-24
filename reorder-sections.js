const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

const section1 = `                {doorCodeEnabled && place.doorCode && place.doorCode.filter(dc => dc.category || dc.name || dc.value).length > 0 && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <Info className="mr-2 h-5 w-5 text-primary" />
                          {doorCodeLabel}
                      </h2>
                      <div className="grid gap-2">
                          {place.doorCode.filter(dc => dc.category || dc.name || dc.value).map((dc, idx) => (
                              <div key={idx} className="bg-white border px-3 py-2 rounded text-sm flex justify-between items-center gap-2">
                                  <div className="flex flex-col">
                                      <span className="text-[10px] text-muted-foreground uppercase">{dc.category}</span>
                                      <span className="font-medium text-slate-700">{dc.name}</span>
                                  </div>
                                  <span className="font-mono font-bold text-primary">{dc.value}</span>
                              </div>
                          ))}
                      </div>
                  </section>
                )}

                {contactPersonsEnabled && place.contactPersons && place.contactPersons.filter(c => c.name || c.phone || c.email).length > 0 && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <Info className="mr-2 h-5 w-5 text-primary" />
                          {contactPersonsLabel}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {place.contactPersons.filter(c => c.name || c.phone || c.email).map((contact, index) => (
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

const section2 = `                <section className="bg-white p-5 rounded-xl shadow-sm border">
                  <h2 className="text-xl font-semibold mb-3 flex items-center">
                      <Map className="mr-2 h-5 w-5 text-primary" />
                      Lokasjon & Kart
                  </h2>
                  <p className="text-lg text-slate-700 mb-3 font-medium">{place.address}</p>
                  
                  {/* Map Preview */}
                  <div className="rounded-xl overflow-hidden border bg-slate-100 mb-6 shadow-md h-[350px]">
                      <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={apiKey ? embedUrl : fallbackEmbedUrl}
                          allowFullScreen
                          title="Google Maps"
                      ></iframe>
                  </div>

                  <Button className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                    <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
                      <Navigation className="mr-2 h-5 w-5" />
                      Åpne i Google Maps
                    </a>
                  </Button>
                </section>`;

code = code.replace(section1 + '\n\n' + section2, section2 + '\n\n' + section1);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
