const fs = require('fs');

const file = 'src/components/ui/calendar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /components=\{\{/g,
  `components={{...({} as any),`
);

fs.writeFileSync(file, content);
