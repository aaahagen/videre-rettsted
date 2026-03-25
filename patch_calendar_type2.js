const fs = require('fs');

const file = 'src/components/ui/calendar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /        IconLeft: \(\{ className, \.\.\.props \}\) => \(/g,
  `        IconLeft: ({ className, ...props }: any) => (`
);
content = content.replace(
  /        IconRight: \(\{ className, \.\.\.props \}\) => \(/g,
  `        IconRight: ({ className, ...props }: any) => (`
);

fs.writeFileSync(file, content);
