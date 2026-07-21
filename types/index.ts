export type Plan = "free" | "starter" | "pro" | "agency";
export type HostTone = "friendly" | "formal";
// What kind of destination this property is in — drives what Google Places
// search prioritizes and what Claude's curation prompt emphasizes for each
// recommendation category (see lib/google-places.ts, lib/claude.ts).
// Defaults to "urban" (see migration 20260721090000) so existing behavior
// is unchanged until a property is explicitly reclassified.
export type DestinationType = "beach" | "historic_city" | "nature" | "rural" | "urban";
export type AnalyticsEventType = "guide_opened" | "section_viewed" | "whatsapp_clicked";
export type SupportTicketType = "bug" | "feature_request" | "question";
export type SupportTicketStatus = "open" | "closed";
export type BlockType =
  | "wifi"
  | "checkin"
  | "checkout"
  | "rules"
  | "parking"
  | "appliances"
  | "custom"
  | "emergencias"
  | "pool"
  | "drinks";

export type PriceLevel = "€" | "€€" | "€€€";

export interface PlaceEntry {
  id: string;
  name: string;
  description: string;
  address: string;
  distance_meters: number | null;
  maps_url: string;
  google_place_id: string | null;
  cuisine_type?: string;
  price_level?: PriceLevel | null;
  images?: BlockImage[];
}
export type RecommendationCategory = "supermarket" | "pharmacy" | "transport";

// The 5 AI-curated local recommendation categories, backed by real Google
// Places data (see property_recommendations). "beaches" and "nature" are
// only ever populated when detected near the property.
export type PropertyRecommendationCategory =
  | "attractions"
  | "restaurants"
  | "nightlife"
  | "beaches"
  | "nature";

export type PropertyRecommendationSource = "ai_curated" | "manual" | "ai_curated_edited";

export type RegenerationTriggerType = "manual" | "scheduled";

