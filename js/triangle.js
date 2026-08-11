// Stage heights in SVG user units
const STAGE_CONFIG = {
  Closed: { id: 'fill-closed', labelId: 'count-closed', topY: 20, height: 40 },
  Offer: { id: 'fill-offer', labelId: 'count-offer', topY: 62, height: 56 },
  Interview: { id: 'fill-interview', labelId: 'count-interview', topY: 120, height: 80 },
  Screening: { id: 'fill-screening', labelId: 'count-screening', topY: 202, height: 78 },
  Applied: { id: 'fill-applied', labelId: 'count-applied', topY: 282, height: 58 }
};

export function updateTriangleVisualization(applications) {
  // Count active applications per stage
  const counts = {
    Applied: 0,
    Screening: 0,
    Interview: 0,
    Offer: 0,
    Closed: 0
  };

  applications.forEach(app => {
    if (counts.hasOwnProperty(app.status)) {
      counts[app.status]++;
    }
  });

  const totalApps = applications.length;

  // Update counts and water level for each tier
  Object.keys(STAGE_CONFIG).forEach(stage => {
    const config = STAGE_CONFIG[stage];
    const count = counts[stage];
    
    // Update label count display
    const labelElem = document.getElementById(config.labelId);
    if (labelElem) {
      labelElem.textContent = count;
    }

    // Calculate level fill ratio (relative to total apps or non-zero proportion)
    const fillRatio = totalApps > 0 ? count / totalApps : 0;
    
    // Calculate Y offset (Water rises from bottom of each tier section)
    const fillElem = document.getElementById(config.id);
    if (fillElem) {
      const fillHeight = config.height * Math.min(fillRatio * 2.5, 1); // Scaled visual fill
      const targetY = (config.topY + config.height) - fillHeight;
      
      fillElem.setAttribute('y', targetY.toString());
      fillElem.setAttribute('height', fillHeight.toString());
    }
  });
}
