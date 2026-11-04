import {
  BadgeCheck, Boxes, Copy, CupSoda, Droplets, Eraser, Eye, Flame, Gem, Gift, GlassWater, Hand, Handshake,
  IndianRupee, Layers, LayoutGrid, Link as LinkIcon, MessageSquareText, MessagesSquare, Package, Palette, PenTool,
  Ruler, Scissors, Shapes, ShieldCheck, Shirt, SlidersHorizontal, Sparkles, Sun, Tag, Target, Thermometer, Timer,
  Type, UtensilsCrossed, Waves, CircleCheck, type LucideIcon,
} from 'lucide-react';

/** Curated icon set referenced by name from content (DESIGN-SYSTEM §7). */
const icons: Record<string, LucideIcon> = {
  BadgeCheck, Boxes, Copy, CupSoda, Droplets, Eraser, Eye, Flame, Gem, Gift, GlassWater, Hand, Handshake,
  IndianRupee, Layers, LayoutGrid, Link: LinkIcon, MessageSquareText, MessagesSquare, Package, Palette, PenTool,
  Ruler, Scissors, Shapes, ShieldCheck, Shirt, SlidersHorizontal, Sparkles, Sun, Tag, Target, Thermometer, Timer,
  Type, UtensilsCrossed, Waves,
};

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? CircleCheck;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}

export const ICON_NAMES = Object.keys(icons).sort();
