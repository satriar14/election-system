export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'PENGAWAS' | 'WARGA';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

export type ElectionStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  house?: {
    id: string;
    houseNumber: string;
    rtNumber?: string;
    rwNumber?: string;
  } | null;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string | null;
  invitedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface House {
  id: string;
  block: string;
  houseNumber: string;
  voterQuota: number;
  usedQuota?: number;
  remainingQuota?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Candidate {
  id: string;
  name: string;
  photo?: string | null;
  vision?: string | null;
  mission?: string | null;
  isLag?: boolean;
  electionId: string;
  voteCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Election {
  id: string;
  title: string;
  description?: string | null;
  status: ElectionStatus;
  startAt?: string | null;
  endAt?: string | null;
  showGraph?: boolean;
  candidates?: Candidate[];
  candidateCount?: number;
  voteCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  details?: string | null;
  createdAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: User;
}

export interface VerifyHouseResponse {
  houseId: string;
  block: string;
  houseNumber: string;
  voterQuota: number;
  usedQuota: number;
  remainingQuota: number;
}

export interface VoteResultCandidate {
  id: string;
  name: string;
  photo?: string | null;
  voteCount: number;
  percentage: number;
}

export interface ElectionResultResponse {
  election: {
    id: string;
    title: string;
    status: ElectionStatus;
  };
  totalVotes: number;
  candidates: VoteResultCandidate[];
}
