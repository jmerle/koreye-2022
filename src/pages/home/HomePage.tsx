import { Container, Stack, Text } from '@mantine/core';
import { HomeCard } from './HomeCard';
import { LoadFromElsewhere } from './LoadFromElsewhere';
import { LoadFromFile } from './LoadFromFile';
import { LoadFromKaggle } from './LoadFromKaggle';

export function HomePage(): JSX.Element {
  return (
    <Container>
      <Stack mb="md">
        <HomeCard title="Welcome!">
          {/* prettier-ignore */}
          <Text>
            Koreye 2022 is a visualizer for <a href="https://www.kaggle.com/competitions/kore-2022" target="_blank" rel="noreferrer">Kore 2022</a> episodes.
            Load an episode below to get started.
          </Text>
        </HomeCard>

        <LoadFromFile />
        <LoadFromKaggle />
        <LoadFromElsewhere />
      </Stack>
    </Container>
  );
}
