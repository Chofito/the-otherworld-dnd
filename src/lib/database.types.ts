export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  public: {
    Tables: {
      campaigns: {
        Row: {
          allow_duplicate_classes: boolean;
          allow_duplicate_races: boolean;
          created_at: string;
          description: string;
          dm_id: string;
          id: string;
          max_level: number;
          max_players: number;
          name: string;
          public_slug: string;
          rules: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          allow_duplicate_classes?: boolean;
          allow_duplicate_races?: boolean;
          created_at?: string;
          description: string;
          dm_id: string;
          id?: string;
          max_level?: number;
          max_players?: number;
          name: string;
          public_slug: string;
          rules?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          allow_duplicate_classes?: boolean;
          allow_duplicate_races?: boolean;
          created_at?: string;
          description?: string;
          dm_id?: string;
          id?: string;
          max_level?: number;
          max_players?: number;
          name?: string;
          public_slug?: string;
          rules?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      characters: {
        Row: {
          biography: string;
          campaign_id: string;
          character_name: string;
          class: string;
          class_id: string | null;
          contribution: string;
          created_at: string;
          email: string;
          id: string;
          image: string;
          invite_id: string;
          race: string;
          race_id: string | null;
          updated_at: string;
        };
        Insert: {
          biography?: string;
          campaign_id: string;
          character_name: string;
          class: string;
          class_id?: string | null;
          contribution: string;
          created_at?: string;
          email: string;
          id?: string;
          image: string;
          invite_id: string;
          race: string;
          race_id?: string | null;
          updated_at?: string;
        };
        Update: {
          biography?: string;
          campaign_id?: string;
          character_name?: string;
          class?: string;
          class_id?: string | null;
          contribution?: string;
          created_at?: string;
          email?: string;
          id?: string;
          image?: string;
          invite_id?: string;
          race?: string;
          race_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'characters_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'characters_class_id_fkey';
            columns: ['class_id'];
            isOneToOne: false;
            referencedRelation: 'classes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'characters_invite_id_fkey';
            columns: ['invite_id'];
            isOneToOne: true;
            referencedRelation: 'invites';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'characters_race_id_fkey';
            columns: ['race_id'];
            isOneToOne: false;
            referencedRelation: 'races';
            referencedColumns: ['id'];
          },
        ];
      };
      classes: {
        Row: {
          created_at: string;
          description: string | null;
          dm_id: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          dm_id: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          dm_id?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      invites: {
        Row: {
          campaign_id: string;
          completed_at: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          campaign_id: string;
          completed_at?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          campaign_id?: string;
          completed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invites_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          bio: string;
          created_at: string;
          display_name: string;
          fictional_name: string;
          id: string;
          image: string;
          updated_at: string;
        };
        Insert: {
          bio?: string;
          created_at?: string;
          display_name: string;
          fictional_name?: string;
          id: string;
          image: string;
          updated_at?: string;
        };
        Update: {
          bio?: string;
          created_at?: string;
          display_name?: string;
          fictional_name?: string;
          id?: string;
          image?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      races: {
        Row: {
          created_at: string;
          description: string | null;
          dm_id: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          dm_id: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          dm_id?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      fetch_campaign_page: { Args: { p_slug: string }; Returns: Json };
      fetch_invite_page: { Args: { p_slug: string }; Returns: Json };
      is_campaign_owner: { Args: { p_campaign_id: string }; Returns: boolean };
      submit_invite_character: {
        Args: {
          p_biography: string;
          p_character_name: string;
          p_class_id: string;
          p_contribution: string;
          p_email: string;
          p_image: string;
          p_race_id: string;
          p_slug: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type CampaignStatus = 'open' | 'ongoing' | 'completed';
export type InviteStatus = 'pending' | 'completed' | 'expired' | 'revoked';
