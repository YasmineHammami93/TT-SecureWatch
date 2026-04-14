export type Role = 'ADMIN' | 'ANALYSTE' | 'VIEWER';

export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: Date;
}

export type Severity = 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'FAIBLE';
export type Status = 'Nouveau' | 'En cours' | 'Résolu' | 'Faux Positif';

export interface Alert {
  _id: string;
  id?: string;
  title: string;
  description: string;
  source: string;
  severity: Severity;
  status: Status;
  category: string;
  assignedTo?: User;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  details?: Record<string, any>;
  indicators?: any[];
  mlAnalysis?: {
    prediction: string;
    confidence: number;
    riskScore: number;
    riskLevel: string;
  };
}

export interface Action {
  id: string;
  alertId: string;
  user: User;
  type: string;
  comment?: string;
  timestamp: Date;
}

export interface StatSummary {
  totalAlerts: number;
  criticalAlerts: number;
  avgResolutionTime: number;
  activeAnalysts: number;
  falsePositiveRate: number;
  mttr: number;
}
