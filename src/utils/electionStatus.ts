import type { Election } from "../types";

export interface ElectionState {
  isPublished: boolean;
  endTime: string | null;
  isEnded: boolean;
  showGraph: boolean;
}

export const EMPTY_ELECTION_STATE: ElectionState = {
  isPublished: false,
  endTime: null,
  isEnded: false,
  showGraph: false,
};

// Status publikasi berasal dari database (Election.status, endAt, showGraph)
export const deriveElectionState = (
  election: Pick<Election, "status" | "endAt" | "showGraph"> | null | undefined
): ElectionState => {
  if (!election) return EMPTY_ELECTION_STATE;

  const endTime = election.endAt ?? null;
  // ONGOING tanpa waktu berakhir belum dipublikasikan lewat tombol Publikasi
  const isPublished =
    election.status === "COMPLETED" || (election.status === "ONGOING" && !!endTime);
  const isEnded =
    isPublished &&
    (election.status === "COMPLETED" ||
      (!!endTime && new Date(endTime).getTime() <= Date.now()));

  return {
    isPublished,
    endTime,
    isEnded,
    showGraph: !!election.showGraph,
  };
};

export const getTimeRemaining = (
  endTime: string | null
): { days: number; hours: number; minutes: number; seconds: number; isExpired: boolean } => {
  if (!endTime) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const diff = new Date(endTime).getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isExpired: false,
  };
};
