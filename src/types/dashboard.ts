export interface DashboardUserPatentItem {
    id: number;
    titulo: string;
    status: number;
    related_count: number;
}

export interface DashboardSummary {
    total_user_patents: number;
    total_related_patents: number;
    steps_counts: Record<number, number>;
    top_user_patents: DashboardUserPatentItem[];
}
