import { Center, createStyles, Grid, MediaQuery, Paper, Stack } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { Board } from './Board';
import { Chart, ChartFunction } from './Chart';
import { PlayerCard } from './PlayerCard';
import { TurnControl } from './TurnControl';

const useStyles = createStyles(theme => ({
  container: {
    margin: '0 auto',
    width: '1500px',

    [theme.fn.smallerThan(1500)]: {
      width: '100%',
    },
  },
}));

const funcKoreStored: ChartFunction = (episode, step, player) => {
  return Math.floor(episode.steps[step].players[player].kore);
};

const funcKoreFleets: ChartFunction = (episode, step, player) => {
  return Math.floor(episode.steps[step].players[player].fleets.reduce((acc, val) => acc + val.kore, 0));
};

const funcKoreTotal: ChartFunction = (episode, step, player) => {
  return funcKoreStored(episode, step, player) + funcKoreFleets(episode, step, player);
};

const funcShipsShipyards: ChartFunction = (episode, step, player) => {
  return episode.steps[step].players[player].shipyards.reduce((acc, val) => acc + val.ships, 0);
};

const funcShipsFleets: ChartFunction = (episode, step, player) => {
  return episode.steps[step].players[player].fleets.reduce((acc, val) => acc + val.ships, 0);
};

const funcShipsTotal: ChartFunction = (episode, step, player) => {
  return funcShipsShipyards(episode, step, player) + funcShipsFleets(episode, step, player);
};

const funcRemainingOverageTime: ChartFunction = (episode, step, player) => {
  return episode.steps[step].players[player].remainingOverageTime;
};

const funcShipyards: ChartFunction = (episode, step, player) => {
  return episode.steps[step].players[player].shipyards.length;
};

const funcFleets: ChartFunction = (episode, step, player) => {
  return episode.steps[step].players[player].fleets.length;
};

const funcTotalAssetWorth: ChartFunction = (episode, step, player) => {
  const kore = funcKoreTotal(episode, step, player);
  const ships = funcShipsTotal(episode, step, player) + 50 * funcShipyards(episode, step, player);
  return kore + 10 * ships;
};

const funcMinedKore: ChartFunction = (episode, step, player) => {
  if (step === 0) {
    return 0;
  }

  let minedKore = 0;

  for (const fleet of episode.steps[step].players[player].fleets) {
    const koreBeforeMining = episode.steps[step - 1].kore[fleet.cell.y][fleet.cell.x];
    const miningPercentage = Math.min(Math.log(fleet.ships) / 20, 0.99);

    minedKore += koreBeforeMining * miningPercentage;
  }

  return minedKore;
};

const funcCombatDiff: ChartFunction = (episode, step, player) => {
  if (step === 0) {
    return 0;
  }

  const koreStoredPrevious = episode.steps[step - 1].players[player].kore;
  const koreFleetsPrevious = episode.steps[step - 1].players[player].fleets.reduce((acc, val) => acc + val.kore, 0);
  const korePrev = koreStoredPrevious + koreFleetsPrevious;

  const koreStoredCurrent = episode.steps[step].players[player].kore;
  const koreFleetsCurrent = episode.steps[step].players[player].fleets.reduce((acc, val) => acc + val.kore, 0);
  const koreCurrent = koreStoredCurrent + koreFleetsCurrent;

  const minedKore = funcMinedKore(episode, step, player);

  const spawnCost = episode.steps[step - 1].players[player].actions
    .filter(action => action.type === 'spawn')
    .reduce((acc, val) => acc + 10 * val.ships, 0);

  let combatDiff = koreCurrent - korePrev - minedKore + spawnCost;

  const myShipyardsPrevious = episode.steps[step - 1].players[player].shipyards.map(s => s.cell);
  const opponentShipyardsPrevious = episode.steps[step - 1].players[player === 0 ? 1 : 0].shipyards.map(s => s.cell);
  const myShipyardsCurrent = episode.steps[step].players[player].shipyards.map(s => s.cell);
  const opponentShipyardsCurrent = episode.steps[step].players[player === 0 ? 1 : 0].shipyards.map(s => s.cell);

  combatDiff -=
    500 * myShipyardsPrevious.filter(s1 => opponentShipyardsCurrent.some(s2 => s1.x === s2.x && s1.y === s2.y)).length;
  combatDiff +=
    500 * opponentShipyardsPrevious.filter(s1 => myShipyardsCurrent.some(s2 => s1.x === s2.x && s1.y === s2.y)).length;

  return Math.abs(combatDiff) < 0.1 ? 0 : combatDiff;
};

export function VisualizerPage(): JSX.Element {
  const { classes } = useStyles();

  const episode = useStore(state => state.episode);

  const { search } = useLocation();

  const { ref: boardContainerRef, width: maxBoardWidth } = useElementSize();

  if (episode === null) {
    return <Navigate to={`/${search}`} />;
  }

  let playerNames: [string, string] = ['Player A', 'Player B'];
  if (episode.info.TeamNames !== undefined) {
    playerNames = episode.info.TeamNames;
  }

  const playerCards = [];
  for (let i = 0; i < 2; i++) {
    playerCards.push(<PlayerCard key={i} id={i} name={playerNames[i]} />);
  }

  return (
    <div className={classes.container}>
      <Grid style={{ margin: '0' }}>
        <MediaQuery smallerThan="md" styles={{ display: 'none' }}>
          <Grid.Col span={3}>{playerCards[0]}</Grid.Col>
        </MediaQuery>
        <Grid.Col sm={12} md={6}>
          <Paper shadow="xs" p="md" withBorder={true}>
            <Stack>
              <Center ref={boardContainerRef}>
                <Board maxWidth={maxBoardWidth} />
              </Center>
              <TurnControl />
            </Stack>
          </Paper>
        </Grid.Col>
        <MediaQuery largerThan="md" styles={{ display: 'none' }}>
          <Grid.Col span={12}>{playerCards[0]}</Grid.Col>
        </MediaQuery>
        <Grid.Col xs={12} md={3}>
          {playerCards[1]}
        </Grid.Col>
        <Grid.Col xs={12} md={6}>
          <Chart title="Total asset worth" playerNames={playerNames} func={funcTotalAssetWorth} />
        </Grid.Col>
        <Grid.Col xs={12} md={6}>
          <Chart
            title="Kore gains/losses from combat (1 shipyard = 500 kore)"
            step={true}
            playerNames={playerNames}
            func={funcCombatDiff}
          />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Total kore" playerNames={playerNames} func={funcKoreTotal} />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Stored kore" playerNames={playerNames} func={funcKoreStored} />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Kore in fleets" playerNames={playerNames} func={funcKoreFleets} />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Total ships" playerNames={playerNames} func={funcShipsTotal} />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Ships in shipyards" playerNames={playerNames} func={funcShipsShipyards} />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Ships in fleets" playerNames={playerNames} func={funcShipsFleets} />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart
            title="Remaining overage time"
            step={true}
            playerNames={playerNames}
            func={funcRemainingOverageTime}
            decimals={3}
          />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Total shipyards" step={true} playerNames={playerNames} func={funcShipyards} />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Total fleets" step={true} playerNames={playerNames} func={funcFleets} />
        </Grid.Col>
      </Grid>
    </div>
  );
}
