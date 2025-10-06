// Context and assumptions data for the alarm configurator
export const assumptions = {
  residential: [
    '≤200 m²',
    'Single storey',
    'Avg run 15–20 m',
    'Standard ceiling height',
    'Typical home layout'
  ],
  retail: [
    '≤300 m²',
    'Ground floor',
    'Avg run 20–25 m',
    'Open floor plan',
    'Customer access areas'
  ]
};

export const contextLabels = {
  residential: 'Residential',
  retail: 'Small Retail'
};

export const defaultChips = {
  residential: ['≤200 m²', 'Single storey', 'Avg run 15–20 m'],
  retail: ['≤300 m²', 'Ground floor', 'Avg run 20–25 m']
};