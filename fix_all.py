import re

with open('src/lib/types.ts', 'r') as f:
    content = f.read()

# Add scannedCollieIds to Manifest orders
content = re.sub(
    r"loadedItems: number; // Added: Count of items/pallets scanned so far for this order",
    "loadedItems: number;\n    scannedCollieIds?: string[];",
    content
)

# Add processManifestScan to Database interface
content = re.sub(
    r"incrementManifestItemLoadedCount: \(orgId: string, manifestId: string, orderId: string, userId: string\) => Promise<void>;",
    "incrementManifestItemLoadedCount: (orgId: string, manifestId: string, orderId: string, userId: string) => Promise<void>;\n  processManifestScan: (orgId: string, manifestId: string, scannedBarcode: string, userId: string) => Promise<{ success: boolean; message: string }>;",
    content
)

with open('src/lib/types.ts', 'w') as f:
    f.write(content)
