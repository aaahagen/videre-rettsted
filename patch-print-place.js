const fs = require('fs');

let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

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

const oldPrintNotesHtml = `{notesEnabled && place.notes && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {notesLabel}
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {place.notes}
                </p>
              </div>
            )}`;

const newPrintNotesAndField3Html = `{notesEnabled && place.notes && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {notesLabel}
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {place.notes}
                </p>
              </div>
            )}

            {field3Enabled && place.field3 && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  {field3Label}
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {place.field3}
                </p>
              </div>
            )}`;


code = code.replace(oldPrintNotesHtml, newPrintNotesAndField3Html);

fs.writeFileSync('src/components/places/print-place.tsx', code);
