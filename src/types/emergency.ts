export interface EmergencyAction {
  icon: string;
  title: string;
  description: string;
}

export interface EmergencyPlanSummary {
  title: string;
  actions: EmergencyAction[];
  recommendation?: string;
}

export interface EmergencyPlan {
  script: Array<{
    source: string;
    target: string;
    message: string;
    type: string;
  }>;
  summary: EmergencyPlanSummary;
  isAIGenerated: boolean;
}
