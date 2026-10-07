export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      article_contents: {
        Row: {
          article_id: string
          body_json: Json | null
          full_pdf_path: string
          updated_at: string
        }
        Insert: {
          article_id: string
          body_json?: Json | null
          full_pdf_path: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          body_json?: Json | null
          full_pdf_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'article_contents_article_id_fkey'
            columns: ['article_id']
            isOneToOne: true
            referencedRelation: 'articles'
            referencedColumns: ['id']
          },
        ]
      }
      article_slug_history: {
        Row: {
          article_id: string
          created_at: string
          old_slug: string
        }
        Insert: {
          article_id: string
          created_at?: string
          old_slug: string
        }
        Update: {
          article_id?: string
          created_at?: string
          old_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: 'article_slug_history_article_id_fkey'
            columns: ['article_id']
            isOneToOne: false
            referencedRelation: 'articles'
            referencedColumns: ['id']
          },
        ]
      }
      articles: {
        Row: {
          content_type: Database['public']['Enums']['article_content_type']
          cover_path: string
          created_at: string
          id: string
          preview_json: Json | null
          preview_pdf_path: string | null
          published_at: string
          slug: string
          subtitle: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_type: Database['public']['Enums']['article_content_type']
          cover_path: string
          created_at?: string
          id?: string
          preview_json?: Json | null
          preview_pdf_path?: string | null
          published_at?: string
          slug: string
          subtitle?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: Database['public']['Enums']['article_content_type']
          cover_path?: string
          created_at?: string
          id?: string
          preview_json?: Json | null
          preview_pdf_path?: string | null
          published_at?: string
          slug?: string
          subtitle?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count: number
          key: string
          window_start: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          article_id: string | null
          article_title_snapshot: string
          consent_at: string
          created_at: string
          email: string
          id: string
          ip_hash: string
          marketing_opt_in: boolean
          name: string
          phone: string
          policy_version: string
          webhook_attempts: number
          webhook_last_error: string | null
          webhook_status: Database['public']['Enums']['webhook_status']
        }
        Insert: {
          article_id?: string | null
          article_title_snapshot: string
          consent_at: string
          created_at?: string
          email: string
          id?: string
          ip_hash: string
          marketing_opt_in?: boolean
          name: string
          phone: string
          policy_version: string
          webhook_attempts?: number
          webhook_last_error?: string | null
          webhook_status?: Database['public']['Enums']['webhook_status']
        }
        Update: {
          article_id?: string | null
          article_title_snapshot?: string
          consent_at?: string
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string
          marketing_opt_in?: boolean
          name?: string
          phone?: string
          policy_version?: string
          webhook_attempts?: number
          webhook_last_error?: string | null
          webhook_status?: Database['public']['Enums']['webhook_status']
        }
        Relationships: [
          {
            foreignKeyName: 'leads_article_id_fkey'
            columns: ['article_id']
            isOneToOne: false
            referencedRelation: 'articles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_article_content: {
        Args: { target_article_id: string }
        Returns: undefined
      }
      consume_rate_limit: {
        Args: { key: string; limit: number; window: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      save_article: {
        Args: {
          article_id: string
          body_json?: Json
          content_type: Database['public']['Enums']['article_content_type']
          cover_path: string
          full_pdf_path: string
          preview_json?: Json
          preview_pdf_path?: string
          published_at: string
          slug: string
          subtitle?: string
          summary?: string
          title: string
        }
        Returns: string
      }
    }
    Enums: {
      article_content_type: 'pdf' | 'rich_text'
      webhook_status: 'disabled' | 'pending' | 'sent' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      article_content_type: ['pdf', 'rich_text'],
      webhook_status: ['disabled', 'pending', 'sent', 'failed'],
    },
  },
} as const
