import type { LucideIcon, LucideProps } from "lucide-react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Expand,
  Heart,
  Languages,
  Menu,
  MessageCircle,
  MoonStar,
  Search,
  SearchX,
  Share2,
  SunMedium,
  X,
} from "lucide-react";

type AppIconProps = Omit<LucideProps, "ref"> & {
  icon: LucideIcon;
  decorative?: boolean;
};

export function AppIcon({
  icon: Icon,
  decorative = true,
  strokeWidth = 1.9,
  absoluteStrokeWidth = true,
  ...props
}: AppIconProps) {
  return (
    <Icon
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={absoluteStrokeWidth}
      aria-hidden={decorative || undefined}
      focusable={decorative ? "false" : undefined}
      {...props}
    />
  );
}

export const CloseActionIcon = X;
export const MenuActionIcon = Menu;
export const DownloadActionIcon = Download;
export const CopyActionIcon = Copy;
export const ShareActionIcon = Share2;
export const LikeActionIcon = Heart;
export const CommentActionIcon = MessageCircle;
export const SearchActionIcon = Search;
export const SearchEmptyStateIcon = SearchX;
export const ExpandMediaIcon = Expand;
export const LanguageActionIcon = Languages;
export const DisclosureIcon = ChevronDown;
export const ForwardNavigationIcon = ChevronRight;
export const SelectedItemIcon = Check;
export const ThemeLightIcon = SunMedium;
export const ThemeDarkIcon = MoonStar;
export const CollectionStatIcon = BookOpen;
