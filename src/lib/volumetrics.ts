import { LineItem } from './types';

// Standard EUR-Pallet constants
export const EUR_PALLET = {
    length: 120, // cm
    width: 80,   // cm
    maxHeight: 150, // cm
    maxWeight: 800, // kg
    volume: 120 * 80 * 150 // cm3
};

export interface VolumetricCalculation {
    totalItems: number;
    totalWeight: number;
    totalVolume: number; // cm3
    estimatedPallets: number;
    warnings: string[];
}

export function calculateVolumetrics(items: LineItem[]): VolumetricCalculation {
    let totalItems = 0;
    let totalWeight = 0;
    let totalVolume = 0;
    const warnings: string[] = [];

    items.forEach(item => {
        totalItems += item.quantity;
        if (item.weightPerItem) {
            totalWeight += (item.weightPerItem * item.quantity);
        }
        if (item.length && item.width && item.height) {
            totalVolume += (item.length * item.width * item.height * item.quantity);
        }
    });

    // Simple heuristic: 
    // Pallets needed based on weight OR volume, whichever is greater
    const palletsByWeight = totalWeight / EUR_PALLET.maxWeight;
    const palletsByVolume = totalVolume > 0 ? (totalVolume / EUR_PALLET.volume) : 0;
    
    // We add 15% buffer for stacking inefficiency
    const estimatedPallets = Math.max(palletsByWeight, palletsByVolume * 1.15);

    if (totalWeight > EUR_PALLET.maxWeight && estimatedPallets <= 1) {
        warnings.push("Advarsel: Totalvekten overstiger grensen for én standard EUR-pall (800kg). Du må fordele dette på flere paller.");
    }
    
    // We want to return at least something to show it's partially filled
    const palletsToReturn = estimatedPallets > 0 ? Math.max(0.1, Number(estimatedPallets.toFixed(2))) : 0;

    return {
        totalItems,
        totalWeight,
        totalVolume,
        estimatedPallets: palletsToReturn,
        warnings
    };
}
