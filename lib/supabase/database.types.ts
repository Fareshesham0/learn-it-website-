export type LearningMode = "Explorer" | "Learner" | "Technical";

export type Database = {
  public: {
    Tables: {
      badges: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          slug?: string;
          title?: string;
          description?: string;
          icon?: string | null;
        };
        Relationships: [];
      };
      learning_paths: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          icon: string | null;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          slug?: string;
          title?: string;
          description?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_published?: boolean;
        };
        Relationships: [];
      };
      xp_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: "lesson_completed" | "final_mission_completed" | "path_completed";
          source_id: string | null;
          xp_amount: number;
          event_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: "lesson_completed" | "final_mission_completed" | "path_completed";
          source_id?: string | null;
          xp_amount: number;
          event_key: string;
          created_at?: string;
        };
        Update: {
          event_type?: "lesson_completed" | "final_mission_completed" | "path_completed";
          source_id?: string | null;
          xp_amount?: number;
          event_key?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          path_id: string;
          slug: string;
          title: string;
          summary: string | null;
          learning_mode: "All" | LearningMode;
          estimated_minutes: number | null;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          path_id: string;
          slug: string;
          title: string;
          summary?: string | null;
          learning_mode?: "All" | LearningMode;
          estimated_minutes?: number | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          path_id?: string;
          slug?: string;
          title?: string;
          summary?: string | null;
          learning_mode?: "All" | LearningMode;
          estimated_minutes?: number | null;
          sort_order?: number;
          is_published?: boolean;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          awarded_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          awarded_at?: string;
        };
        Update: {
          awarded_at?: string;
        };
        Relationships: [];
      };
      user_lesson_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          status: "not_started" | "in_progress" | "completed";
          started_at: string | null;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          status?: "not_started" | "in_progress" | "completed";
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          status?: "not_started" | "in_progress" | "completed";
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          learning_mode: LearningMode;
          created_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          learning_mode?: LearningMode;
          created_at?: string;
        };
        Update: {
          display_name?: string | null;
          learning_mode?: LearningMode;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
