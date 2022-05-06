export interface LogItem {
  duration: number;
  stdout: string;
  stderr: string;
}

export type Logs = LogItem[][];
