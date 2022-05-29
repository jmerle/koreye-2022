import axios from 'axios';
import create from 'zustand';
import { Cell, ParsedEpisode, parseRawEpisode } from './models/episode/parsed';
import { RawEpisode } from './models/episode/raw';
import { Logs } from './models/logs';

export interface State {
  episode: ParsedEpisode | null;

  turn: number;
  speed: number;
  selectedCell: Cell | null;

  loading: boolean;
  progress: number;

  setTurn: (turn: number) => void;
  increaseTurn: () => boolean;
  setSpeed: (speed: number) => void;
  setSelectedCell: (selectedCell: Cell | null) => void;

  load: (rawEpisode: RawEpisode, logs: Logs | null) => void;
  loadFromString: (str: string) => void;
  loadFromFile: (file: File) => Promise<void>;
  loadFromInput: (input: string, proxy: string) => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  episode: null,

  turn: 1,
  selectedCell: null,

  playing: false,
  speed: 1,

  loading: false,
  progress: 0,

  setTurn: turn => {
    if (get().turn !== turn) {
      set({ turn });
    }
  },

  increaseTurn: () => {
    if (get().turn === get().episode!.steps.length - 1) {
      return false;
    }

    set(state => ({ turn: state.turn + 1 }));
    return true;
  },

  setSpeed: speed => {
    if (get().speed !== speed) {
      set({ speed });
    }
  },

  setSelectedCell: selectedCell => {
    const current = get().selectedCell;
    if (
      (selectedCell === null && current !== null) ||
      (selectedCell !== null && (selectedCell.x !== current?.x || selectedCell.y !== current?.y))
    ) {
      set({ selectedCell });
    }
  },

  load: (rawEpisode, logs) => {
    if (!rawEpisode.configuration || !rawEpisode.specification || !rawEpisode.steps) {
      throw new Error('Invalid episode data');
    }

    const parsedEpisode = parseRawEpisode(rawEpisode, logs);

    set({
      episode: parsedEpisode,
      turn: 0,
      speed: 1,
    });
  },

  loadFromString: str => {
    str = str.trim();

    if (str.startsWith("{'error':")) {
      const error = /'error': "(.*), 'trace':/.exec(str)![1];
      throw new Error(`Episode error: ${error}`);
    }

    let rawEpisode: RawEpisode;
    let logs: Logs | null = null;

    if (str.startsWith('<')) {
      const episodeMatches = /"environment":\s*({.*}),\s*"logs":\s*\[/s.exec(str);
      if (episodeMatches !== null) {
        rawEpisode = JSON.parse(episodeMatches[1]);
      }

      const logsMatches = /"logs":\s*(\[.*]),\s*"mode":/s.exec(str);
      if (logsMatches !== null) {
        logs = JSON.parse(logsMatches[1]);
      }
    } else {
      rawEpisode = JSON.parse(str);
    }

    get().load(rawEpisode!, logs);
  },

  loadFromFile: file =>
    new Promise((resolve, reject) => {
      set({ loading: true, progress: 0 });

      const reader = new FileReader();

      reader.addEventListener('load', () => {
        set({ loading: false });

        try {
          get().loadFromString(reader.result as string);
          resolve();
        } catch (err: any) {
          reject(err);
        }
      });

      reader.addEventListener('error', () => {
        reject(new Error('FileReader emitted an error event'));
      });

      reader.readAsText(file);
    }),

  loadFromInput: async (input, proxy) => {
    set({ loading: true, progress: 0 });

    let url: string;
    if (/^\d+$/.test(input)) {
      url = `https://www.kaggleusercontent.com/episodes/${input}.json`;
    } else if (input.startsWith('https://www.kaggle.com/competitions/kore-2022/leaderboard?dialog=episodes-episode-')) {
      const id = input.split('-').pop();
      url = `https://www.kaggleusercontent.com/episodes/${id}.json`;
    } else {
      url = input;
    }

    let parsedURL: URL;
    try {
      parsedURL = new URL(url);
    } catch (err: any) {
      set({ loading: false });
      throw new Error('Invalid input');
    }

    if (parsedURL.hostname !== 'localhost' && proxy.trim().length > 0) {
      url = proxy + url;
    }

    try {
      const response = await axios.get(url, {
        onDownloadProgress: event => {
          if (event.loaded && event.total) {
            set({ progress: event.loaded / event.total });
          }
        },
      });

      set({ loading: false, progress: 0 });

      const content = response.data;
      if (typeof content === 'object') {
        get().load(content, null);
      } else {
        get().loadFromString(content);
      }
    } catch (err: any) {
      set({ loading: false, progress: 0 });

      console.error(err);

      if (
        err.response &&
        typeof err.response.data === 'string' &&
        err.response.data.endsWith('was not whitelisted by the operator of this proxy.')
      ) {
        throw new Error('The current origin is not whitelisted by the operator of the specified CORS Anywhere proxy');
      }

      throw new Error(`${err.message}, see the browser console for more information`);
    }
  },
}));
