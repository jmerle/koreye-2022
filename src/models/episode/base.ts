export interface EpisodeInfo {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  EpisodeId?: number;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  LiveVideoPath?: string | null;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  TeamNames?: [string, string];
}

export interface SpecificationItem {
  type: string | string[];
  description: string;
  default?: number;
  shared?: boolean;
  minimum?: number;
  additionalProperties?: any;
}

export interface Specification {
  action: SpecificationItem;
  agents: number[];
  configuration: Record<string, SpecificationItem>;
  info: any;
  observation: Record<string, SpecificationItem>;
  reward: SpecificationItem;
}

export enum Direction {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

export interface BaseEpisode {
  configuration: Record<string, any>;
  description: string;
  id: string;
  info: EpisodeInfo;
  name: string;
  rewards: number[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  schema_version: number;
  specification: Specification;
  statuses: string[];
  title: string;
  version: string;
}
