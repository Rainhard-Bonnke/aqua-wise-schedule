
import { supabaseDataService } from "@/services/supabaseDataService";
import { FarmerFormData } from "./types";

export const createFarmData = (formData: FarmerFormData, farmerId: string) => {
  return {
    name: formData.farmName || `${formData.name}'s Farm`,
    location: formData.location,
    size: parseFloat(formData.farmSize) || 0,
    soil_type: (formData.soilType?.toLowerCase() || "mixed") as 'clay' | 'sandy' | 'loamy' | 'silty',
    farmer_id: farmerId
  };
};

export const createCropsData = (formData: FarmerFormData, farmId: string) => {
  const numCrops = formData.cropTypes.length;
  const farmSize = parseFloat(formData.farmSize) || 0;
  // Prevent division by zero
  const areaPerCrop = numCrops > 0 ? farmSize / numCrops : farmSize || 1;
  return formData.cropTypes.map((cropName) => ({
    name: cropName,
    farm_id: farmId,
    planted_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    expected_harvest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    water_requirement: 'medium' as const,
    area: areaPerCrop
  }));
};

export const submitRegistration = async (formData: FarmerFormData) => {
  console.log("Registration data:", formData);
  
  try {
    // Get current user
    const currentUser = await supabaseDataService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User must be authenticated to register a farm");
    }

    // Create the farm with the current user's ID
    const farmData = createFarmData(formData, currentUser.id);
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
