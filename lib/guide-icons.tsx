import {
  Wifi,
  KeyRound,
  DoorOpen,
  ScrollText,
  ParkingSquare,
  Plug,
  Waves,
  ShieldAlert,
  FileText,
  UtensilsCrossed,
  Wine,
  Music,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import type { BlockType } from "@/types";

export const BLOCK_ICONS: Record<BlockType, LucideIcon> = {
  wifi: Wifi,
  checkin: KeyRound,
  checkout: DoorOpen,
  rules: ScrollText,
  parking: ParkingSquare,
  appliances: Plug,
  pool: Waves,
  emergencias: ShieldAlert,
  custom: FileText,
  restaurants: UtensilsCrossed,
  drinks: Wine,
  nightlife: Music,
  attractions: Landmark,
};
