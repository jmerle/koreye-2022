import { Paper } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';
import { Cell } from '../../models/episode/parsed';
import { useStore } from '../../store';

interface EntityCardProps {
  cell: Cell;
  children: React.ReactNode;
}

export function EntityCard({ cell, children }: EntityCardProps): JSX.Element {
  const selectedCell = useStore(state => state.selectedCell);
  const setSelectedCell = useStore(state => state.setSelectedCell);

  const selected = selectedCell?.x === cell.x && selectedCell?.y === cell.y;

  const onMouseEnter = useCallback(() => setSelectedCell(cell), [cell]);
  const onMouseLeave = useCallback(() => setSelectedCell(null), []);
  const style = useMemo(() => ({ background: selected ? '#ecf0f1' : 'transparent' }), [selected]);

  return (
    <div>
      <Paper p="xs" withBorder={true} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={style}>
        {children}
      </Paper>
    </div>
  );
}
