import { Code, Paper, Text } from '@mantine/core';
import { LogItem } from '../../models/logs';
import { useStore } from '../../store';

interface LogDetailProps {
  logs: LogItem[];
}

export function LogsDetail({ logs }: LogDetailProps): JSX.Element {
  const turn = useStore(state => state.turn);

  const hasLogs = logs.length > 0;
  const stdout = (logs[turn]?.stdout || '').trimEnd();
  const stderr = (logs[turn]?.stderr || '').trimEnd();

  return (
    <Paper>
      {hasLogs && stdout.length > 0 && <Text>Standard output:</Text>}
      {hasLogs && stdout.length > 0 && <Code block={true}>{stdout}</Code>}
      {hasLogs && stderr.length > 0 && <Text>Standard error:</Text>}
      {hasLogs && stderr.length > 0 && <Code block={true}>{stderr}</Code>}
      {hasLogs && stdout.length === 0 && stderr.length === 0 && <Text>This player has no logs in this turn.</Text>}
      {!hasLogs && <Text>Episode does not contain log data.</Text>}
    </Paper>
  );
}
