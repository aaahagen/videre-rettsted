const fs = require('fs');

let code = fs.readFileSync('src/components/places/place-form.tsx', 'utf8');

const oldField = `            {doorCodeEnabled && (
                <FormField
                control={form.control}
                name="doorCode"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{doorCodeLabel}</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder={doorCodePlaceholder}
                        className="min-h-[120px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}`;

const newField = `            {doorCodeEnabled && (
              <div className="space-y-4">
                <FormLabel>{doorCodeLabel}</FormLabel>
                {form.watch('doorCode')?.map((_, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-md">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">Kode/Nøkkel {index + 1}</h4>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const current = form.getValues('doorCode') || [];
                                current.splice(index, 1);
                                form.setValue('doorCode', current);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                        control={form.control}
                        name={\`doorCode.\${index}.category\`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Kategori</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Velg kategori" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="Nøkkel">Nøkkel</SelectItem>
                                <SelectItem value="Kode">Kode</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={\`doorCode.\${index}.name\`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Beskrivelse</FormLabel>
                            <FormControl>
                                <Input placeholder="F.eks. Hovedinngang" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={\`doorCode.\${index}.value\`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Verdi</FormLabel>
                            <FormControl>
                                <Input placeholder={doorCodePlaceholder} {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const current = form.getValues('doorCode') || [];
                    form.setValue('doorCode', [...current, { category: 'Nøkkel', name: '', value: '' }]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Legg til nøkkel / kode
                </Button>
              </div>
            )}`;

code = code.replace(oldField, newField);

fs.writeFileSync('src/components/places/place-form.tsx', code);
