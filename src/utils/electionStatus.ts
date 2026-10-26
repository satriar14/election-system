export interface ElectionState {
  isPublished: boolean;
  endTime: string | null;
  isEnded: boolean;
  showGraph: boolean;
}

const DEFAULT_STATE: ElectionState = {
  isPublished: false,
  endTime: null,
  isEnded: false,
  showGraph: false,
};

let currentState: ElectionState = { ...DEFAULT_STATE };

export const electionStatusHelper = {
  getState: (): ElectionState => {
    return { ...currentState };
  },

  setState: (state: Partial<ElectionState>) => {
    currentState = { ...currentState, ...state };
    return currentState;
  },

  syncFromElection: (election: any): ElectionState => {
    if (!election) {
      currentState = { ...DEFAULT_STATE };
      return currentState;
    }

    const isPublished =
      election.status === "ONGOING" || election.status === "COMPLETED";
    const isEnded = election.status === "COMPLETED";

    currentState = {
      isPublished,
      endTime: election.endAt || null,
      isEnded,
      showGraph: election.showGraph === true,
    };
    return currentState;
  },

  getTimeRemaining: (): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } => {
    if (!currentState.endTime) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const now = new Date().getTime();
    const end = new Date(currentState.endTime).getTime();
    const diff = end - now;

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
  },

  checkAutoEnd: (): boolean => {
    if (!currentState.endTime || !currentState.isPublished) return false;
    const now = new Date().getTime();
    const end = new Date(currentState.endTime).getTime();
    if (now >= end && !currentState.isEnded) {
      currentState.isEnded = true;
      return true;
    }
    return currentState.isEnded;
  },

  reset: () => {
    currentState = { ...DEFAULT_STATE };
  },

  isEnded: (): boolean => currentState.isEnded,
  setEnded: (ended: boolean) => {
    currentState.isEnded = ended;
  },
};