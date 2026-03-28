const fs = require('fs');

const selectFile = 'src/components/ui/select.tsx';
let code = fs.readFileSync(selectFile, 'utf8');

// The "shivering" or jumping when scrolling to the end of a Radix Select 
// is usually caused by the Viewport height calculation in combination with popper.
// Specifically, this line: h-[var(--radix-select-trigger-height)]

// Let's replace the problematic Viewport class calculation.
const originalViewportClass = `"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"`;
const newViewportClass = `"h-[var(--radix-select-content-available-height)] w-full min-w-[var(--radix-select-trigger-width)]"`;

code = code.replace(originalViewportClass, newViewportClass);

fs.writeFileSync(selectFile, code);

