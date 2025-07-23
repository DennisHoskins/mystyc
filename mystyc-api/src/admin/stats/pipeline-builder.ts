import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

export class StatsAggregationBuilder {
  private pipeline: any[] = [];

  static create() {
    return new StatsAggregationBuilder();
  }

  dateFilter(dates: { startDate?: string; endDate?: string }, field = 'createdAt') {
    if (dates?.startDate || dates?.endDate) {
      const dateMatch: any = {};
      if (dates.startDate) dateMatch.$gte = new Date(dates.startDate);
      if (dates.endDate) dateMatch.$lte = new Date(dates.endDate);
      this.pipeline.push({ $match: { [field]: dateMatch } });
    }
    return this;
  }

  performanceLimit(query: AdminStatsQuery) {
    const maxRecords = Math.min(query?.maxRecords || 50000, 100000);
    this.pipeline.push({ $sort: { createdAt: -1 } }, { $limit: maxRecords });
    return this;
  }

  groupByField(field: string, additionalFields?: Record<string, any>) {
    this.pipeline.push({
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
        ...additionalFields
      }
    });
    return this;
  }

  groupByDatePeriod(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const groupBy = period === 'daily' 
      ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
      : period === 'weekly'
      ? { 
          $dateToString: { 
            format: "%Y-%m-%d", 
            date: {
              $dateFromParts: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $subtract: [{ $dayOfMonth: "$createdAt" }, { $dayOfWeek: "$createdAt" }] }
              }
            }
          }
        }
      : { $dateToString: { format: "%Y-%m", date: "$createdAt" } };

    this.pipeline.push({
      $group: {
        _id: groupBy,
        count: { $sum: 1 }
      }
    });
    return this;
  }

  addPercentages(totalField = 'total') {
    this.pipeline.push({
      $addFields: {
        percentage: {
          $round: [{ $multiply: [{ $divide: ['$count', `$${totalField}`] }, 100] }]
        }
      }
    });
    return this;
  }

  sort(field: string, direction: 1 | -1 = -1) {
    this.pipeline.push({ $sort: { [field]: direction } });
    return this;
  }

  limit(count: number) {
    this.pipeline.push({ $limit: count });
    return this;
  }

  build() {
    return [...this.pipeline];
  }
}