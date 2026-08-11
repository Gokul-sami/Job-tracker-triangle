const tierConfig = {
  Applied: { fillId: "fill-applied", minY: 192, maxY: 240 },
  Screening: { fillId: "fill-screening", minY: 144, maxY: 192 },
  Interview: { fillId: "fill-interview", minY: 96, maxY: 144 },
  Offer: { fillId: "fill-offer", minY: 48, maxY: 96 },
  Closed: { fillId: "fill-closed", minY: 8, maxY: 48 }
};

export function updateTriangleVisualization(applications) {
  const counts = applications.reduce(
    (acc, app) => {
      if (acc[app.status] !== undefined) acc[app.status] += 1;
      return acc;
    },
    { Applied: 0, Screening: 0, Interview: 0, Offer: 0, Closed: 0 }
  );

  const maxCount = Math.max(1, ...Object.values(counts));

  Object.entries(tierConfig).forEach(([stage, config]) => {
    const fillRect = document.getElementById(config.fillId);
    if (!fillRect) return;

    const fullHeight = config.maxY - config.minY;
    const ratio = counts[stage] / maxCount;
    const height = fullHeight * ratio;
    const y = config.maxY - height;

    fillRect.setAttribute("y", String(y));
    fillRect.setAttribute("height", String(height));
  });
}
