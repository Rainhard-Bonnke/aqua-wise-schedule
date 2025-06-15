import { supabase } from "@/integrations/supabase/client";

export interface SupabaseFarm {
  id: string;
  name: string;
  location: string;
  size: number;
  soil_type: 'clay' | 'sandy' | 'loamy' | 'silty';
  farmer_id: string;
  created_at: string;
}

export interface SupabaseCrop {
  id: string;
  name: string;
  farm_id: string;
  planted_date: string;
  expected_harvest: string;
  water_requirement: 'low' | 'medium' | 'high';
  area: number;
  created_at: string;
}

export interface SupabaseIrrigationSchedule {
  id: string;
  farm_id: string;
  crop_id: string;
  frequency: number;
  duration: number;
  best_time: string;
  is_active: boolean | null;
  next_irrigation: string;
  created_at: string;
}

export interface SupabaseIrrigationLog {
  id: string;
  schedule_id: string;
  farm_id: string;
  irrigation_date: string;
  duration: number;
  water_used: number;
  completed: boolean | null;
  notes?: string | null;
  created_at: string;
}

export interface SupabaseProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export const supabaseDataService = {
  // Profile operations
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(updates: Partial<SupabaseProfile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Farm operations - now accessed through extension officer/admin interface
  async getFarms() {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createFarm(farm: Omit<SupabaseFarm, 'id' | 'created_at' | 'farmer_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const farmData = { ...farm, farmer_id: user.id };

    const { data, error } = await supabase
      .from('farms')
      .insert(farmData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFarm(id: string, updates: Partial<SupabaseFarm>) {
    const { data, error } = await supabase
      .from('farms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFarm(id: string) {
    const { error } = await supabase
      .from('farms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Crop operations
  async getCrops(farmId?: string) {
    let query = supabase
      .from('crops')
      .select('*');

    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createCrop(crop: Omit<SupabaseCrop, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('crops')
      .insert(crop)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCrop(id: string, updates: Partial<SupabaseCrop>) {
    const { data, error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCrop(id: string) {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Schedule operations
  async getSchedules(farmId?: string) {
    let query = supabase
      .from('irrigation_schedules')
      .select('*');

    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Log operations
  async getIrrigationLogs(farmId?: string) {
    let query = supabase
      .from('irrigation_logs')
      .select('*');

    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Authentication helpers
  async signUp(email: string, password: string, name: string, phone?: string, role?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role: role || 'extension_officer'
        }
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
