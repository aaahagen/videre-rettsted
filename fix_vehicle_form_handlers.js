const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetHandlers = `    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };`;

const newHandlers = `    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddCustomField = () => {
        const currentFields = formData.capabilities?.customFields || [];
        handleChange('capabilities', {
            ...formData.capabilities,
            customFields: [...currentFields, { name: '', value: '' }]
        });
    };

    const handleUpdateCustomField = (index: number, field: 'name' | 'value', value: string) => {
        const currentFields = [...(formData.capabilities?.customFields || [])];
        currentFields[index] = { ...currentFields[index], [field]: value };
        handleChange('capabilities', {
            ...formData.capabilities,
            customFields: currentFields
        });
    };

    const handleRemoveCustomField = (index: number) => {
        const currentFields = (formData.capabilities?.customFields || []).filter((_, i) => i !== index);
        handleChange('capabilities', {
            ...formData.capabilities,
            customFields: currentFields
        });
    };`;

content = content.replace(targetHandlers, newHandlers);
fs.writeFileSync(file, content);
