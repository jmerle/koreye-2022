import { Button, Code, createStyles, List, Progress, Text, TextInput, useMantineTheme } from '@mantine/core';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_PROXY } from '../../constants';
import { useStore } from '../../store';
import { notifyError } from '../../utils/notifications';
import { HomeCard } from './HomeCard';

const useStyles = createStyles(() => ({
  submitButton: {
    position: 'relative',
    transition: 'background-color 150ms ease',

    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&::before': {
      backgroundColor: 'transparent',
    },
  },

  submitLabel: {
    position: 'relative',
    zIndex: 1,
  },

  submitProgress: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    left: -1,
    top: -1,
    height: 'auto',
    backgroundColor: 'transparent',
    zIndex: 0,
  },
}));

export function LoadFromElsewhere(): JSX.Element {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  const [input, setInput] = useState('');
  const [proxy, setProxy] = useState(DEFAULT_PROXY);

  const loadFromInput = useStore(state => state.loadFromInput);
  const episode = useStore(state => state.episode);
  const loading = useStore(state => state.loading);
  const progress = useStore(state => state.progress);

  const navigate = useNavigate();
  const searchParams = useSearchParams()[0];

  const formRef = useRef<HTMLFormElement>(null);

  const copyToInput = useCallback(
    (event: any) => {
      if (!loading) {
        setInput(event.target.textContent!);
      }

      event.preventDefault();
    },
    [loading],
  );

  const onSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (input.trim().length === 0) {
        return;
      }

      loadFromInput(input, proxy)
        .then(() => {
          const newSearchParams: Record<string, string> = { input };
          if (proxy !== DEFAULT_PROXY) {
            newSearchParams.proxy = proxy;
          }

          navigate(`/visualizer?${new URLSearchParams(newSearchParams).toString()}`);
        })
        .catch((err: Error) => {
          notifyError('Cannot not load episode from input', err.message);
        });
    },
    [input, proxy, navigate],
  );

  useEffect(() => {
    if (episode !== null || loading) {
      return;
    }

    if (!searchParams.has('input')) {
      return;
    }

    const input = searchParams.get('input') || '';
    if (input.trim().length === 0) {
      return;
    }

    setInput(input);

    let proxy = searchParams.get('proxy');
    if (proxy !== null) {
      setProxy(proxy);
    } else {
      proxy = DEFAULT_PROXY;
    }

    loadFromInput(input, proxy)
      .then(() => {
        navigate(`/visualizer?${searchParams.toString()}`);
      })
      .catch((err: Error) => {
        notifyError('Cannot not load episode from URL', err.message);
      });
  }, []);

  return (
    <HomeCard title="Load from elsewhere">
      {/* prettier-ignore */}
      <Text mb="xs">
        Supported inputs:
        <List>
          <List.Item>Kaggle episode ids, like <a href="src/pages/home/LoadFromElsewhere" onClick={copyToInput}>36310051</a>.</List.Item>
          <List.Item>Kaggle leaderboard URLs, like <a href="src/pages/home/LoadFromElsewhere" onClick={copyToInput}>https://www.kaggle.com/competitions/kore-2022/leaderboard?dialog=episodes-episode-36310051</a>.</List.Item>
          <List.Item>URLs to HTML replays or JSON episode data, like <a href="src/pages/home/LoadFromElsewhere" onClick={copyToInput}>https://www.kaggleusercontent.com/episodes/36310051.json</a>.</List.Item>
        </List>
      </Text>

      {/* prettier-ignore */}
      <Text mb="xs">
        By default all non-localhost requests are proxied through a <a href="https://github.com/Rob--W/cors-anywhere" target="_blank" rel="noreferrer">CORS Anywhere</a> instance hosted by me (the creator of Koreye 2022).
        This is necessary because many websites (including Kaggle) serve requests without <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin" target="_blank" rel="noreferrer">Access-Control-Allow-Origin</a> headers.
        While I promise no episodes are persisted server-side, you are free to change the proxy to one hosted by yourself.
        Emptying the proxy field disables the use of any proxy.
      </Text>

      {/* prettier-ignore */}
      <Text mb="xs">
        This input type can also be used by browsing to <Code>{window.location.origin}{window.location.pathname}?input=&lt;input&gt;&proxy=&lt;proxy&gt;</Code>.
        If the <Code>proxy</Code> parameter is omitted then <Code>{DEFAULT_PROXY}</Code> is used, if it is set to an empty value then no proxy is used.
        The <Code>proxy</Code> parameter is ignored if <Code>input</Code> is a localhost URL.
      </Text>

      <form onSubmit={onSubmit} ref={formRef}>
        <TextInput
          value={input}
          placeholder="Input"
          onInput={e => setInput((e.target as HTMLInputElement).value)}
          disabled={loading}
          mb="xs"
        />

        <TextInput
          value={proxy}
          placeholder="Proxy"
          onInput={e => setProxy((e.target as HTMLInputElement).value)}
          disabled={loading}
          mb="xs"
        />

        <Button type="submit" fullWidth={true} loading={loading} className={classes.submitButton}>
          <div className={classes.submitLabel}>{loading ? 'Loading' : 'Load'}</div>
          {loading && (
            <Progress
              value={progress * 100}
              color={theme.fn.rgba(theme.colors[theme.primaryColor][2], 0.35)}
              className={classes.submitProgress}
            />
          )}
        </Button>
      </form>
    </HomeCard>
  );
}
