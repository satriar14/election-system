const ELECTION_STATE_KEY = "election_state";

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

export const electionStatusHelper = {
  getState: (): ElectionState => {
    try {
      const raw = localStorage.getItem(ELECTION_STATE_KEY);
      if (!raw) return DEFAULT_STATE;
      return JSON.parse(raw);
    } catch {
      return DEFAULT_STATE;
    }
  },

  setState: (state: Partial<ElectionState>) => {
    const current = electionStatusHelper.getState();
    const updated = { ...current, ...state };
    localStorage.setItem(ELECTION_STATE_KEY, JSON.stringify(updated));
    return updated;
  },

  checkAutoEnd: (): boolean => {
    const state = electionStatusHelper.getState();
    if (!state.isPublished || !state.endTime) return false;

    const now = new Date().getTime();
    const end = new Date(state.endTime).getTime();

    if (now >= end && !state.isEnded) {
      electionStatusHelper.setState({ isEnded: true });
      return true;
    }
    return state.isEnded;
  },

  getTimeRemaining: (): { days: number; hours: number; minutes: number; seconds: number; isExpired: boolean } => {
    const state = electionStatusHelper.getState();
    if (!state.endTime) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const now = new Date().getTime();
    const end = new Date(state.endTime).getTime();
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

  reset: () => {
    localStorage.removeItem(ELECTION_STATE_KEY);
  },

  isEnded: (): boolean => {
    return electionStatusHelper.checkAutoEnd();
  },
  setEnded: (ended: boolean) => {
    electionStatusHelper.setState({ isEnded: ended });
  },
};