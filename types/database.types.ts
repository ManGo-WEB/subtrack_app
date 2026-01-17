// Типы для базы данных Supabase
// Этот файл будет автоматически сгенерирован Supabase CLI
// Пока создаем базовую структуру

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      services_catalog: {
        Row: {
          id: number;
          name: string;
          logo_url: string | null;
          brand_color: string | null;
          default_currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          logo_url?: string | null;
          brand_color?: string | null;
          default_currency: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          logo_url?: string | null;
          brand_color?: string | null;
          default_currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          service_id: number | null;
          name: string;
          cost: number;
          currency: string;
          period: string;
          start_date: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_id?: number | null;
          name: string;
          cost: number;
          currency: string;
          period: string;
          start_date: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_id?: number | null;
          name?: string;
          cost?: number;
          currency?: string;
          period?: string;
          start_date?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      exchange_rates: {
        Row: {
          currency_code: string;
          rate_to_rub: number;
          updated_at: string;
        };
        Insert: {
          currency_code: string;
          rate_to_rub: number;
          updated_at?: string;
        };
        Update: {
          currency_code?: string;
          rate_to_rub?: number;
          updated_at?: string;
        };
      };
    };
  };
}
