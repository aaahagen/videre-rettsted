const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/places/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state for author name
content = content.replace(
    'const [isEditing, setIsEditing] = useState(false);',
    'const [isEditing, setIsEditing] = useState(false);\n  const [authorName, setAuthorName] = useState<string | null>(null);'
);

// 2. Add useEffect to fetch author name
const effectInsertion = `
  useEffect(() => {
    async function fetchAuthorName() {
      if (place?.createdBy) {
        const author = await firebaseDB.getUser(place.createdBy);
        setAuthorName(author?.name || 'Ukjent bruker');
      }
    }
    fetchAuthorName();
  }, [place?.createdBy]);
`;
const effectTarget = 'useEffect(() => {';
content = content.replace(effectTarget, effectTarget + effectInsertion);

// 3. Update the UI
content = content.replace(
    "<span>Lagt til av: <span className=\"font-medium text-slate-900\">{place.authorName || 'Ukjent bruker'}</span></span>",
    "<span>Lagt til av: <span className=\"font-medium text-slate-900\">{authorName || 'Laster...'}</span></span>"
);

fs.writeFileSync(filePath, content);
console.log('Patched place details page');
