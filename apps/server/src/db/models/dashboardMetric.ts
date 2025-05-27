import mongoose, { Document, Schema } from 'mongoose';

export interface IDashboardMetric extends Document {
  metricKey: string;
  periodStart: Date;
  periodEnd: Date;
  metricValue?: number;
  deltaPct?: number;
}

const dashboardMetricSchema = new Schema<IDashboardMetric>(
  {
    metricKey:   { type: String, required: true },
    periodStart: { type: Date, required: true },
    periodEnd:   { type: Date, required: true },
    metricValue: { type: Number },
    deltaPct:    { type: Number }
  },
  { collection: 'dashboard_metrics' }
);

dashboardMetricSchema.index(
  { metricKey: 1, periodStart: 1, periodEnd: 1 },
  { unique: true }
);

export default mongoose.model<IDashboardMetric>('DashboardMetric', dashboardMetricSchema);
