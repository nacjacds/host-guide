export type Plan = "free" | "basic" | "pro";
export type HostTone = "friendly" | "formal";
export type BlockType =
  | "wifi"
  | "checkin"
  | "checkout"
  | "rules"
  | "parking"
  | "appliances"
  | "custom";
export type RecommendationCategory =
  | "restaurant"
  | "bar"
  | "supermarket"
  | "pharmacy"
  | "transport"
  | "activity";

export interface BotMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          plan: Plan;
          stripe_customer_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
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
          slug: string;
          cover_image_url: string | null;
          accent_color: string;
          host_tone: HostTone;
          language: string;
          whatsapp_number: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          name: string;
          address?: string | null;
          slug: string;
          cover_image_url?: string | null;
          accent_color?: string;
          host_tone?: HostTone;
          language?: string;
          whatsapp_number?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          name?: string;
          address?: string | null;
          slug?: string;
          cover_image_url?: string | null;
          accent_color?: string;
          host_tone?: HostTone;
          language?: string;
          whatsapp_number?: string | null;
          is_published?: boolean;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type GuideBlock = Database["public"]["Tables"]["guide_blocks"]["Row"];
export type Recommendation = Database["public"]["Tables"]["recommendations"]["Row"];
export type BotConversation = Database["public"]["Tables"]["bot_conversations"]["Row"];
