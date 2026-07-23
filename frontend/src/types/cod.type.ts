export type CODStatus = 'not_requested' | 'pending' | 'approved' | 'rejected';

export interface CODCriteria {
  key: string;
  label: string;
  met: boolean;
  detail?: string;
}

export interface CODRequest {
  status: CODStatus;
  requestedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}
