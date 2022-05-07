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

const funcKoreStored: ChartFunction = player => Math.floor(player.kore);
const funcKoreFleets: ChartFunction = player => Math.floor(player.fleets.reduce((acc, val) => acc + val.kore, 0));
const funcKoreTotal: ChartFunction = player => funcKoreStored(player) + funcKoreFleets(player);

const funcShipsShipyards: ChartFunction = player => player.shipyards.reduce((acc, val) => acc + val.ships, 0);
const funcShipsFleets: ChartFunction = player => player.fleets.reduce((acc, val) => acc + val.ships, 0);
const funcShipsTotal: ChartFunction = player => funcShipsShipyards(player) + funcShipsFleets(player);

const funcRemainingOverageTime: ChartFunction = player => player.remainingOverageTime;
const funcShipyards: ChartFunction = player => player.shipyards.length;
const funcFleets: ChartFunction = player => player.fleets.length;

const funcTotalAssetWorth: ChartFunction = player =>
  funcKoreTotal(player) + funcShipsTotal(player) * 10 + funcShipyards(player) * 50 * 10;

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
        <Grid.Col xs={12} md={6} offsetMd={3}>
          <Chart title="Total asset worth" playerNames={playerNames} func={funcTotalAssetWorth} />
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
            playerNames={playerNames}
            func={funcRemainingOverageTime}
            decimals={3}
          />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Total shipyards" playerNames={playerNames} func={funcShipyards} />
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Chart title="Total fleets" playerNames={playerNames} func={funcFleets} />
        </Grid.Col>
      </Grid>
    </div>
  );
}
