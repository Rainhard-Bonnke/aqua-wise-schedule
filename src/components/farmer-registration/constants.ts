export const TOTAL_STEPS = 4;

export const locations = [
  "Rachuonyo North", "Rachuonyo South", "Rachuonyo East",
  "Homa Bay Town", "Ndhiwa", "Rangwe", "Suba North", "Suba South"
];

export const soilTypes = [
  "Clay", "Sandy", "Loamy", "Silty", "Rocky", "Mixed"
];

export const waterSources = [
  "Borehole", "River", "Lake Victoria", "Rainwater", "Dam", "Spring"
];

export const cropOptions = [
  // Cereals
  "Maize", "Rice", "Sorghum", "Millet", "Wheat",
  
  // Legumes
  "Beans", "Groundnuts", "Cowpeas", "Green Grams", "Pigeon Peas",
  
  // Vegetables
  "Tomatoes", "Onions", "Kale (Sukuma Wiki)", "Cabbage", "Spinach", 
  "Carrots", "Lettuce", "Bell Peppers", "Eggplant", "Cucumber",
  "Okra", "Collard Greens", "Swiss Chard",
  
  // Root Crops
  "Potatoes", "Sweet Potatoes", "Cassava", "Yams", "Arrow Roots",
  
  // Fruits
  "Bananas", "Mangoes", "Avocados", "Oranges", "Lemons", "Pawpaws",
  "Watermelons", "Pineapples", "Passion Fruits", "Guavas",
  
  // Cash Crops
  "Coffee", "Tea", "Sugarcane", "Cotton", "Tobacco", "Sunflower",
  
  // Herbs & Spices
  "Coriander", "Parsley", "Mint", "Basil", "Rosemary", "Thyme",
  
  // Other
  "Fodder Crops", "Napier Grass", "Rhodes Grass"
];

// Alias for compatibility with CropInfoStep.tsx
export const crops = cropOptions;

export const irrigationMethods = [
  "Drip Irrigation", "Sprinkler", "Furrow", "Flood", "Manual Watering", 
  "Center Pivot", "Micro-sprinkler", "Subsurface Drip"
];