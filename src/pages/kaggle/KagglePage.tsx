import { Center, Loader, Text, Title } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { notifyError } from '../../utils/notifications';

let hasData = false;

export function KagglePage(): JSX.Element {
  const [seconds, setSeconds] = useState(0);
  const navigate = useNavigate();

  const onWindowMessage = useCallback((event: MessageEvent<any>) => {
    if (hasData) {
      return;
    }

    if (
      event.data &&
      event.data.episode &&
      event.data.logs &&
      event.data.episode.configuration &&
      event.data.episode.specification &&
      event.data.episode.steps
    ) {
      hasData = true;

      try {
        useStore.getState().load(event.data.episode, event.data.logs);
        navigate('/visualizer');
      } catch (err: any) {
        console.error(err);
        notifyError('Cannot load episode from Kaggle', err.message);
        navigate('/');
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', onWindowMessage);
    return () => {
      window.removeEventListener('message', onWindowMessage);
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Center style={{ height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader />
        <Title>Waiting for episode data from Kaggle</Title>
        {seconds >= 3 && (
          <Text>
            This is taking longer than expected, click <Link to="/">here</Link> to go to the home page
          </Text>
        )}
      </div>
    </Center>
  );
}
