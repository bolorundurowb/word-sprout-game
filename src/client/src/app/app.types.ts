export type RowData = Record<string, string | null | undefined>;

export interface Play {
  character: string;
  columnValues: RowData;
}

export interface GameState {
  currentCharacter?: string;
  playedCharacters: string[];
  currentPlayer?: string;
  roundStatus?: GameRoundStatus;
  secsSinceStatusChange: number;
}

export interface Player {
  userName: string;
  joinedAt?: Date;
}

export interface Game {
  id: string,
  initiatedBy: string,
  players: Player[],
  code: string,
  status: string,
  columns: string[],
  characterSet: string[],
  maxIntervalBetweenRoundsInSecs: number,
  maxRoundDurationInSecs: number
}

export interface RoundPlaySubmittedEvent {
  userName: string;
  character: string;
  columnValues: RowData;
}

export interface RoundEndedEvent {
  character: string;
}

export enum GameRoundStatus {
  INTERVAL = 'AwaitingCharacterSelection',
  PLAYING = 'InProgress',
  SCORING = 'AwaitingScoring'
}
