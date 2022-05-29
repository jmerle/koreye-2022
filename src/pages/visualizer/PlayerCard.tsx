import { Badge, createStyles, Paper, SimpleGrid, Space, Tabs, Title } from '@mantine/core';
import { IconCrown } from '@tabler/icons';
import { useCallback, useMemo } from 'react';
import { ParsedEpisode } from '../../models/episode/parsed';
import { useStore } from '../../store';
import { getPlayerColor } from '../../utils/colors';
import { EntityList } from './EntityList';
import { FleetDetail } from './FleetDetail';
import { LogsDetail } from './LogsDetail';
import { ShipyardDetail } from './ShipyardDetail';

const TAB_HEIGHT = 500;

const useStyles = createStyles(() => ({
  tab: {
    height: `${TAB_HEIGHT}px`,
    overflow: 'auto',
  },
}));

function getWinnerInfo(episode: ParsedEpisode, id: number): [won: boolean, reason: string | null] {
  const lastStep = episode.steps[episode.steps.length - 1];

  const me = lastStep.players[id];
  const opponent = lastStep.players[id === 0 ? 1 : 0];

  const meHasEntities = me.shipyards.length + me.fleets.length > 0;
  const opponentHasEntities = opponent.shipyards.length + opponent.fleets.length > 0;

  if (me.status === 'DONE' && opponent.status === 'ERROR') {
    return [true, 'Winner by not crashing'];
  } else if (me.status === 'ERROR' && opponent.status === 'DONE') {
    return [false, null];
  } else if (me.status === 'ERROR' && opponent.status === 'ERROR') {
    return [true, 'Draw, both crashed'];
  } else if (me.status === 'DONE' && opponent.status === 'TIMEOUT') {
    return [true, 'Winner by not timing out'];
  } else if (me.status === 'TIMEOUT' && opponent.status === 'DONE') {
    return [false, null];
  } else if (me.status === 'TIMEOUT' && opponent.status === 'TIMEOUT') {
    return [true, 'Draw, both timed out'];
  } else if (meHasEntities && !opponentHasEntities) {
    return [true, 'Winner by elimination'];
  } else if (!meHasEntities && opponentHasEntities) {
    return [false, null];
  } else if (!meHasEntities && !opponentHasEntities) {
    return [true, 'Draw, both eliminated'];
  } else if (me.reward > opponent.reward) {
    return [true, 'Winner by kore'];
  } else if (me.reward < opponent.reward) {
    return [false, null];
  } else {
    return [true, 'Draw, same kore'];
  }
}

function sortById(a: { id: string }, b: { id: string }): number {
  const [primaryA, subA] = a.id.split('-').map(value => parseInt(value));
  const [primaryB, subB] = b.id.split('-').map(value => parseInt(value));

  if (primaryA !== primaryB) {
    return primaryA - primaryB;
  }

  return subA - subB;
}

interface PlayerCardProps {
  id: number;
  name: string;
}

export function PlayerCard({ id, name }: PlayerCardProps): JSX.Element {
  const { classes } = useStyles();

  const episode = useStore(state => state.episode)!;
  const turn = useStore(state => state.turn);

  const player = episode.steps[turn].players[id];

  const [isWinner, winnerReason] = getWinnerInfo(episode, id);

  const shipyardShips = player.shipyards.reduce((acc, val) => acc + val.ships, 0);
  const fleetShips = player.fleets.reduce((acc, val) => acc + val.ships, 0);
  const ships = shipyardShips + fleetShips;

  const cargo = player.fleets.reduce((acc, val) => acc + val.kore, 0);

  const duration = player.duration ? `${player.duration.toFixed(3)}s` : null;

  const sortedShipyards = useMemo(() => player.shipyards.sort(sortById), [player]);
  const shipyardCellGetter = useCallback((index: number) => sortedShipyards[index].cell, [sortedShipyards]);
  const shipyardRenderer = useCallback(
    (index: number) => <ShipyardDetail shipyard={sortedShipyards[index]} actions={player.actions} />,
    [sortedShipyards, player],
  );

  const sortedFleets = useMemo(() => player.fleets.sort(sortById), [player]);
  const fleetCellGetter = useCallback((index: number) => sortedFleets[index].cell, [sortedFleets]);
  const fleetRenderer = useCallback((index: number) => <FleetDetail fleet={sortedFleets[index]} />, [sortedFleets]);

  return (
    <Paper shadow="xs" p="md" withBorder={true}>
      <Title order={3} style={{ color: getPlayerColor(id, 1.0) }}>
        {isWinner && <IconCrown style={{ verticalAlign: 'top', marginRight: '2px' }} />}
        {name}
      </Title>

      {isWinner && <Badge color={id === 0 ? 'blue' : 'red'}>{winnerReason}</Badge>}

      <Space h="xs" />

      <SimpleGrid cols={2} spacing="xs">
        <div>
          <b>Kore:</b> {Math.floor(player.kore)}
        </div>
        <div>
          {!duration && (
            <span>
              <b>Cargo:</b> {Math.floor(cargo)}
            </span>
          )}
        </div>
        <div>
          <b>Shipyards:</b> {player.shipyards.length}
        </div>
        <div>
          <b>Ships:</b> {ships}
        </div>
        <div>
          <b>Fleets:</b> {player.fleets.length}
        </div>
        <div>
          {!duration && (
            <span>
              <b>Timebank:</b> {player.remainingOverageTime.toFixed(3)}s
            </span>
          )}
          {duration && (
            <span>
              <b>Cargo:</b> {Math.floor(cargo)}
            </span>
          )}
        </div>
        {duration && (
          <>
            <div>
              <b>Duration:</b> {duration}
            </div>
            <div>
              <b>Timebank:</b> {player.remainingOverageTime.toFixed(3)}s
            </div>
          </>
        )}
      </SimpleGrid>

      <Space h="xs" />

      <Tabs color={id === 0 ? 'blue' : 'red'} grow={true}>
        <Tabs.Tab label="Shipyards">
          <EntityList
            name="shipyards"
            height={TAB_HEIGHT}
            itemCount={sortedShipyards.length}
            cellGetter={shipyardCellGetter}
            itemRenderer={shipyardRenderer}
          />
        </Tabs.Tab>
        <Tabs.Tab label="Fleets">
          <EntityList
            name="fleets"
            height={TAB_HEIGHT}
            itemCount={sortedFleets.length}
            cellGetter={fleetCellGetter}
            itemRenderer={fleetRenderer}
          />
        </Tabs.Tab>
        <Tabs.Tab label="Logs">
          <div className={classes.tab}>
            <LogsDetail player={player} />
          </div>
        </Tabs.Tab>
      </Tabs>
    </Paper>
  );
}
