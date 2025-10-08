import React from 'react';
import { Card, Text, Flex, Stack, Button } from '@sanity/ui';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

export type ErrorPanelProps = {
  error: string;
  onReload: () => void;
};

const ErrorPanel: React.FC<ErrorPanelProps> = ({ error, onReload }) => (
  <div className="p-6 bg-base-200 min-h-screen">
    <div className="max-w-xl mx-auto">
      <Card padding={5} radius={3} tone="critical" shadow={1}>
        <Stack space={4}>
          <Flex align="center" gap={3}>
            <ShieldAlert className="w-6 h-6 text-error" />
            <Text size={3} weight="semibold">Błąd ładowania grafików</Text>
          </Flex>
          <Text size={2}>{error}</Text>
          <Button mode="ghost" tone="critical" onClick={onReload} icon={RefreshCcw as any} text="Spróbuj ponownie" />
        </Stack>
      </Card>
    </div>
  </div>
);

export default ErrorPanel;
