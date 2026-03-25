const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import \{ Loader2, Trash2, GripVertical, Wand2 \} from 'lucide-react';/g,
  `import { Loader2, Trash2, GripVertical, Wand2, Save, Route as RouteIcon, MapPin, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';`
);

content = content.replace(
  /  return \(\n    <div className="container mx-auto px-4 py-8">\n      <div className="flex justify-between items-center mb-6">\n        <Input className="text-3xl font-bold" value=\{route.name\} onChange=\{\(e\) => setRoute\(\{...route, name: e.target.value\}\)\}\/>\n        <div className="flex items-center gap-4">\n          \{isCalculating \? <Loader2 className="h-6 w-6 animate-spin" \/> : <span className="text-xl font-bold">\{distance\}<\/span>\}\n          \{routePlaces.length > 2 && \(\n             <Button variant="outline" onClick=\{handleOptimizeRoute\} disabled=\{isOptimizing \|\| isSaving\}>\n               \{isOptimizing \? <Loader2 className="mr-2 h-4 w-4 animate-spin" \/> : <Wand2 className="mr-2 h-4 w-4" \/>\}\n               Optimer\n             <\/Button>\n          \)\}\n          <Button onClick=\{handleSave\} disabled=\{isSaving\}>\n            \{isSaving \? <Loader2 className="mr-2 h-4 w-4 animate-spin" \/> : 'Lagre'\}\n          <\/Button>\n        <\/div>\n      <\/div>/g,
  `  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-4 hover:text-foreground transition-colors w-fit">
          <ChevronLeft className="h-4 w-4" />
          <Link href="/dashboard/routes" className="text-sm font-medium">Tilbake til Ruter</Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <RouteIcon className="h-8 w-8 text-primary" />
              </div>
              <Input 
                className="text-3xl font-bold h-auto py-2 border-transparent hover:border-input focus:border-input bg-transparent shadow-none" 
                value={route.name} 
                onChange={(e) => setRoute({...route, name: e.target.value})}
                placeholder="Navn på rute..."
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm px-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{routePlaces.length} {routePlaces.length === 1 ? 'stopp' : 'stopp'}</span>
              </div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div className="flex items-center gap-2">
                {isCalculating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Badge variant={distance === 'Error' ? 'destructive' : 'secondary'} className="text-sm px-3 py-1">
                    {distance === 'Error' ? 'Kunne ikke beregne' : distance}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start">
            {routePlaces.length > 2 && (
               <Button 
                 variant="outline" 
                 size="lg"
                 className="shadow-sm font-semibold"
                 onClick={handleOptimizeRoute} 
                 disabled={isOptimizing || isSaving}
               >
                 {isOptimizing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5 text-indigo-500" />}
                 Optimer Rute
               </Button>
            )}
            <Button 
              size="lg" 
              className="shadow-sm font-semibold px-8"
              onClick={handleSave} 
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Lagre Endringer
            </Button>
          </div>
        </div>
      </div>

      <Separator />`
);

content = content.replace(
  /      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">/g,
  `      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">`
);

content = content.replace(
  /        <Card>/g,
  `        <Card className="lg:col-span-5 h-fit sticky top-6 border-slate-200 shadow-sm">`
);

content = content.replace(
  /        <\/Card>\n        \n        <Card>/g,
  `        </Card>
        
        <Card className="lg:col-span-7 border-slate-200 shadow-sm">`
);

content = content.replace(
  /                          <span>\{index \+ 1\}\. \{place\.name\}<\/span>\n                          <Button variant="ghost" size="sm" onClick=\{\(\) => handleRemovePlace\(place\.id\)\}>\n                            <Trash2 className="h-4 w-4" \/>\n                          <\/Button>/g,
  `                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="flex items-center justify-center bg-background rounded-full h-6 w-6 text-xs font-medium text-muted-foreground shrink-0 border shadow-sm">
                              {index + 1}
                            </span>
                            <span className="font-medium truncate">{place.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive hover:bg-destructive/10 shrink-0" onClick={() => handleRemovePlace(place.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>`
);

fs.writeFileSync(file, content);
