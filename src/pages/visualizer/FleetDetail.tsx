import { Grid, Text } from '@mantine/core';
import { Fleet } from '../../models/episode/parsed';
import { EntityCard } from './EntityCard';

interface FleetDetailProps {
  fleet: Fleet;
}

export function FleetDetail({ fleet }: FleetDetailProps): JSX.Element {
  return (
    <EntityCard cell={fleet.cell}>
      <Grid gutter={0}>
        <Grid.Col span={5}>
          <Text size="sm">
            <b>{fleet.id}</b>
          </Text>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text size="sm">Plan: {fleet.flightPlan || 'none'}</Text>
        </Grid.Col>
        <Grid.Col span={5}>
          <Text size="sm">
            Cell: ({fleet.cell.x}, {fleet.cell.y})
          </Text>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text size="sm">Direction: {['north', 'east', 'south', 'west'][fleet.direction]}</Text>
        </Grid.Col>
        <Grid.Col span={5}>
          <Text size="sm">Ships: {fleet.ships}</Text>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text size="sm">Kore: {Math.floor(fleet.kore)}</Text>
        </Grid.Col>
      </Grid>
    </EntityCard>
  );
}