export interface BotMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface BlockImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          plan: Plan;
          stripe_customer_id: string | null;
          dashboard_locale: "es" | "en" | "fr" | "it" | "pt";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          dashboard_locale?: "es" | "en" | "fr" | "it" | "pt";
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          dashboard_locale?: "es" | "en" | "fr" | "it" | "pt";
          created_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          host_id: string;
          name: string;
          address: string | null;
          lat: number | null;
          lng: number | null;
          slug: string;
          cover_image_url: string | null;
          accent_color: string;
          host_tone: HostTone;
          language: string;
          destination_type: DestinationType;
          whatsapp_number: string | null;
          welcome_message: string | null;
          airbnb_url: string | null;
          bedrooms: number | null;
          bathrooms: number | null;
          max_guests: number | null;
          is_published: boolean;
          deleted_at: string | null;
          deleted_by_host_plan: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          name: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          slug: string;
          cover_image_url?: string | null;
          accent_color?: string;
          host_tone?: HostTone;
          language?: string;
          destination_type?: DestinationType;
          whatsapp_number?: string | null;
          welcome_message?: string | null;
          airbnb_url?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          max_guests?: number | null;
          is_published?: boolean;
          deleted_at?: string | null;
          deleted_by_host_plan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          name?: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          slug?: string;
          cover_image_url?: string | null;
          accent_color?: string;
          host_tone?: HostTone;
          language?: string;
          destination_type?: DestinationType;
          whatsapp_number?: string | null;
          welcome_message?: string | null;
          airbnb_url?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          max_guests?: number | null;
          is_published?: boolean;
          deleted_at?: string | null;
          deleted_by_host_plan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guide_blocks: {
        Row: {
          id: string;
          property_id: string;
          type: BlockType;
          title: string | null;
          icon: string | null;
          content: Record<string, unknown>;
          images: BlockImage[];
          order_index: number;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          type: BlockType;
          title?: string | null;
          icon?: string | null;
          content: Record<string, unknown>;
          images?: BlockImage[];
          order_index?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          type?: BlockType;
          title?: string | null;
          icon?: string | null;
          content?: Record<string, unknown>;
          images?: BlockImage[];
          order_index?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      recommendations: {
        Row: {
          id: string;
          property_id: string;
          category: RecommendationCategory;
          name: string;
          description: string | null;
          address: string | null;
          google_place_id: string | null;
          rating: number | null;
          distance_meters: number | null;
          maps_url: string | null;
          is_ai_generated: boolean;
          is_visible: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          category: RecommendationCategory;
          name: string;
          description?: string | null;
          address?: string | null;
          google_place_id?: string | null;
          rating?: number | null;
          distance_meters?: number | null;
          maps_url?: string | null;
          is_ai_generated?: boolean;
          is_visible?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          category?: RecommendationCategory;
          name?: string;
          description?: string | null;
          address?: string | null;
          google_place_id?: string | null;
          rating?: number | null;
          distance_meters?: number | null;
          maps_url?: string | null;
          is_ai_generated?: boolean;
          is_visible?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      property_recommendations: {
        Row: {
          id: string;
          property_id: string;
          category: PropertyRecommendationCategory;
          place_id: string | null;
          name: string;
          description: string | null;
          description_overrides: Record<string, string>;
          address: string | null;
          lat: number | null;
          lng: number | null;
          distance_meters: number | null;
          distance_walking_minutes: number | null;
          maps_url: string | null;
          rating: number | null;
          photo_url: string | null;
          photo_urls: string[];
          source: PropertyRecommendationSource;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          category: PropertyRecommendationCategory;
          place_id?: string | null;
          name: string;
          description?: string | null;
          description_overrides?: Record<string, string>;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          distance_meters?: number | null;
          distance_walking_minutes?: number | null;
          maps_url?: string | null;
          rating?: number | null;
          photo_url?: string | null;
          photo_urls?: string[];
          source?: PropertyRecommendationSource;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          category?: PropertyRecommendationCategory;
          place_id?: string | null;
          name?: string;
          description?: string | null;
          description_overrides?: Record<string, string>;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          distance_meters?: number | null;
          distance_walking_minutes?: number | null;
          maps_url?: string | null;
          rating?: number | null;
          photo_url?: string | null;
          photo_urls?: string[];
          source?: PropertyRecommendationSource;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      property_recommendation_meta: {
        Row: {
          property_id: string;
          last_generated_at: string | null;
          categories_detected: PropertyRecommendationCategory[];
        };
        Insert: {
          property_id: string;
          last_generated_at?: string | null;
          categories_detected?: PropertyRecommendationCategory[];
        };
        Update: {
          property_id?: string;
          last_generated_at?: string | null;
          categories_detected?: PropertyRecommendationCategory[];
        };
        Relationships: [];
      };
      recommendation_regeneration_usage: {
        Row: {
          id: string;
          host_id: string;
          property_id: string;
          category: PropertyRecommendationCategory | null;
          trigger_type: RegenerationTriggerType;
          triggered_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          property_id: string;
          category?: PropertyRecommendationCategory | null;
          trigger_type?: RegenerationTriggerType;
          triggered_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          property_id?: string;
          category?: PropertyRecommendationCategory | null;
          trigger_type?: RegenerationTriggerType;
          triggered_at?: string;
        };
        Relationships: [];
      };
      free_ai_generation_usage: {
        Row: {
          id: string;
          email: string;
          category: PropertyRecommendationCategory;
          used_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          category: PropertyRecommendationCategory;
          used_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          category?: PropertyRecommendationCategory;
          used_at?: string;
        };
        Relationships: [];
      };
      bot_conversations: {
        Row: {
          id: string;
          property_id: string;
          guest_phone: string;
          messages: BotMessage[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          guest_phone: string;
          messages?: BotMessage[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          guest_phone?: string;
          messages?: BotMessage[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guest_guide_links: {
        Row: {
          id: string;
          property_id: string;
          guest_name: string | null;
          checkin_date: string;
          checkout_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          guest_name?: string | null;
          checkin_date: string;
          checkout_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          guest_name?: string | null;
          checkin_date?: string;
          checkout_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      translations_cache: {
        Row: {
          id: string;
          source_text_hash: string;
          source_lang: string;
          target_lang: string;
          translated_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_text_hash: string;
          source_lang?: string;
          target_lang: string;
          translated_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_text_hash?: string;
          source_lang?: string;
          target_lang?: string;
          translated_text?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      content_translations: {
        Row: {
          id: string;
          property_id: string | null;
          block_type: string;
          block_id: string | null;
          source_locale: string;
          target_locale: string;
          source_hash: string;
          translated_content: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          block_type: string;
          block_id?: string | null;
          source_locale: string;
          target_locale: string;
          source_hash: string;
          translated_content: unknown;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          block_type?: string;
          block_id?: string | null;
          source_locale?: string;
          target_locale?: string;
          source_hash?: string;
          translated_content?: unknown;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          property_id: string;
          event_type: AnalyticsEventType;
          section: string | null;
          country: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          event_type: AnalyticsEventType;
          section?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          event_type?: AnalyticsEventType;
          section?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          type: SupportTicketType;
          subject: string;
          description: string;
          screenshot_url: string | null;
          status: SupportTicketStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: SupportTicketType;
          subject: string;
          description: string;
          screenshot_url?: string | null;
          status?: SupportTicketStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: SupportTicketType;
          subject?: string;
          description?: string;
          screenshot_url?: string | null;
          status?: SupportTicketStatus;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_content_translation: {
        Args: {
          p_property_id: string;
          p_block_type: string;
          p_block_id: string | null;
          p_source_locale: string;
          p_target_locale: string;
          p_source_hash: string;
          p_translated_content: Record<string, unknown> | string;
        };
        Returns: unknown;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type GuideBlock = Database["public"]["Tables"]["guide_blocks"]["Row"];
export type Recommendation = Database["public"]["Tables"]["recommendations"]["Row"];
export type PropertyRecommendation = Database["public"]["Tables"]["property_recommendations"]["Row"];
export type GuestGuideLink = Database["public"]["Tables"]["guest_guide_links"]["Row"];
export type PropertyRecommendationMeta = Database["public"]["Tables"]["property_recommendation_meta"]["Row"];
export type RecommendationRegenerationUsage = Database["public"]["Tables"]["recommendation_regeneration_usage"]["Row"];
export type BotConversation = Database["public"]["Tables"]["bot_conversations"]["Row"];
export type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];
export type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"];
