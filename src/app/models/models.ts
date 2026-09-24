// Core models matching the API DTOs
export interface LoginRequest  { email: string; password: string; }
export interface LoginResponse {
  userId: number; name: string; email: string;
  role: string; organizationName: string; token: string;
}

export interface TicketListItem {
  id: number; ticketNo: string; subject: string;
  customerName: string; applicationName?: string;
  type: string; priority: string; status: string;
  assigneeName?: string; slaDueAt?: string; updatedAt?: string;
}

export interface TicketDetail extends TicketListItem {
  category?: string; description: string;
  reproductionSteps?: string; expectedResult?: string; actualResult?: string;
  customerId: number; applicationId?: number;
  assigneeId?: number; createdBy: number; creatorName: string;
  resolvedAt?: string; closedAt?: string; createdAt?: string;
  comments: Comment[]; history: HistoryEntry[];
}

export interface Comment {
  id: number; body: string; visibility: string;
  authorName: string; createdAt?: string;
}

export interface HistoryEntry {
  id: number; action: string; fieldName?: string;
  oldValue?: string; newValue?: string;
  note?: string; actorName: string; createdAt?: string;
}

export interface Customer  { id: number; name: string; accountCode: string; status: string; organizationId: number; }
export interface AppModel   { id: number; name: string; version?: string; technology?: string; status: string; customerId: number; }
export interface UserModel  { id: number; name: string; email: string; role: string; status: string; }

export interface DashboardStats {
  openTickets: number; unassignedTickets: number;
  criticalHighTickets: number; slaAtRisk: number;
  overdueTickets: number; avgResolutionHours: number;
}

export const STATUSES = [
  'New','Under Review','Assigned','In Progress',
  'Waiting for Customer','Ready for QA','Testing',
  'Resolved','Closed','Reopened'
];
export const PRIORITIES = ['Critical','High','Medium','Low'];
export const TYPES      = ['Bug','Feature','Support','Change'];
export const ROLES      = ['Admin','SupportManager','SupportExecutive','Developer','QA','CustomerAdmin','CustomerUser','Management'];
