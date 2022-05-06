import { Direction, BaseEpisode } from './base';

export type RawShipyard = [index: number, ships: number, turnsControlled: number];

export type RawFleet = [index: number, kore: number, ships: number, direction: Direction, flightPlan: string];

export type RawPlayer = [kore: number, shipyards: Record<string, RawShipyard>, fleets: Record<string, RawFleet>];

export interface RawObservation {
  kore?: number[];
  player: number;
  players?: RawPlayer[];
  remainingOverageTime: number;
  step?: number;
}

export interface RawStepPart {
  action: Record<string, string> | null;
  info: any;
  observation: RawObservation;
  reward: number | null;
  status: string;
}

export interface RawEpisode extends BaseEpisode {
  steps: [RawStepPart, RawStepPart][];
}
