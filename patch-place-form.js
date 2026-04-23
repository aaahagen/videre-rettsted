const fs = require('fs');

let code = fs.readFileSync('src/components/places/place-form.tsx', 'utf8');

code = code.replace(
`  notes: z.string().optional(),
  contactPersons: z.array(z.object({ name: z.string().optional(), phone: z.string().optional(), email: z.string().optional() })).optional(),`,
`  notes: z.string().optional(),
  field3: z.string().optional(),
  contactPersons: z.array(z.object({ name: z.string().optional(), phone: z.string().optional(), email: z.string().optional() })).optional(),`
);

code = code.replace(
`      description: place?.description || '',
      notes: place?.notes || '',
      contactPersons: place?.contactPersons || [{ name: '', phone: '', email: '' }],`,
`      description: place?.description || '',
      notes: place?.notes || '',
      field3: place?.field3 || '',
      contactPersons: place?.contactPersons || [{ name: '', phone: '', email: '' }],`
);

code = code.replace(
`          description: value.description,
          notes: value.notes,
          contactPersons: value.contactPersons,`,
`          description: value.description,
          notes: value.notes,
          field3: value.field3,
          contactPersons: value.contactPersons,`
);

code = code.replace(
`            description: data.description || '',
            notes: data.notes || '',
            contactPersons: data.contactPersons || [],`,
`            description: data.description || '',
            notes: data.notes || '',
            field3: data.field3 || '',
            contactPersons: data.contactPersons || [],`
);

code = code.replace(
`  const contactPersonsEnabled = organization?.fieldSettings?.contactPersons?.enabled ?? false;
  const contactPersonsLabel = organization?.fieldSettings?.contactPersons?.label || "Ekstra Informasjon";
  const contactPersonsPlaceholder = organization?.fieldSettings?.contactPersons?.placeholder || "Skriv inn info her...";`,
`  const field3Enabled = organization?.fieldSettings?.field3?.enabled ?? false;
  const field3Label = organization?.fieldSettings?.field3?.label || "Ekstra Informasjon";
  const field3Placeholder = organization?.fieldSettings?.field3?.placeholder || "Skriv inn info her...";

  const contactPersonsEnabled = organization?.fieldSettings?.contactPersons?.enabled ?? false;
  const contactPersonsLabel = organization?.fieldSettings?.contactPersons?.label || "Kontaktpersoner";
  const contactPersonsPlaceholder = organization?.fieldSettings?.contactPersons?.placeholder || "Kontaktpersoner...";`
);

const oldNotesRender = `{notesEnabled && (
                <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{notesLabel}</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder={notesPlaceholder}
                        className="min-h-[120px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}`;

const newNotesRender = `{notesEnabled && (
                <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{notesLabel}</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder={notesPlaceholder}
                        className="min-h-[120px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}

            {field3Enabled && (
                <FormField
                control={form.control}
                name="field3"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{field3Label}</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder={field3Placeholder}
                        className="min-h-[120px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}`;

code = code.replace(oldNotesRender, newNotesRender);

fs.writeFileSync('src/components/places/place-form.tsx', code);
