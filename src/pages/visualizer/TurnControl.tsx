import { ActionIcon, Group, Kbd, Slider, Stack, Table, Text } from '@mantine/core';
import { HotkeyItem, useHotkeys } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import {
  IconChevronsLeft,
  IconChevronsRight,
  IconKeyboard,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
} from '@tabler/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../../store';

const SPEEDS = [0.5, 1, 2, 4, 8, 16, 32];

export function TurnControl(): JSX.Element {
  const episode = useStore(state => state.episode)!;
  const turn = useStore(state => state.turn);

  const setTurn = useStore(state => state.setTurn);
  const increaseTurn = useStore(state => state.increaseTurn);

  const speed = useStore(state => state.speed);
  const setSpeed = useStore(state => state.setSpeed);

  const selectedCell = useStore(state => state.selectedCell);

  const [playing, setPlaying] = useState(false);

  const modals = useModals();

  const sliderRef = useRef<HTMLDivElement>(null);

  const onSliderChange = useCallback((value: number) => {
    setTurn(value - 1);
    setPlaying(false);
  }, []);

  const togglePlaying = useCallback(() => {
    if (!playing && turn === episode.steps.length - 1) {
      return;
    }

    setPlaying(!playing);
  }, [episode, turn, playing]);

  const previousTurn = useCallback(() => {
    if (turn > 0 && !sliderRef.current?.contains(document.activeElement)) {
      setTurn(turn - 1);
    }

    setPlaying(false);
  }, [episode, turn, sliderRef]);

  const nextTurn = useCallback(() => {
    if (turn < episode.steps.length - 1 && !sliderRef.current?.contains(document.activeElement)) {
      setTurn(turn + 1);
    }

    setPlaying(false);
  }, [episode, turn, sliderRef]);

  const increaseSpeed = useCallback(() => {
    setSpeed(SPEEDS[Math.min(SPEEDS.indexOf(speed) + 1, SPEEDS.length - 1)]);
  }, [speed]);

  const decreaseSpeed = useCallback(() => {
    setSpeed(SPEEDS[Math.max(SPEEDS.indexOf(speed) - 1, 0)]);
  }, [speed]);

  const goToStart = useCallback(() => {
    setTurn(0);
  }, [episode]);

  const goToEnd = useCallback(() => {
    setTurn(episode.steps.length - 1);
  }, [episode]);

  const openHotkeysModal = useCallback(() => {
    modals.openModal({
      title: 'Hotkeys',
      children: (
        <Table>
          <thead>
            <tr>
              <th>Hotkey</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Kbd>Space</Kbd>
              </td>
              <td>Play/pause</td>
            </tr>
            <tr>
              <td>
                <Kbd>◄</Kbd>
              </td>
              <td>Previous turn</td>
            </tr>
            <tr>
              <td>
                <Kbd>►</Kbd>
              </td>
              <td>Next turn</td>
            </tr>
            <tr>
              <td>
                <Kbd>▲</Kbd>
              </td>
              <td>Increase speed</td>
            </tr>
            <tr>
              <td>
                <Kbd>▼</Kbd>
              </td>
              <td>Decrease speed</td>
            </tr>
            {SPEEDS.map((speed, i) => (
              <tr key={i}>
                <td>
                  <Kbd>{i + 1}</Kbd>
                </td>
                <td>Set speed to {speed}x</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ),
    });
  }, []);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const interval = setInterval(() => {
      if (!increaseTurn()) {
        setPlaying(false);
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [playing, speed]);

  const hotkeys: HotkeyItem[] = [
    ['space', togglePlaying],
    ['ArrowLeft', previousTurn],
    ['ArrowRight', nextTurn],
    ['ArrowUp', increaseSpeed],
    ['ArrowDown', decreaseSpeed],
  ];

  for (let i = 1; i <= SPEEDS.length; i++) {
    hotkeys.push([i.toString(), () => setSpeed(SPEEDS[i - 1])]);
  }

  useHotkeys(hotkeys);

  return (
    <Stack>
      <Slider
        ref={sliderRef}
        min={1}
        max={episode.steps.length}
        onChange={onSliderChange}
        value={turn + 1}
        label={null}
      />

      <Group position="center">
        <ActionIcon color="blue" variant="transparent" title="Go to start" onClick={goToStart}>
          <IconPlayerTrackPrev />
        </ActionIcon>
        <ActionIcon color="blue" variant="transparent" title="Slower" onClick={decreaseSpeed}>
          <IconChevronsLeft />
        </ActionIcon>
        <ActionIcon color="blue" variant="transparent" title={playing ? 'Pause' : 'Play'} onClick={togglePlaying}>
          {playing ? <IconPlayerPause /> : <IconPlayerPlay />}
        </ActionIcon>
        <ActionIcon color="blue" variant="transparent" title="Faster" onClick={increaseSpeed}>
          <IconChevronsRight />
        </ActionIcon>
        <ActionIcon color="blue" variant="transparent" title="Go to end" onClick={goToEnd}>
          <IconPlayerTrackNext />
        </ActionIcon>
        <ActionIcon color="blue" variant="transparent" title="Show hotkeys" onClick={openHotkeysModal}>
          <IconKeyboard />
        </ActionIcon>

        <div style={{ marginRight: 'auto' }} />

        {selectedCell && (
          <>
            <Text>
              Cell: ({selectedCell.x}, {selectedCell.y})
            </Text>
            <Text>Kore: {Math.floor(episode.steps[turn].kore[selectedCell.y][selectedCell.x])}</Text>
          </>
        )}

        <div style={{ marginLeft: 'auto' }} />

        <Text>{speed}x</Text>
        <Text>
          {turn + 1} / {episode.steps.length}
        </Text>
      </Group>
    </Stack>
  );
}
