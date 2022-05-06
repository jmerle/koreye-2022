import { createStyles, Paper, SimpleGrid, Space, Tabs, Title } from '@mantine/core';
import { IconCrown } from '@tabler/icons';
import { useCallback, useMemo } from 'react';
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
  const logs = useStore(state => state.logs!.map(item => item[id]));

  const player = episode.steps[turn].players[id];

  const myReward = episode.rewards[id];
  const opponentReward = episode.rewards[id === 0 ? 1 : 0];
  const winner = myReward >= opponentReward;

  const shipyardShips = player.shipyards.reduce((acc, val) => acc + val.ships, 0);
  const fleetShips = player.fleets.reduce((acc, val) => acc + val.ships, 0);
  const ships = shipyardShips + fleetShips;

  const cargo = player.fleets.reduce((acc, val) => acc + val.kore, 0);

  const duration = logs.length > 0 ? `${(logs[turn]?.duration || 0).toFixed(3)}s` : null;

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
        {winner && <IconCrown style={{ verticalAlign: 'top', paddingRight: '2px' }} />}
        {name}
      </Title>

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
            <LogsDetail logs={logs} />
          </div>
        </Tabs.Tab>
      </Tabs>
    </Paper>
  );
}