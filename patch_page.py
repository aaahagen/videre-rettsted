import re

with open('src/app/dashboard/orders/new/page.tsx', 'r') as f:
    content = f.read()

# Let's fix the schema part
content = re.sub(
    r"const orderSchema = z\.object\(\{[\s\S]*?\}\);",
    """const lineItemSchema = z.object({
  description: z.string().min(1, 'Beskrivelse kreves'),
  quantity: z.number().int().min(1),
  type: z.enum(['keg', 'case', 'box', 'other']).default('box'),
  weightPerItem: z.number().optional().default(0),
  length: z.number().optional().default(0),
  width: z.number().optional().default(0),
  height: z.number().optional().default(0),
});

const orderSchema = z.object({
  barcode: z.string().min(3, 'Strekkode må være minst 3 tegn.'),
  placeId: z.string().min(1, 'Du må velge en destinasjon.'),
  description: z.string().min(3, 'Overordnet beskrivelse er påkrevd.'),
  adr: z.boolean().default(false),
  temperatureControlled: z.boolean().default(false),
  fragile: z.boolean().default(false),
  lineItems: z.array(lineItemSchema).min(1, 'Du må legge til minst én vare.'),
});""",
    content
)

# Fix default values
content = re.sub(
    r"defaultValues: \{[\s\S]*?fragile: false,[\s\S]*?\},",
    """defaultValues: {
      barcode: '',
      placeId: '',
      description: '',
      adr: false,
      temperatureControlled: false,
      fragile: false,
      lineItems: [{ description: '', quantity: 1, type: 'box', weightPerItem: 0, length: 0, width: 0, height: 0 }]
    },""",
    content
)

# Add hooks
content = content.replace(
    "const [submitting, setSubmitting] = useState(false);",
    """const [submitting, setSubmitting] = useState(false);
  const { fields: lineItems, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems"
  });
  const currentItems = form.watch("lineItems");
  const volumetrics = calculateVolumetrics(currentItems as any[]);
"""
)

# Fix onSubmit
content = re.sub(
    r"const orderData: Omit<Order, 'id'> = \{[\s\S]*?await firebaseDB\.createOrder\(orderData\);",
    """const orderData: Omit<Order, 'id'> = {
        orgId: userData.orgId,
        placeId: data.placeId,
        status: 'pending',
        barcode: data.barcode,
        createdAt: new Date(),
        updatedAt: new Date(),
        details: {
          description: data.description,
          numberOfItems: volumetrics.totalItems,
          weight: volumetrics.totalWeight,
          volume: volumetrics.totalVolume,
          specialRequirements: {
            adr: data.adr,
            temperatureControlled: data.temperatureControlled,
            fragile: data.fragile,
          },
        },
        lineItems: data.lineItems.map((item, index) => ({
          id: `item-${index}-${Date.now()}`,
          ...item
        }))
      };

      await firebaseDB.createOrder(orderData);""",
    content
)

# Fix toast
content = re.sub(
    r"data\.numberOfItems",
    "volumetrics.totalItems",
    content
)

with open('src/app/dashboard/orders/new/page.tsx', 'w') as f:
    f.write(content)
