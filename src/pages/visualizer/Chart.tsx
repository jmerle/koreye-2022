import { Paper } from '@mantine/core';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { Player } from '../../models/episode/parsed';
import { useStore } from '../../store';
import { getPlayerColor } from '../../utils/colors';

export type ChartFunction = (player: Player) => number;

interface ChartProps {
  title: string;
  playerNames: [string, string];
  func: ChartFunction;
  decimals?: number;
}

export function Chart({ title, playerNames, func, decimals }: ChartProps): JSX.Element {
  const episode = useStore(state => state.episode)!;

  const options: ApexOptions = {
    chart: {
      id: title,
      type: 'line',
      height: 300,
      animations: {
        enabled: false,
      },
    },
    title: {
      text: title,
    },
    stroke: {
      width: 3,
    },
    xaxis: {
      type: 'numeric',
    },
    yaxis: {
      labels: {
        formatter: value => value.toFixed(decimals || 0),
      },
    },
    tooltip: {
      followCursor: true,
      x: {
        formatter: value => `Turn ${value}`,
      },
    },
  };

  const series: ApexOptions['series'] = playerNames.map((name, i) => ({
    name,
    data: episode.steps.map(step => func(step.players[i])),
    color: getPlayerColor(i, 1.0),
  }));

  return (
    <Paper shadow="xs" p="xs" withBorder={true}>
      <ReactApexChart options={options} series={series} />
    </Paper>
  );
}
