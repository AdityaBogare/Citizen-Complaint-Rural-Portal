const defaultAuthorities = [
  { name: 'Ward Sanitation Inspector', department: 'Sanitation', level: 'Ward', ward: 'Ward 12' },
  { name: 'Municipal Engineer', department: 'Roads', level: 'Municipal', ward: 'Ward 12' },
  { name: 'Water Supply Officer', department: 'Water Supply', level: 'Division', ward: 'Ward 5' },
  { name: 'Public Works Supervisor', department: 'Roads', level: 'Division', ward: 'Ward 12' },
  { name: 'District Administrator', department: 'Administration', level: 'District', ward: 'All' }
];

const complaintKeywords = {
  Roads: ['road', 'pothole', 'lane', 'street', 'breakage', 'traffic', 'surface'],
  'Water Supply': ['water', 'leak', 'pipe', 'tap', 'tank', 'supply'],
  Sanitation: ['garbage', 'waste', 'drain', 'clean', 'toilet', 'sewer', 'bin'],
  'Streetlights': ['light', 'streetlight', 'electricity', 'lamp', 'dark'],
  Drainage: ['drainage', 'drain', 'stagnant', 'flood', 'waterlogging'],
  Electricity: ['electricity', 'power', 'transformer', 'wire', 'short', 'pole']
};

const analyzeComplaint = (title = '', description = '', category = 'Roads') => {
  const raw = `${title} ${description}`.toLowerCase();
  let mappedCategory = category;

  for (const [key, keywords] of Object.entries(complaintKeywords)) {
    if (keywords.some((word) => raw.includes(word))) {
      mappedCategory = key;
      break;
    }
  }

  const urgency = raw.includes('danger') || raw.includes('accident') || raw.includes('flood') ? 'Critical' :
    raw.includes('urgent') || raw.includes('broken') ? 'High' : 'Medium';

  const departmentMap = {
    Roads: 'Public Works Department',
    'Water Supply': 'Water Resource Department',
    Sanitation: 'Sanitation Department',
    'Streetlights': 'Electricity & Lighting Department',
    Drainage: 'Drainage & Sewerage Department',
    Electricity: 'Power Distribution Department'
  };

  const actionMap = {
    Roads: 'Dispatch roadway inspection and repair crew.',
    'Water Supply': 'Inspect piping network and isolate leak points.',
    Sanitation: 'Review garbage collection and clean affected public areas.',
    'Streetlights': 'Inspect lighting infrastructure and restore power supply.',
    Drainage: 'Clear drainage channel and remove blockages.',
    Electricity: 'Inspect electrical network and complete necessary restoration.'
  };

  const confidence = raw.length > 80 ? 92 : 78;

  return {
    category: mappedCategory,
    department: departmentMap[mappedCategory] || 'Local Administration Office',
    urgency,
    confidence,
    assignedOfficer: 'Ward Field Officer',
    suggestedAction: actionMap[mappedCategory] || 'Review complaint and coordinate with local authority.'
  };
};

export { analyzeComplaint, defaultAuthorities };
