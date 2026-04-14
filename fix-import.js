const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /DialogDescription,\n, DialogFooter } from "@\/components\/ui\/dialog";/,
  `DialogDescription,\n    DialogFooter\n} from "@/components/ui/dialog";`
);

fs.writeFileSync(file, content);
