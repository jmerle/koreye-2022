import { Text } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Cell } from '../../models/episode/parsed';
import { useStore } from '../../store';

interface EntityListProps {
  name: string;
  height: number;
  itemCount: number;
  itemRenderer: (index: number) => JSX.Element;
  cellGetter: (index: number) => Cell;
}

export function EntityList({ name, height, itemCount, cellGetter, itemRenderer }: EntityListProps): JSX.Element {
  const selectedCell = useStore(state => state.selectedCell);

  const ref = useRef<VirtuosoHandle>(null);

  const cells: Cell[] = [];
  for (let i = 0; i < itemCount; i++) {
    cells.push(cellGetter(i));
  }

  useEffect(() => {
    if (selectedCell === null) {
      return;
    }

    const entityIndex = cells.findIndex(cell => cell.x === selectedCell.x && cell.y === selectedCell.y);
    if (entityIndex > -1) {
      ref.current?.scrollIntoView({ index: entityIndex, behavior: 'smooth' });
    }
  }, [selectedCell]);

  if (itemCount === 0) {
    return (
      <div style={{ height: `${height}px` }}>
        <Text>This player has 0 {name} in this turn.</Text>
      </div>
    );
  }

  return <Virtuoso ref={ref} style={{ height: `${height}px` }} totalCount={itemCount} itemContent={itemRenderer} />;
}
