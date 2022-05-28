import { Paper } from '@mantine/core';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { ParsedEpisode } from '../../models/episode/parsed';
import { useStore } from '../../store';
import { getPlayerColor } from '../../utils/colors';

export type ChartFunction = (episode: ParsedEpisode, step: number, player: number) => number;

interface ChartProps {
  title: string;
  playerNames: [string, string];
  func: ChartFunction;
  decimals?: number;
  step?: boolean;
}

export function Chart({ title, playerNames, func, decimals, step }: ChartProps): JSX.Element {
  const episode = useStore(state => state.episode)!;

  const exportFileName = title.replace(/\W/g, '_');

  const options: ApexOptions = {
    chart: {
      id: title,
      type: 'line',
      zoom: {
        autoScaleYaxis: true,
      },
      toolbar: {
        export: {
          csv: {
            filename: exportFileName,
          },
          svg: {
            filename: exportFileName,
          },
          png: {
            filename: exportFileName,
          },
        },
      },
      animations: {
        enabled: false,
      },
    },
    title: {
      text: title,
    },
    stroke: {
      width: 2,
      curve: step ? 'stepline' : 'smooth',
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

  const series: ApexOptions['series'] = playerNames.map((name, playerIndex) => ({
    name,
    data: episode.steps.map((step, stepIndex) => func(episode, stepIndex, playerIndex)),
    color: getPlayerColor(playerIndex, 1.0),
  }));

  return (
    <Paper shadow="xs" p="xs" withBorder={true}>
      <ReactApexChart options={options} series={series} height="300px" />
    </Paper>
  );
}
