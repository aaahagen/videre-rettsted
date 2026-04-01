const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/fleet/vehicle-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const importsToAdd = `import { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { firebaseStorage } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';`;

content = content.replace(
    "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';",
    "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';\n" + importsToAdd
);

const stateToAdd = `
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<Array<{ url: string, preview?: string, file?: File }>>(
        initialData?.images || []
    );
    const [isUploading, setIsUploading] = useState(false);

    // Image compression logic
    const processFile = (file: File, callback: (preview: string, resizedFile: File) => void) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const scale = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const preview = canvas.toDataURL('image/jpeg', 0.8);
              canvas.toBlob((blob) => {
                if (blob) {
                    const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
                    callback(preview, resizedFile);
                }
              }, 'image/jpeg', 0.8);
            }
          };
          if (event.target?.result) {
            img.src = event.target.result as string;
          }
        };
        reader.readAsDataURL(file);
    };

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remainingSlots = 8 - images.length;
        const filesToProcess = files.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            processFile(file, (preview, resizedFile) => {
                setImages(prev => [...prev, { url: '', preview, file: resizedFile }]);
            });
        });
        
        if (e.target) e.target.value = '';
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
`;

const stateStartIdx = content.indexOf('const [isSubmitting, setIsSubmitting] = useState(false);');
content = content.slice(0, stateStartIdx + 56) + stateToAdd + '\n    ' + content.slice(stateStartIdx + 56);


const submitRegex = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?try \{[\s\S]*?await onSubmit\(formData\);[\s\S]*?\} finally \{[\s\S]*?setIsSubmitting\(false\);[\s\S]*?\}[\s\S]*?\};/;

const newSubmit = `const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsUploading(true);
        try {
            const finalImages = [];
            for (const img of images) {
                if (img.file) {
                    const ext = img.file.name.split('.').pop() || 'jpg';
                    // We don't have vehicle ID yet if it's new, so use a random folder
                    const vehicleIdFolder = initialData?.id || \`temp_\${uuidv4()}\`;
                    const path = \`vehicles/\${vehicleIdFolder}/\${uuidv4()}.\${ext}\`;
                    const url = await firebaseStorage.uploadFile(path, img.file);
                    finalImages.push({ url });
                } else {
                    finalImages.push({ url: img.url });
                }
            }
            
            await onSubmit({ ...formData, images: finalImages });
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };`;

content = content.replace(submitRegex, newSubmit);

const imagesUI = `
            {/* Images Section */}
            <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Kjøretøybilder</h3>
                        <p className="text-xs text-muted-foreground">Maks 8 bilder.</p>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {images.length} / 8
                    </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative group rounded-md overflow-hidden border">
                            <div className="relative aspect-square w-full">
                                <Image
                                    src={img.preview || img.url}
                                    alt={\`Bilde \${index + 1}\`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <Button 
                                type="button"
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    
                    {images.length < 8 && (
                        <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="sr-only"
                              ref={fileInputRef}
                              onChange={handleAddImages}
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="h-full aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground"
                                onClick={(e) => {
                                  e.preventDefault();
                                  fileInputRef.current?.click();
                                }}
                            >
                              <UploadCloud className="h-6 w-6" />
                              <span className="text-xs">Last opp</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
`;

content = content.replace(
    /<div className="flex justify-end gap-3 border-t pt-6">/,
    imagesUI + '\n            <div className="flex justify-end gap-3 border-t pt-6">'
);

content = content.replace(
    "{isSubmitting ? <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" /> : null}",
    "{(isSubmitting || isUploading) ? <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" /> : null}"
);
content = content.replace(
    "<Button type=\"submit\" disabled={isSubmitting}>",
    "<Button type=\"submit\" disabled={isSubmitting || isUploading}>"
);


fs.writeFileSync(filePath, content);
console.log('Added image upload to Vehicle Form');
