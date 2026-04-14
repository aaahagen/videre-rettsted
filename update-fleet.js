const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /} from "@\/components\/ui\/dialog";/,
  `, DialogFooter } from "@/components/ui/dialog";\nimport { Input } from "@/components/ui/input";\nimport { Label } from "@/components/ui/label";`
);

content = content.replace(
  /const \[stats, setStats\] = useState.+;/,
  `const [stats, setStats] = useState({ ready: 0, pending_workshop: 0, workshop: 0, observation: 0, on_tour: 0, parked: 0 });\n    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);\n    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");`
);

content = content.replace(
  /const handleDeleteClick = async \(e: React\.MouseEvent, vehicle: Vehicle\) => {[\s\S]+?};/,
  `const handleDeleteClick = async (e: React.MouseEvent, vehicle: Vehicle) => {
        e.preventDefault();
        e.stopPropagation();
        setVehicleToDelete(vehicle);
    };

    const confirmDelete = async () => {
        if (!vehicleToDelete || deleteConfirmationText !== "slett kjøretøy") return;
        try {
            await firebaseDB.deleteVehicle(vehicleToDelete.id);
            toast({ title: "Slettet", description: "Kjøretøyet ble fjernet." });
            setVehicleToDelete(null);
            setDeleteConfirmationText("");
            await loadVehicles();
        } catch (error: any) {
            console.error("Failed to delete vehicle:", error);
            toast({ 
                title: "Feil", 
                description: \`Kunne ikke slette kjøretøyet: \${error.message || 'Ukjent feil'}\`, 
                variant: "destructive" 
            });
        }
    };`
);

content = content.replace(
  /<\/Dialog>\n            <\/div>\n        <\/TooltipProvider>/,
  `</Dialog>

                <Dialog open={!!vehicleToDelete} onOpenChange={(open) => {
                    if (!open) {
                        setVehicleToDelete(null);
                        setDeleteConfirmationText("");
                    }
                }}>
                    <DialogContent className="max-w-md" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Bekreft sletting</DialogTitle>
                            <DialogDescription>
                                Er du sikker på at du vil slette <strong>{vehicleToDelete?.name}</strong>? Dette kan ikke angres.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <Label htmlFor="confirm-delete">Skriv "slett kjøretøy" for å bekrefte</Label>
                            <Input 
                                id="confirm-delete"
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                placeholder="slett kjøretøy"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setVehicleToDelete(null); setDeleteConfirmationText(""); }}>Avbryt</Button>
                            <Button variant="destructive" onClick={confirmDelete} disabled={deleteConfirmationText !== "slett kjøretøy"}>Slett Kjøretøy</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>`
);

fs.writeFileSync(file, content);
