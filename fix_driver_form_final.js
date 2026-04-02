const fs = require('fs');
const path = require('path');

let formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let formCode = fs.readFileSync(formPath, 'utf8');

// The build log points to an extra `</div>` before `</CardContent>` at the end of the "Kompetanse" card.
// Let's remove it.
const incorrectJSX = `                        )}

                        </div>
                        </CardContent>`;

const correctedJSX = `                        )}
                        </CardContent>`;

// Let's also ensure the skills div is correctly closed, which was the original problem.
const skillsBlock = `                                <div className="flex flex-wrap gap-2 pt-2">
                                    {skills.map((skill, i) => (<div key={i} className="flex items-center gap-1 bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm font-medium border border-slate-300"> {skill} <button type="button" onClick={() => removeSkill(skill)} className="hover:text-slate-900 ml-1"><X className="h-3 w-3" /></button></div>))}
                                </div>
                            
                            <div className="space-y-2 col-span-2 pt-2 border-t">`;
                            
const fixedSkillsBlock = `                                <div className="flex flex-wrap gap-2 pt-2">
                                    {skills.map((skill, i) => (<div key={i} className="flex items-center gap-1 bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm font-medium border border-slate-300"> {skill} <button type="button" onClick={() => removeSkill(skill)} className="hover:text-slate-900 ml-1"><X className="h-3 w-3" /></button></div>))}
                                </div>
                            </div>
                            <div className="space-y-2 col-span-2 pt-2 border-t">`;

if(formCode.includes(skillsBlock)) {
    formCode = formCode.replace(skillsBlock, fixedSkillsBlock);
}

if(formCode.includes(incorrectJSX)) {
    formCode = formCode.replace(incorrectJSX, correctedJSX);
}


fs.writeFileSync(formPath, formCode);
