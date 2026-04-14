const fs = require('fs');
const file = 'src/components/workforce/time-stamp-card.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const handleStartShift = \(\) => setConfirmStartOpen\(true\);/,
  `const handleStartShift = () => {
        if (isOutOfRange) {
            toast({
                title: "Kan ikke starte vakt",
                description: \`Du må være innenfor tillatt område (\${driverProfile?.baseLocation?.radius || organization?.mainDepot?.radius || 500}m fra depotet) for å stemple inn.\`,
                variant: "destructive",
            });
            return;
        }
        setConfirmStartOpen(true);
    };`
);

fs.writeFileSync(file, content);
