const fs = require('fs');

let code = fs.readFileSync('src/components/places/place-form.tsx', 'utf8');

const importStr = "import { Camera, MapPin, UploadCloud, Loader2, Trash2, Plus, Save, Star, Clock } from 'lucide-react';";
code = code.replace(importStr, "import { Camera, MapPin, UploadCloud, Loader2, Trash2, Plus, Save, Star, Clock, PhoneCall } from 'lucide-react';");

const oldRender = `{contactPersonsEnabled && (
                <FormField
                control={form.control}
                name="contactPersons"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{contactPersonsLabel}</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder={contactPersonsPlaceholder}
                        className="min-h-[120px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}`;

const newRender = `{contactPersonsEnabled && (
              <div className="space-y-4">
                <FormLabel>{contactPersonsLabel}</FormLabel>
                {form.watch('contactPersons')?.map((_, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-md">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">Kontaktperson {index + 1}</h4>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const current = form.getValues('contactPersons') || [];
                                current.splice(index, 1);
                                form.setValue('contactPersons', current);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={\`contactPersons.\${index}.name\`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Navn</FormLabel>
                          <FormControl>
                            <Input placeholder="Navn..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={\`contactPersons.\${index}.phone\`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                                <Input type="tel" placeholder="Telefon..." {...field} />
                                {field.value && (
                                    <Button type="button" variant="outline" asChild>
                                        <a href={\`tel:\${field.value}\`}>
                                            <PhoneCall className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={\`contactPersons.\${index}.email\`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-post</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="E-post..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = form.getValues('contactPersons') || [];
                    form.setValue('contactPersons', [...current, { name: '', phone: '', email: '' }]);
                  }}
                >
                  Legg til kontaktperson
                </Button>
              </div>
            )}`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/components/places/place-form.tsx', code);
