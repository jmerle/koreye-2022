import { Code, Paper, Text } from '@mantine/core';
import { Player } from '../../models/episode/parsed';

interface LogDetailProps {
  player: Player;
}

export function LogsDetail({ player }: LogDetailProps): JSX.Element {
  const hasStdout = player.stdout.length > 0;
  const hasStderr = player.stderr.length > 0;
  const hasAuxiliaryActions = Object.keys(player.auxiliaryActions).length > 0;

  return (
    <Paper>
      {hasStdout && <Text>Standard output:</Text>}
      {hasStdout && <Code block={true}>{player.stdout}</Code>}
      {hasStderr && <Text>Standard error:</Text>}
      {hasStderr && <Code block={true}>{player.stderr}</Code>}
      {hasAuxiliaryActions && <Text>Non-shipyard action entries:</Text>}
      {hasAuxiliaryActions && <Code block={true}>{JSON.stringify(player.auxiliaryActions, null, 4)}</Code>}
      {!hasStdout && !hasStderr && !hasAuxiliaryActions && <Text>This player has no logs in this turn.</Text>}
    </Paper>
  );
}
