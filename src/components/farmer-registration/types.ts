
export interface FarmerFormData {
  // Personal Information
  name: string;
  phone: string;
  email: string;
  nationalId: string;
  gender: string;
  dateOfBirth: string;
  
  // Farm Information
  farmName: string;
  location: string;
  farmSize: string;
  soilType: string;
  waterSource: string;
  
  // Experience & Crops
  experience: string;
  cropTypes: string[];
  irrigationMethod: string;
  
  // Agreements
  agreesToTerms: boolean;
  agreesToDataSharing: boolean;
}

export interface StepProps {
  formData: FarmerFormData;
  onInputChange: (field: string, value: string | boolean | string[]) => void;
  onCropToggle?: (crop: string) => void;
}
