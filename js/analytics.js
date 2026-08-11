export function calculateAnalytics(applications) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthCount = 0;
  let totalApplied = 0;
  let totalScreening = 0;
  let totalInterview = 0;
  let totalOffer = 0;
  let totalDaysInStage = 0;

  applications.forEach(app => {
    const appDate = new Date(app.dateApplied);
    
    // 1. Applications this month
    if (appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear) {
      monthCount++;
    }

    // Stage counts for conversion rates
    const status = app.status;
    if (status === 'Applied') totalApplied++;
    if (status === 'Screening') { totalApplied++; totalScreening++; }
    if (status === 'Interview') { totalApplied++; totalScreening++; totalInterview++; }
    if (status === 'Offer') { totalApplied++; totalScreening++; totalInterview++; totalOffer++; }
    if (status === 'Closed') { totalApplied++; }

    // Average time in stage
    const lastUpdate = app.statusUpdatedAt ? new Date(app.statusUpdatedAt) : appDate;
    const diffDays = Math.max(0, Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24)));
    totalDaysInStage += diffDays;
  });

  // Response Rate: Screenings / Applied
  const totalInPipeline = totalApplied;
  const reachedScreeningOrBeyond = totalScreening;
  const responseRate = totalInPipeline > 0 ? Math.round((reachedScreeningOrBeyond / totalInPipeline) * 100) : 0;

  // Interview Conversion Rate: Offers / Interviews
  const reachedInterview = totalInterview;
  const reachedOffer = totalOffer;
  const conversionRate = reachedInterview > 0 ? Math.round((reachedOffer / reachedInterview) * 100) : 0;

  // Average days spent in stage
  const avgDays = applications.length > 0 ? Math.round(totalDaysInStage / applications.length) : 0;

  return {
    monthCount,
    responseRate,
    conversionRate,
    avgDays
  };
}

export function renderAnalyticsPanel(analytics) {
  document.getElementById('metric-month-count').textContent = analytics.monthCount;
  document.getElementById('metric-response-rate').textContent = `${analytics.responseRate}%`;
  document.getElementById('metric-conversion-rate').textContent = `${analytics.conversionRate}%`;
  document.getElementById('metric-avg-days').textContent = `${analytics.avgDays}d`;
}
