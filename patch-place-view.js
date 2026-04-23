const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

code = code.replace(
`  const notesEnabled = organization?.fieldSettings?.notes?.enabled ?? true;
  const notesLabel = organization?.fieldSettings?.notes?.label || "Beskrivelse & Instruksjoner 2";

  const contactPersonsEnabled = organization?.fieldSettings?.contactPersons?.enabled ?? false;`,
`  const notesEnabled = organization?.fieldSettings?.notes?.enabled ?? true;
  const notesLabel = organization?.fieldSettings?.notes?.label || "Beskrivelse & Instruksjoner 2";

  const field3Enabled = organization?.fieldSettings?.field3?.enabled ?? false;
  const field3Label = organization?.fieldSettings?.field3?.label || "Ekstra Informasjon";

  const contactPersonsEnabled = organization?.fieldSettings?.contactPersons?.enabled ?? false;`
);

const oldNotesSectionHtml = `{notesEnabled && place.notes && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-primary" />
                          {notesLabel}
                      </h2>
                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {place.notes}
                      </p>
                  </section>
                )}`;

const newNotesAndField3SectionHtml = `{notesEnabled && place.notes && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-primary" />
                          {notesLabel}
                      </h2>
                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {place.notes}
                      </p>
                  </section>
                )}

                {field3Enabled && place.field3 && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <Info className="mr-2 h-5 w-5 text-primary" />
                          {field3Label}
                      </h2>
                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {place.field3}
                      </p>
                  </section>
                )}`;

code = code.replace(oldNotesSectionHtml, newNotesAndField3SectionHtml);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
