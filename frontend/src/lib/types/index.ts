// ── User ────────────────────────────────────────────────────

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Task ────────────────────────────────────────────────────

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedUserId: string | null;
  assignedUser?: Pick<User, 'id' | 'name' | 'email'> | null;
  createdById: string;
  createdBy?: Pick<User, 'id' | 'name' | 'email'>;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  assignedUserId?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedUserId?: string | null;
  dueDate?: string | null;
}

// ── Audit ───────────────────────────────────────────────────

export enum ActionType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
}

export interface AuditLog {
  id: string;
  actorId: string;
  actor: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  actionType: ActionType;
  targetEntity: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

// ── Auth ────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>;
}

// ── API ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
