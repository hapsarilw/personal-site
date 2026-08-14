'use client';

import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/use-install-prompt';

export function InstallButton() {
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <Button variant="subtle" size="sm" onClick={promptInstall}>
      INSTALL
    </Button>
  );
}
