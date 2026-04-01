const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/monitor/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update the top line of the Card
// Old: <div className={`h-2 w-full ${isFinished ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${progress}%`, transition: 'width 1s ease-in-out' }} />
// New: A static pale red/green line across the top.
const topBarRegex = /<div className=\{`h-2 w-full \$\{isFinished \? 'bg-green-500' : 'bg-red-500'\}`\} style=\{\{ width: `\$\{progress\}%`, transition: 'width 1s ease-in-out' \}\} \/>/;
const newTopBar = `<div className={\`h-2 w-full \${isFinished ? 'bg-green-200' : 'bg-red-200'}\`} />`;
content = content.replace(topBarRegex, newTopBar);


// 2. Update the inner Progress bar
// The Shadcn Progress component uses `bg-primary` for the indicator by default.
// We need to override it to be red/green depending on the status.
// We can do this by wrapping it in a div with a specific class that targets the child indicator,
// or by modifying the Progress component. Since we don't want to modify the global Progress component,
// we'll apply a custom CSS class to the Progress wrapper that forces the child bg color.

// Old: <Progress value={progress} className="h-2 bg-slate-100 mb-2" />
// We will replace this with a standard div structure to have full control over the colors, 
// as Shadcn's Progress doesn't easily accept dynamic indicator colors via props without modifying the component itself.

const oldProgressRegex = /<Progress value=\{progress\} className="h-2 bg-slate-100 mb-2" \/>/;

const customProgressBar = `
                   {/* Custom Progress Bar for explicit color control */}
                   <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-2">
                       <div 
                           className={\`h-full w-full flex-1 transition-all duration-1000 ease-in-out \${isFinished ? 'bg-green-500' : 'bg-red-500'}\`}
                           style={{ transform: \`translateX(-\${100 - (progress || 0)}%)\` }}
                       />
                   </div>
`;

content = content.replace(oldProgressRegex, customProgressBar);

fs.writeFileSync(filePath, content);
console.log('Fixed route card progress UI');
