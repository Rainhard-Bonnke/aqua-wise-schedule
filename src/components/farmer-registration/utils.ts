
import { supabaseDataService } from "@/services/supabaseDataService";
import { FarmerFormData } from "./types";

export const createFarmData = (formData: FarmerFormData) => {
  return {
    name: formData.farmName || `${formData.name}'s Farm`,
    location: formData.location,
    size: parseFloat(formData.farmSize) || 0,
    soil_type: (formData.soilType?.toLowerCase() || "mixed") as 'clay' | 'sandy' | 'loamy' | 'silty'
  };
};

export const createCropsData = (formData: FarmerFormData, farmId: string) => {
  return formData.cropTypes.map((cropName) => ({
    name: cropName,
    farm_id: farmId,
    planted_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    expected_harvest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    water_requirement: 'medium' as const,
    area: parseFloat(formData.farmSize) / formData.cropTypes.length || 1
  }));
};

export const submitRegistration = async (formData: FarmerFormData) => {
  console.log("Registration data:", formData);
  
  try {
    // Create the farm
    const farmData = createFarmData(formData);
    const createdFarm = await supabaseDataService.createFarm(farmData);
    
    // Create crops for the farm
    const cropsData = createCropsData(formData, createdFarm.id);
    const createdCrops = await Promise.all(
      cropsData.map(crop => supabaseDataService.createCrop(crop))
    );
    
    // Update user profile with additional information
    await supabaseDataService.updateProfile({
      name: formData.name,
      phone: formData.phone
    });
    
    return { 
      farmData: createdFarm, 
      cropsData: createdCrops,
      userData: { name: formData.name, phone: formData.phone }
    };
  } catch (error) {
    console.error("Error submitting registration:", error);
    throw error;
  }
};
