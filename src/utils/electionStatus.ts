const ELECTION_ENDED_KEY = "election_ended";

export const electionStatusHelper = {
  isEnded: (): boolean => {
    return localStorage.getItem(ELECTION_ENDED_KEY) === "true";
  },
  setEnded: (ended: boolean) => {
    if (ended) {
      localStorage.setItem(ELECTION_ENDED_KEY, "true");
    } else {
      localStorage.removeItem(ELECTION_ENDED_KEY);
    }
  },
};