export type LearningMode = "Explorer" | "Learner" | "Technical";

export type Database = {
  public: {
    Tables: {
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