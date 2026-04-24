const fs = require('fs');

let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

const oldCode = `            {doorCodeEnabled && place.doorCode && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  {doorCodeLabel}
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {place.doorCode}
                </p>
              </div>
            )}`;

const newCode = `            {doorCodeEnabled && place.doorCode && place.doorCode.length > 0 && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  {doorCodeLabel}
                </h2>
                <div className="grid gap-2">
                  {place.doorCode.map((dc, idx) => (
                    <div key={idx} className="border border-gray-200 px-3 py-2 rounded text-sm flex justify-between items-center gap-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase">{dc.category}</span>
                            <span className="font-medium text-black">{dc.name}</span>
                        </div>
                        <span className="font-mono font-bold">{dc.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}`;

code = code.replace(oldCode, newCode);

fs.writeFileSync('src/components/places/print-place.tsx', code);
