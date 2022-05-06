import { Text } from '@mantine/core';
import { HomeCard } from './HomeCard';

export function LoadFromKaggle(): JSX.Element {
  return (
    <HomeCard title="Load from Kaggle">
      {/* TODO: Add link */}
      {/* prettier-ignore */}
      <Text>
        Episodes can be loaded straight from Kaggle notebooks.
        See the <a href="#" target="_blank" rel="noreferrer">Koreye 2022 integration</a> notebook for instructions.
      </Text>
    </HomeCard>
  );
}
