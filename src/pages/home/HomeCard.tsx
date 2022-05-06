import { Paper, Title } from '@mantine/core';
import React from 'react';

interface HomeCardProps {
  title: string;
  children: React.ReactNode;
}

export function HomeCard({ title, children }: HomeCardProps): JSX.Element {
  return (
    <Paper shadow="xs" p="md" withBorder={true}>
      <Title order={3} mb="xs">
        {title}
      </Title>

      {children}
    </Paper>
  );
}
