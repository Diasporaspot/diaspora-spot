export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      mailerlite_member_syncs: {
        Row: {
          attempts: number;
          created_at: string;
          desired_in_members_group: boolean;
          email: string;
          full_name: string;
          last_attempt_at: string | null;
          last_error: string | null;
          mailerlite_subscriber_id: string | null;
          mailerlite_subscriber_status: string | null;
          marketing_opt_in: boolean;
          next_attempt_at: string;
          phone_number: string | null;
          sms_marketing_opt_in: boolean;
          sms_marketing_opt_in_at: string | null;
          status: Database['public']['Enums']['mailerlite_sync_status'];
          synced_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      member_email_consent_events: {
        Row: {
          id: number;
          occurred_at: string;
          opted_in: boolean;
          source: string;
          user_id: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      member_sms_consent_events: {
        Row: {
          id: number;
          occurred_at: string;
          opted_in: boolean;
          phone_number: string;
          source: string;
          user_id: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      memberships: {
        Row: {
          created_at: string;
          ended_at: string | null;
          started_at: string;
          status: Database['public']['Enums']['membership_status'];
          tier: string;
          updated_at: string;
          user_id: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      membership_subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan_key: string;
          provider: string;
          provider_customer_id: string;
          provider_subscription_id: string;
          status: Database['public']['Enums']['membership_subscription_status'];
          updated_at: string;
          user_id: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string;
          id: string;
          marketing_opt_in: boolean;
          marketing_opt_in_at: string | null;
          marketing_opt_out_at: string | null;
          phone_number: string | null;
          sms_marketing_opt_in: boolean;
          sms_marketing_opt_in_at: string | null;
          sms_marketing_opt_out_at: string | null;
          updated_at: string;
        };
        Insert: never;
        Update: {
          avatar_url?: string | null;
          full_name?: string;
          marketing_opt_in?: boolean;
          phone_number?: string | null;
          sms_marketing_opt_in?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_active_member: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      has_active_membership_subscription: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      mailerlite_sync_status: 'pending' | 'processing' | 'synced' | 'failed';
      membership_status: 'active' | 'suspended' | 'revoked';
      membership_subscription_status:
        | 'incomplete'
        | 'trialing'
        | 'active'
        | 'past_due'
        | 'paused'
        | 'canceled'
        | 'unpaid'
        | 'expired';
    };
    CompositeTypes: Record<string, never>;
  };
};
