export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      crops: {
        Row: {
          area: number
          created_at: string
          expected_harvest: string
          farm_id: string
          id: string
          name: string
          planted_date: string
          water_requirement: Database["public"]["Enums"]["water_requirement"]
        }
        Insert: {
          area: number
          created_at?: string
          expected_harvest: string
          farm_id: string
          id?: string
          name: string
          planted_date: string
          water_requirement: Database["public"]["Enums"]["water_requirement"]
        }
        Update: {
          area?: number
          created_at?: string
          expected_harvest?: string
          farm_id?: string
          id?: string
          name?: string
          planted_date?: string
          water_requirement?: Database["public"]["Enums"]["water_requirement"]
        }
        Relationships: [
          {
            foreignKeyName: "crops_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string
          from_email: string | null
          from_name: string | null
          html_content: string
          id: string
          is_active: boolean | null
          subject: string
          template_type: string
          text_content: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          subject: string
          template_type: string
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          subject?: string
          template_type?: string
          text_content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      farms: {
        Row: {
          created_at: string
          farmer_id: string
          id: string
          location: string
          name: string
          size: number
          soil_type: Database["public"]["Enums"]["soil_type"]
        }
        Insert: {
          created_at?: string
          farmer_id: string
          id?: string
          location: string
          name: string
          size: number
          soil_type: Database["public"]["Enums"]["soil_type"]
        }
        Update: {
          created_at?: string
          farmer_id?: string
          id?: string
          location?: string
          name?: string
          size?: number
          soil_type?: Database["public"]["Enums"]["soil_type"]
        }
        Relationships: [
          {
            foreignKeyName: "farms_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      irrigation_logs: {
        Row: {
          completed: boolean | null
          created_at: string
          duration: number
          farm_id: string
          id: string
          irrigation_date: string
          notes: string | null
          schedule_id: string
          water_used: number
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          duration: number
          farm_id: string
          id?: string
          irrigation_date: string
          notes?: string | null
          schedule_id: string
          water_used: number
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          duration?: number
          farm_id?: string
          id?: string
          irrigation_date?: string
          notes?: string | null
          schedule_id?: string
          water_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "irrigation_logs_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "irrigation_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "irrigation_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      irrigation_schedules: {
        Row: {
          best_time: string
          created_at: string
          crop_id: string
          duration: number
          farm_id: string
          frequency: number
          id: string
          is_active: boolean | null
          next_irrigation: string
        }
        Insert: {
          best_time: string
          created_at?: string
          crop_id: string
          duration: number
          farm_id: string
          frequency: number
          id?: string
          is_active?: boolean | null
          next_irrigation: string
        }
        Update: {
          best_time?: string
          created_at?: string
          crop_id?: string
          duration?: number
          farm_id?: string
          frequency?: number
          id?: string
          is_active?: boolean | null
          next_irrigation?: string
        }
        Relationships: [
          {
            foreignKeyName: "irrigation_schedules_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "irrigation_schedules_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      user_owns_farm: {
        Args: { _farm_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "farmer" | "extension_officer"
      irrigation_method: "drip" | "sprinkler" | "flood" | "manual"
      soil_type: "clay" | "sandy" | "loamy" | "silty"
      water_requirement: "low" | "medium" | "high"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "farmer", "extension_officer"],
      irrigation_method: ["drip", "sprinkler", "flood", "manual"],
      soil_type: ["clay", "sandy", "loamy", "silty"],
      water_requirement: ["low", "medium", "high"],
    },
  },
} as const
