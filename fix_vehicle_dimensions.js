const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetGeneralSection = `                            <Select value={formData.fuelType || 'diesel'} onValueChange={(v) => handleChange('fuelType', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="diesel">Diesel</SelectItem>
                                    <SelectItem value="electric">Elektrisk</SelectItem>
                                    <SelectItem value="gas">Gass (Biogass/LPG)</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>`;

const newGeneralSection = `                            <Select value={formData.fuelType || 'diesel'} onValueChange={(v) => handleChange('fuelType', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="diesel">Diesel</SelectItem>
                                    <SelectItem value="electric">Elektrisk</SelectItem>
                                    <SelectItem value="gas">Gass (Biogass/LPG)</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-50/50">
                <CardHeader>
                    <CardTitle>Fysiske Dimensjoner</CardTitle>
                    <CardDescription>Viktig informasjon for sjåføren angående broer, tunneler og trange veier.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="height">Høyde (meter)</Label>
                            <Input 
                                id="height" 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="F.eks. 3.2" 
                                value={formData.dimensions?.height || ''} 
                                onChange={e => handleChange('dimensions', { ...formData.dimensions, height: parseFloat(e.target.value) || undefined })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="width">Bredde (meter)</Label>
                            <Input 
                                id="width" 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="F.eks. 2.5" 
                                value={formData.dimensions?.width || ''} 
                                onChange={e => handleChange('dimensions', { ...formData.dimensions, width: parseFloat(e.target.value) || undefined })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="length">Lengde (meter)</Label>
                            <Input 
                                id="length" 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="F.eks. 12" 
                                value={formData.dimensions?.length || ''} 
                                onChange={e => handleChange('dimensions', { ...formData.dimensions, length: parseFloat(e.target.value) || undefined })} 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>`;

content = content.replace(targetGeneralSection, newGeneralSection);
fs.writeFileSync(file, content);
