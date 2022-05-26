import { useHover, useMergedRef, useMouse } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';
import { CELLS_PER_SIDE } from '../../constants';
import { Direction } from '../../models/episode/base';
import { Cell, Fleet, getSpawnMaximum, Shipyard, Step } from '../../models/episode/parsed';
import { useStore } from '../../store';
import { getPlayerColor } from '../../utils/colors';

interface Sizes {
  gutterSize: number;
  cellSize: number;
  boardSize: number;
}

function getSizes(maxWidth: number): Sizes {
  const gutterSize = 4;

  let cellSize = Math.floor(Math.sqrt(maxWidth));
  let boardSize = cellSize * CELLS_PER_SIDE + gutterSize * (CELLS_PER_SIDE + 1);

  while (boardSize > maxWidth) {
    cellSize--;
    boardSize -= CELLS_PER_SIDE;
  }

  return { gutterSize, cellSize, boardSize };
}

function scale(value: number, relativeMin: number, relativeMax: number): number {
  const clampedValue = Math.max(Math.min(value, relativeMax), relativeMin);
  return (clampedValue - relativeMin) / (relativeMax - relativeMin);
}

function cellToCanvas(sizes: Sizes, cell: Cell): [number, number] {
  const canvasX = (cell.x + 1) * sizes.gutterSize + cell.x * sizes.cellSize;
  const canvasY = (CELLS_PER_SIDE - cell.y) * sizes.gutterSize + (CELLS_PER_SIDE - cell.y - 1) * sizes.cellSize;

  return [canvasX, canvasY];
}

function drawTopLeft(ctx: CanvasRenderingContext2D, sizes: Sizes, cell: Cell, value: string): void {
  const [canvasX, canvasY] = cellToCanvas(sizes, cell);

  const fontSize = Math.min(12, sizes.cellSize);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeText(value, canvasX, canvasY);

  ctx.fillStyle = '#087f5b';
  ctx.fillText(value, canvasX, canvasY);

  ctx.restore();
}

function drawBottomRight(ctx: CanvasRenderingContext2D, sizes: Sizes, cell: Cell, value: string): void {
  const [canvasX, canvasY] = cellToCanvas(sizes, cell);

  const fontSize = Math.min(12, sizes.cellSize);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeText(value, canvasX + sizes.cellSize, canvasY + sizes.cellSize);

  ctx.fillStyle = '#5f3dc4';
  ctx.fillText(value, canvasX + sizes.cellSize, canvasY + sizes.cellSize);

  ctx.restore();
}

function drawCellBackgrounds(ctx: CanvasRenderingContext2D, sizes: Sizes, kore: number[][]): void {
  for (let cellY = 0; cellY < CELLS_PER_SIDE; cellY++) {
    for (let cellX = 0; cellX < CELLS_PER_SIDE; cellX++) {
      const [canvasX, canvasY] = cellToCanvas(sizes, { x: cellX, y: cellY });

      const alpha = 0.25 + scale(kore[cellY][cellX], 0, 500) * 0.75;
      ctx.fillStyle = `rgba(173, 181, 189, ${alpha})`;

      ctx.fillRect(canvasX, canvasY, sizes.cellSize, sizes.cellSize);
    }
  }

  ctx.restore();
}

function drawSelectedCell(ctx: CanvasRenderingContext2D, sizes: Sizes, selectedCell: Cell): void {
  const [canvasX, canvasY] = cellToCanvas(sizes, selectedCell);

  ctx.fillStyle = 'black';
  ``;

  ctx.fillRect(
    canvasX - sizes.gutterSize,
    canvasY - sizes.gutterSize,
    sizes.cellSize + sizes.gutterSize * 2,
    sizes.gutterSize,
  );

  ctx.fillRect(
    canvasX - sizes.gutterSize,
    canvasY + sizes.cellSize,
    sizes.cellSize + sizes.gutterSize * 2,
    sizes.gutterSize,
  );

  ctx.fillRect(
    canvasX - sizes.gutterSize,
    canvasY - sizes.gutterSize,
    sizes.gutterSize,
    sizes.cellSize + sizes.gutterSize * 2,
  );

  ctx.fillRect(
    canvasX + sizes.cellSize,
    canvasY - sizes.gutterSize,
    sizes.gutterSize,
    sizes.cellSize + sizes.gutterSize * 2,
  );

  ctx.restore();
}

