import { CELLS_PER_SIDE } from '../../constants';
import { Logs } from '../logs';
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

export interface FlightPlanTurnPart {
  type: 'turn';
  direction: Direction;
}

export interface FlightPlanMovePart {
  type: 'move';
  steps: number;
}

export interface FlightPlanConvertPart {
  type: 'convert';
}

export type FlightPlanPart = FlightPlanTurnPart | FlightPlanMovePart | FlightPlanConvertPart;

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
  flightPlan: FlightPlanPart[];
}

export interface Player {
  kore: number;
  shipyards: Shipyard[];
  fleets: Fleet[];
  actions: Action[];
  reward: number;
  status: string;
  remainingOverageTime: number;
  duration: number | null;
  stdout: string;
  stderr: string;
  auxiliaryActions: Record<string, any>;
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

export function parseFlightPlan(flightPlan: string): FlightPlanPart[] {
  const parts: FlightPlanPart[] = [];

  for (let i = 0; i < flightPlan.length; i++) {
    const ch = flightPlan[i];

    switch (ch) {
      case 'N':
        parts.push({ type: 'turn', direction: Direction.NORTH });
        break;
      case 'E':
        parts.push({ type: 'turn', direction: Direction.EAST });
        break;
      case 'S':
        parts.push({ type: 'turn', direction: Direction.SOUTH });
        break;
      case 'W':
        parts.push({ type: 'turn', direction: Direction.WEST });
        break;
      case 'C':
        parts.push({ type: 'convert' });
        break;
      default:
        if (/\d/.test(ch)) {
          let steps = '';

          for (let j = i; j < flightPlan.length; i++, j++) {
            if (/\d/.test(flightPlan[i])) {
              steps += flightPlan[i];
            } else {
              i--;
              break;
            }
          }

          parts.push({ type: 'move', steps: parseInt(steps) });
        } else {
          throw new Error(`Invalid flight plan character: ${ch}`);
        }
    }
  }

  return parts;
}

export function parseRawEpisode(rawEpisode: RawEpisode, logs: Logs | null): ParsedEpisode {
  const parsedSteps: Step[] = [];

  for (let step = 0; step < rawEpisode.steps.length; step++) {
    const stepParts = rawEpisode.steps[step];

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
          flightPlan: parseFlightPlan(rawFleet[4]),
        });
      }

      const actions: Action[] = [];
      const auxiliaryActions: Record<string, any> = {};

      let duration: number | null = null;
      let stdout = '';
      let stderr = '';

      if (step < rawEpisode.steps.length - 1) {
        const rawActions = rawEpisode.steps[step + 1][i].action;
        for (const shipyardId of Object.keys(rawActions || {})) {
          if (!shipyards.some(shipyard => shipyard.id === shipyardId)) {
            auxiliaryActions[shipyardId] = rawActions![shipyardId];
            continue;
          }

          const actionParts = rawActions![shipyardId].split('_');
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

        const hasLogs = logs !== null && logs.length > 0;

        const logIndex = stepParts[0].observation.step! + 2;
        const logItem = hasLogs && logIndex < logs?.length ? logs[logIndex][i] : null;

        duration = hasLogs ? logItem?.duration || 0 : null;
        stdout = (logItem?.stdout || '').trimEnd();
        stderr = (logItem?.stderr || '').trimEnd();
      }

      players.push({
        kore,
        shipyards,
        fleets,
        actions,
        reward: stepParts[i].reward || 0,
        status: stepParts[i].status,
        remainingOverageTime: stepParts[i].observation.remainingOverageTime,
        duration,
        stdout,
        stderr,
        auxiliaryActions,
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
