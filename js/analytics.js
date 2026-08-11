const STAGES = ["Applied", "Screening", "Interview", "Offer", "Closed"];

export function calculateAnalytics(applications) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const counts = applications.reduce(
    (acc, app) => {
      if (acc[app.status] !== undefined) acc[app.status] += 1;
      return acc;
    },
    { Applied: 0, Screening: 0, Interview: 0, Offer: 0, Closed: 0 }
  );

  const totalThisMonth = applications.filter((app) => {
    const date = new Date(app.dateApplied);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const responseRate = counts.Applied ? (counts.Screening / counts.Applied) * 100 : 0;
  const conversionRate = counts.Interview ? (counts.Offer / counts.Interview) * 100 : 0;

  const avgDaysPerStage = STAGES.reduce((acc, stage) => {
    const inStage = applications.filter((app) => app.status === stage);
    if (!inStage.length) {
      acc[stage] = 0;
      return acc;
    }

    const days = inStage.map((app) => {
      const updatedAt = new Date(app.updatedAt || app.dateApplied);
      return Math.max(0, Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24)));
    });

    acc[stage] = Number((days.reduce((sum, value) => sum + value, 0) / inStage.length).toFixed(1));
    return acc;
  }, {});

  return {
    totalThisMonth,
    responseRate: Number(responseRate.toFixed(1)),
    conversionRate: Number(conversionRate.toFixed(1)),
    avgDaysPerStage
  };
}

export function renderAnalyticsPanel(analyticsData) {
  const totalEl = document.getElementById("metric-total");
  const responseEl = document.getElementById("metric-response");
  const conversionEl = document.getElementById("metric-conversion");
  const avgDaysEl = document.getElementById("metric-avg-days");

  if (totalEl) totalEl.textContent = String(analyticsData.totalThisMonth);
  if (responseEl) responseEl.textContent = `${analyticsData.responseRate}%`;
  if (conversionEl) conversionEl.textContent = `${analyticsData.conversionRate}%`;
  if (avgDaysEl) {
    avgDaysEl.textContent = STAGES.map((stage) => `${stage}: ${analyticsData.avgDaysPerStage[stage] ?? 0}d`).join(" | ");
  }
}
