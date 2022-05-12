import { CELLS_PER_SIDE } from '../../constants';
import { BaseEpisode, Direction } from './base';
import { RawEpisode } from './raw';

export interface SpawnAction {
  type: 'spawn';
  shipyardId: string;
  ships: number;
}

export interface LaunchAction {
  type: 'launch';
  shipyardId: string;
  ships: number;
  flightPlan: string;
}

export type Action = SpawnAction | LaunchAction;

export interface Cell {
  x: number;
  y: number;
}

export interface Shipyard {
  id: string;
  cell: Cell;
  ships: number;
  turnsControlled: number;
}

export interface Fleet {
  id: string;
  cell: Cell;
  kore: number;
  ships: number;
  direction: Direction;
  flightPlan: string;
}

export interface Player {
  kore: number;
  shipyards: Shipyard[];
  fleets: Fleet[];
  actions: Action[];
  reward: number;
  status: string;
  remainingOverageTime: number;
}

export interface Step {
  kore: number[][];
  players: [Player, Player];
}

export interface ParsedEpisode extends BaseEpisode {
  steps: Step[];
}

function indexToCell(index: number): Cell {
  return {
    x: index % CELLS_PER_SIDE,
    y: CELLS_PER_SIDE - Math.floor(index / CELLS_PER_SIDE) - 1,
  };
}

export function getSpawnMaximum(shipyard: Shipyard): number {
  if (shipyard.turnsControlled < 2) {
    return 1;
  } else if (shipyard.turnsControlled < 7) {
    return 2;
  } else if (shipyard.turnsControlled < 17) {
    return 3;
  } else if (shipyard.turnsControlled < 34) {
    return 4;
  } else if (shipyard.turnsControlled < 60) {
    return 5;
  } else if (shipyard.turnsControlled < 97) {
    return 6;
  } else if (shipyard.turnsControlled < 147) {
    return 7;
  } else if (shipyard.turnsControlled < 212) {
    return 8;
  } else if (shipyard.turnsControlled < 294) {
    return 9;
  } else {
    return 10;
  }
}

export function parseRawEpisode(rawEpisode: RawEpisode): ParsedEpisode {
  const parsedSteps: Step[] = [];

  for (const stepParts of rawEpisode.steps) {
    const kore = [];
    for (let y = 0; y < CELLS_PER_SIDE; y++) {
      const row = [];

      for (let x = 0; x < CELLS_PER_SIDE; x++) {
        row.push(stepParts[0].observation.kore![(CELLS_PER_SIDE - y - 1) * CELLS_PER_SIDE + x]);
      }

      kore.push(row);
    }

    const players: Player[] = [];
    for (let i = 0; i < 2; i++) {
      const rawPlayer = stepParts[0].observation.players![i];

      const kore = rawPlayer[0];

      const shipyards: Shipyard[] = [];
      for (const shipyardId of Object.keys(rawPlayer[1])) {
        const rawShipyard = rawPlayer[1][shipyardId];

        shipyards.push({
          id: shipyardId,
          cell: indexToCell(rawShipyard[0]),
          ships: rawShipyard[1],
          turnsControlled: rawShipyard[2],
        });
      }

      const fleets: Fleet[] = [];
      for (const fleetId of Object.keys(rawPlayer[2])) {
        const rawFleet = rawPlayer[2][fleetId];

        fleets.push({
          id: fleetId,
          cell: indexToCell(rawFleet[0]),
          kore: rawFleet[1],
          ships: rawFleet[2],
          direction: rawFleet[3],
          flightPlan: rawFleet[4],
        });
      }

      const actions: Action[] = [];
      for (const shipyardId of Object.keys(stepParts[i].action || {})) {
        const actionParts = stepParts[i].action![shipyardId].split('_');

        if (actionParts[0] === 'SPAWN') {
          actions.push({
            type: 'spawn',
            shipyardId,
            ships: parseInt(actionParts[1]),
          });
        } else {
          actions.push({
            type: 'launch',
            shipyardId,
            ships: parseInt(actionParts[1]),
            flightPlan: actionParts[2],
          });
        }
      }

      players.push({
        kore,
        shipyards,
        fleets,
        actions,
        reward: stepParts[i].reward || 0,
        status: stepParts[i].status,
        remainingOverageTime: stepParts[i].observation.remainingOverageTime,
      });
    }

    parsedSteps.push({
      kore,
      players: players as [Player, Player],
    });
  }

  return {
    ...rawEpisode,
    steps: parsedSteps,
  };
}