function drawKore(ctx: CanvasRenderingContext2D, sizes: Sizes, kore: number[][]): void {
  const fontSize = Math.min(10, sizes.cellSize);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';

  for (let cellY = 0; cellY < CELLS_PER_SIDE; cellY++) {
    for (let cellX = 0; cellX < CELLS_PER_SIDE; cellX++) {
      const [canvasX, canvasY] = cellToCanvas(sizes, { x: cellX, y: cellY });
      const amount = kore[cellY][cellX];

      if (Math.floor(amount) === 0) {
        continue;
      }

      const alpha = 0.25 + scale(amount, 0, 500) * 0.75;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;

      ctx.fillText(
        Math.floor(amount).toString(),
        canvasX + sizes.cellSize / 2,
        canvasY + sizes.cellSize / 2 + fontSize / 2 - 1,
      );
    }
  }

  ctx.restore();
}

function drawShipyard(ctx: CanvasRenderingContext2D, sizes: Sizes, player: number, shipyard: Shipyard): void {
  const [canvasX, canvasY] = cellToCanvas(sizes, shipyard.cell);

  ctx.fillStyle = 'transparent';
  ctx.strokeStyle = getPlayerColor(player, 1.0);
  ctx.lineWidth = 3;

  const radius = sizes.cellSize / 3;
  const margin = (sizes.cellSize - radius * 2) / 2;

  ctx.beginPath();
  ctx.arc(canvasX + sizes.cellSize / 2, canvasY + sizes.cellSize / 2, radius, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = getPlayerColor(player, 1.0);
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(canvasX + margin, canvasY + sizes.cellSize / 2);
  ctx.lineTo(canvasX + sizes.cellSize - margin, canvasY + sizes.cellSize / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(canvasX + sizes.cellSize / 2, canvasY + margin);
  ctx.lineTo(canvasX + sizes.cellSize / 2, canvasY + sizes.cellSize - margin);
  ctx.stroke();

  drawTopLeft(ctx, sizes, shipyard.cell, shipyard.ships.toString());
  drawBottomRight(ctx, sizes, shipyard.cell, getSpawnMaximum(shipyard).toString());

  ctx.restore();
}

function drawFleet(ctx: CanvasRenderingContext2D, sizes: Sizes, player: number, fleet: Fleet): void {
  const [canvasX, canvasY] = cellToCanvas(sizes, fleet.cell);

  const trianglePoints: [number, number][] = [];
  const margin = Math.floor(sizes.cellSize / 5);

  switch (fleet.direction) {
    case Direction.NORTH:
      trianglePoints.push([canvasX + margin, canvasY + sizes.cellSize - margin]);
      trianglePoints.push([canvasX + sizes.cellSize - margin, canvasY + sizes.cellSize - margin]);
      trianglePoints.push([canvasX + sizes.cellSize / 2, canvasY + margin]);
      break;
    case Direction.EAST:
      trianglePoints.push([canvasX + margin, canvasY + margin]);
      trianglePoints.push([canvasX + margin, canvasY + sizes.cellSize - margin]);
      trianglePoints.push([canvasX + sizes.cellSize - margin, canvasY + sizes.cellSize / 2]);
      break;
    case Direction.SOUTH:
      trianglePoints.push([canvasX + margin, canvasY + margin]);
      trianglePoints.push([canvasX + sizes.cellSize - margin, canvasY + margin]);
      trianglePoints.push([canvasX + sizes.cellSize / 2, canvasY + sizes.cellSize - margin]);
      break;
    case Direction.WEST:
      trianglePoints.push([canvasX + sizes.cellSize - margin, canvasY + margin]);
      trianglePoints.push([canvasX + sizes.cellSize - margin, canvasY + sizes.cellSize - margin]);
      trianglePoints.push([canvasX + margin, canvasY + sizes.cellSize / 2]);
      break;
  }

  ctx.fillStyle = getPlayerColor(player, 1.0);
  ctx.strokeStyle = 'black';

  ctx.beginPath();
  ctx.moveTo(trianglePoints[0][0], trianglePoints[0][1]);
  ctx.lineTo(trianglePoints[1][0], trianglePoints[1][1]);
  ctx.lineTo(trianglePoints[2][0], trianglePoints[2][1]);
  ctx.lineTo(trianglePoints[0][0], trianglePoints[0][1]);
  ctx.stroke();
  ctx.fill();

  drawTopLeft(ctx, sizes, fleet.cell, fleet.ships.toString());
  drawBottomRight(ctx, sizes, fleet.cell, Math.floor(fleet.kore).toString());

  ctx.restore();
}

function drawFlightPlan(
  ctx: CanvasRenderingContext2D,
  sizes: Sizes,
  player: number,
  fleet: Fleet,
  shipyards: Shipyard[],
  selectedCell: Cell | null,
): void {
  const segments: [Cell, Cell][] = [];
  const convertCells: Cell[] = [];

  const seen: Cell[] = [];

  let cell = fleet.cell;
  let direction = fleet.direction;
  const flightPlan = fleet.flightPlan.map(part => ({ ...part }));

  let shipyardGoal: Shipyard | undefined = undefined;

  while (true) {
    while (flightPlan.length > 0 && flightPlan[0].type === 'move' && flightPlan[0].steps === 0) {
      flightPlan.shift();
    }

    if (flightPlan.length > 0) {
      switch (flightPlan[0].type) {
        case 'turn':
          direction = flightPlan[0].direction;
          flightPlan.shift();
          break;
        case 'move':
          if (flightPlan[0].steps === 1) {
            flightPlan.shift();
          } else {
            flightPlan[0].steps--;
          }
          break;
        case 'convert':
          convertCells.push(cell);
          flightPlan.shift();
          break;
      }
    } else {
      if (seen.some(c => c.x === cell.x && c.y === cell.y)) {
        const cellsOnPath: Cell[] = [];

        if (direction == Direction.NORTH || direction == Direction.SOUTH) {
          for (let y = 0; y < CELLS_PER_SIDE; y++) {
            cellsOnPath.push({ x: cell.x, y });
          }
        } else {
          for (let x = 0; x < CELLS_PER_SIDE; x++) {
            cellsOnPath.push({ x, y: cell.y });
          }
        }

        if (!cellsOnPath.some(c1 => !seen.some(c2 => c1.x === c2.x && c1.y === c2.y))) {
          break;
        }
      }
    }

    const nextCell = { ...cell };
    switch (direction) {
      case Direction.NORTH:
        nextCell.y++;
        break;
      case Direction.EAST:
        nextCell.x++;
        break;
      case Direction.SOUTH:
        nextCell.y--;
        break;
      case Direction.WEST:
        nextCell.x--;
        break;
    }

    segments.push([cell, nextCell]);

    seen.push(cell);
    cell = { ...nextCell };

    if (cell.x < 0) {
      cell.x = CELLS_PER_SIDE - 1;
      segments.push([{ ...cell, x: cell.x + 1 }, cell]);
    }

    if (cell.x >= CELLS_PER_SIDE) {
      cell.x = 0;
      segments.push([{ ...cell, x: cell.x - 1 }, cell]);
    }

    if (cell.y < 0) {
      cell.y = CELLS_PER_SIDE - 1;
      segments.push([{ ...cell, y: cell.y + 1 }, cell]);
    }

    if (cell.y >= CELLS_PER_SIDE) {
      cell.y = 0;
      segments.push([{ ...cell, y: cell.y - 1 }, cell]);
    }

    shipyardGoal = shipyards.find(shipyard => shipyard.cell.x === cell.x && shipyard.cell.y === cell.y);
    if (shipyardGoal !== undefined) {
      break;
    }
  }

  const selected =
    selectedCell !== null &&
    ((selectedCell.x === fleet.cell.x && selectedCell.y === fleet.cell.y) ||
      (selectedCell.x === shipyardGoal?.cell.x && selectedCell.y === shipyardGoal?.cell.y) ||
      convertCells.some(c => selectedCell.x === c.x && selectedCell.y === c.y));

  ctx.lineCap = 'round';
  ctx.strokeStyle = getPlayerColor(player, selected ? 1.0 : 0.25);

  const minLineWidth = (sizes.cellSize / 100) * 10;
  const maxLineWidth = (sizes.cellSize / 100) * 75;
  ctx.lineWidth = minLineWidth + scale(fleet.ships, 0, 100) * (maxLineWidth - minLineWidth);

  ctx.beginPath();

  for (const [cellFrom, cellTo] of segments) {
    const [fromX, fromY] = cellToCanvas(sizes, cellFrom).map(v => v + sizes.cellSize / 2);
    const [toX, toY] = cellToCanvas(sizes, cellTo).map(v => v + sizes.cellSize / 2);

    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
  }

  ctx.stroke();

  ctx.strokeStyle = selected ? 'black' : getPlayerColor(player, 0.75);
  ctx.lineWidth = sizes.cellSize / 5;
  const convertMargin = sizes.cellSize / 5;

  for (const convertCell of convertCells) {
    const [canvasX, canvasY] = cellToCanvas(sizes, convertCell);

    ctx.beginPath();
    ctx.moveTo(canvasX + convertMargin, canvasY + convertMargin);
    ctx.lineTo(canvasX + sizes.cellSize - convertMargin, canvasY + sizes.cellSize - convertMargin);
    ctx.moveTo(canvasX + sizes.cellSize - convertMargin, canvasY + convertMargin);
    ctx.lineTo(canvasX + convertMargin, canvasY + sizes.cellSize - convertMargin);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBoard(ctx: CanvasRenderingContext2D, sizes: Sizes, step: Step, selectedCell: Cell | null): void {
  ctx.save();

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, sizes.boardSize, sizes.boardSize);
  ctx.restore();

  drawCellBackgrounds(ctx, sizes, step.kore);
  drawKore(ctx, sizes, step.kore);

  const allShipyards = [...step.players[0].shipyards, ...step.players[1].shipyards];
  const allFleets = [
    ...step.players[0].fleets.map(f => [0, f] as [number, Fleet]),
    ...step.players[1].fleets.map(f => [1, f] as [number, Fleet]),
  ];

  for (const [player, fleet] of allFleets.sort((a, b) => b[1].ships - a[1].ships)) {
    drawFlightPlan(ctx, sizes, player, fleet, allShipyards, selectedCell);
  }

  for (let i = 0; i < 2; i++) {
    for (const shipyard of step.players[i].shipyards) {
      drawShipyard(ctx, sizes, i, shipyard);
    }

    for (const fleet of step.players[i].fleets) {
      drawFleet(ctx, sizes, i, fleet);
    }
  }

  if (selectedCell !== null) {
    drawSelectedCell(ctx, sizes, selectedCell);
  }
}

interface BoardProps {
  maxWidth: number;
}

export function Board({ maxWidth }: BoardProps): JSX.Element {
  const { ref: canvasMouseRef, x: mouseX, y: mouseY } = useMouse<HTMLCanvasElement>();
  const { ref: canvasHoverRef, hovered } = useHover<HTMLCanvasElement>();
  const canvasRef = useMergedRef(canvasMouseRef, canvasHoverRef);

  const episode = useStore(state => state.episode)!;
  const turn = useStore(state => state.turn);

  const selectedCell = useStore(state => state.selectedCell);
  const setSelectedCell = useStore(state => state.setSelectedCell);

  const [sizes, setSizes] = useState<Sizes>({ gutterSize: 0, cellSize: 0, boardSize: 0 });

  const step = episode.steps[turn];

  const onMouseLeave = useCallback(() => {
    setSelectedCell(null);
  }, []);

  useEffect(() => {
    const newSizes = getSizes(maxWidth);
    if (
      newSizes.gutterSize !== sizes.gutterSize ||
      newSizes.cellSize !== sizes.cellSize ||
      newSizes.boardSize !== sizes.boardSize
    ) {
      setSizes(newSizes);
    }
  }, [maxWidth]);

  useEffect(() => {
    if (sizes.cellSize <= 0) {
      return;
    }

    const ctx = canvasMouseRef.current!.getContext('2d')!;
    drawBoard(ctx, sizes, step, selectedCell);
  }, [step, sizes, selectedCell]);

  useEffect(() => {
    if (!hovered) {
      return;
    }

    for (let cellY = 0; cellY < CELLS_PER_SIDE; cellY++) {
      for (let cellX = 0; cellX < CELLS_PER_SIDE; cellX++) {
        const cell = { x: cellX, y: cellY };
        const [canvasX, canvasY] = cellToCanvas(sizes, cell);

        if (
          mouseX >= canvasX - sizes.gutterSize / 2 &&
          mouseX < canvasX + sizes.cellSize + sizes.gutterSize / 2 &&
          mouseY >= canvasY - sizes.gutterSize / 2 &&
          mouseY < canvasY + sizes.cellSize + sizes.gutterSize / 2
        ) {
          setSelectedCell(cell);
          return;
        }
      }
    }

    setSelectedCell(null);
  }, [sizes, mouseX, mouseY, hovered]);

  return <canvas ref={canvasRef} width={sizes.boardSize} height={sizes.boardSize} onMouseLeave={onMouseLeave}></canvas>;
}
