const fs = require('fs');
const routeDetailsFile = 'src/app/dashboard/routes/[id]/page.tsx';
let code = fs.readFileSync(routeDetailsFile, 'utf8');

// Update "Klargjøring (start)" and "Ferdigstilling (slutt)"
const klargjoringOriginal = `<SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="25">25 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>`;

const klargjoringReplacement = `<SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="25">25 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="35">35 min</SelectItem>
                  <SelectItem value="40">40 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="50">50 min</SelectItem>
                  <SelectItem value="55">55 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="75">75 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                </SelectContent>`;
// Use a loop to replace all occurrences since there are two identical menus
while(code.includes(klargjoringOriginal)) {
  code = code.replace(klargjoringOriginal, klargjoringReplacement);
}

// Update "Pause"
const pauseOriginal = `<SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>`;
const pauseReplacement = `<SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="75">75 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                </SelectContent>`;

code = code.replace(pauseOriginal, pauseReplacement);

fs.writeFileSync(routeDetailsFile, code);
