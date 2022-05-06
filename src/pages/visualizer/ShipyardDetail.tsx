import { Grid, Text } from '@mantine/core';
import { Action, getSpawnMaximum, LaunchAction, Shipyard, SpawnAction } from '../../models/episode/parsed';
import { EntityCard } from './EntityCard';

interface ShipyardDetailProps {
  shipyard: Shipyard;
  actions: Action[];
}

export function ShipyardDetail({ shipyard, actions }: ShipyardDetailProps): JSX.Element {
  const spawn = actions.find(a => a.type === 'spawn' && a.shipyardId === shipyard.id) as SpawnAction | undefined;
  const launch = actions.find(a => a.type === 'launch' && a.shipyardId === shipyard.id) as LaunchAction | undefined;

  return (
    <EntityCard cell={shipyard.cell}>
      <Grid gutter={0}>
        <Grid.Col span={5}>
          <Text size="sm">
            <b>{shipyard.id}</b>
          </Text>
        </Grid.Col>
        <Grid.Col span={7} />
        <Grid.Col span={5}>
          <Text size="sm">
            Cell: ({shipyard.cell.x}, {shipyard.cell.y})
          </Text>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text size="sm">
            Spawn: {spawn ? spawn.ships : 'none'} (max {getSpawnMaximum(shipyard)})
          </Text>
        </Grid.Col>
        <Grid.Col span={5}>
          <Text size="sm">Ships: {shipyard.ships}</Text>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text size="sm">Launch: {launch ? `${launch.ships} ${launch.flightPlan}` : 'none'}</Text>
        </Grid.Col>
      </Grid>
    </EntityCard>
  );
}
