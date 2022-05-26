import { Grid, Text } from '@mantine/core';
import { Direction } from '../../models/episode/base';
import { Fleet, FlightPlanPart } from '../../models/episode/parsed';
import { EntityCard } from './EntityCard';

interface FleetDetailProps {
  fleet: Fleet;
}

function flightPlanToString(flightPlan: FlightPlanPart[]): string {
  let str = '';

  for (const part of flightPlan) {
    switch (part.type) {
      case 'turn':
        switch (part.direction) {
          case Direction.NORTH:
            str += 'N';
            break;
          case Direction.EAST:
            str += 'E';
            break;
          case Direction.SOUTH:
            str += 'S';
            break;
          case Direction.WEST:
            str += 'W';
            break;
        }
        break;
      case 'move':
        str += part.steps.toString();
        break;
      case 'convert':
        str += 'C';
        break;
    }
  }

  return str;
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
          <Text size="sm">Plan: {fleet.flightPlan.length > 0 ? flightPlanToString(fleet.flightPlan) : 'none'}</Text>
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
