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
  Wine,
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
  drinks: Wine,
};
