import { dataService, type Farm, type User } from "@/services/dataService";
import { FarmerFormData } from "./types";

export const createFarmData = (formData: FarmerFormData): Farm => {
  // Convert crop strings to Crop objects
  const crops = formData.cropTypes.map((cropName, index) => ({
    id: `crop_${Date.now()}_${index}`,
    name: cropName,
    plantedDate: new Date().toISOString(),
    expectedHarvest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    waterRequirement: 'medium' as const,
    area: parseFloat(formData.farmSize) / formData.cropTypes.length || 1
  }));
  
  return {
    id: Date.now().toString(),
    name: formData.farmName || `${formData.name}'s Farm`,
    location: formData.location,
    size: parseFloat(formData.farmSize) || 0,
    soilType: formData.soilType || "Mixed",
    crops: crops,
    farmerName: formData.name,
    createdAt: new Date().toISOString()
  };
};

export const createUserData = (formData: FarmerFormData, farmId: string): User => {
  return {
    id: Date.now().toString(),
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    farms: [farmId],
    preferences: {
      notifications: {
        sms: true,
        email: true,
        push: true
      },
      units: 'metric',
      language: 'en'
    },
    createdAt: new Date().toISOString()
  };
};

export const submitRegistration = (formData: FarmerFormData) => {
  console.log("Registration data:", formData);
  
  const farmData = createFarmData(formData);
  const userData = createUserData(formData, farmData.id);
  
  dataService.saveFarm(farmData);
  dataService.saveUser(userData);
  
  return { farmData, userData };
};
