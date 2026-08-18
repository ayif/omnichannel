import {
  CheckCircle2,
  Clock,
  CreditCard,
  Link2,
  Loader2,
  LogIn,
  RefreshCw,
  RotateCcw,
  Truck,
  Unlink,
  UserMinus,
  UserPen,
  UserPlus,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AUDIT_ACTION_LABEL,
  AuditAction,
  CHANNEL_LABEL,
  Channel,
  SyncStatus,
  TRANSACTION_STATUS_LABEL,
  TransactionStatus,
} from "@/lib/types";

const CHANNEL_DOT: Record<Channel, string> = {
  [Channel.TOKOPEDIA]: "bg-chan-tokopedia",
  [Channel.SHOPEE]: "bg-chan-shopee",
  [Channel.WEBSITE]: "bg-chan-website",
  [Channel.TIKTOKSHOP]: "bg-chan-tiktokshop",
};

export function ChannelDot({ channel, className }: { channel: Channel; className?: string }) {
  return <span className={cn("size-2 shrink-0 rounded-full", CHANNEL_DOT[channel], className)} />;
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <ChannelDot channel={channel} />
      {CHANNEL_LABEL[channel]}
    </Badge>
  );
}

const TRANSACTION_STATUS_STYLE: Record<
  TransactionStatus,
  { icon: React.ElementType; className: string }
> = {
  [TransactionStatus.PENDING]: { icon: Clock, className: "bg-status-warning/15 text-status-warning" },
  [TransactionStatus.PAID]: { icon: CreditCard, className: "bg-accent text-accent-foreground" },
  [TransactionStatus.SHIPPED]: { icon: Truck, className: "bg-accent text-accent-foreground" },
  [TransactionStatus.COMPLETED]: { icon: CheckCircle2, className: "bg-status-good/15 text-status-good" },
  [TransactionStatus.CANCELLED]: { icon: XCircle, className: "bg-status-critical/15 text-status-critical" },
  [TransactionStatus.REFUND]: { icon: RotateCcw, className: "bg-status-serious/15 text-status-serious" },
};

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { icon: Icon, className } = TRANSACTION_STATUS_STYLE[status];
  return (
    <Badge className={cn("gap-1 border-transparent font-normal", className)}>
      <Icon />
      {TRANSACTION_STATUS_LABEL[status]}
    </Badge>
  );
}

const SYNC_STATUS_STYLE: Record<
  SyncStatus,
  { icon: React.ElementType; className: string; label: string; spin?: boolean }
> = {
  [SyncStatus.SUCCESS]: { icon: CheckCircle2, className: "bg-status-good/15 text-status-good", label: "Berhasil" },
  [SyncStatus.FAILED]: { icon: XCircle, className: "bg-status-critical/15 text-status-critical", label: "Gagal" },
  [SyncStatus.RUNNING]: { icon: Loader2, className: "bg-status-warning/15 text-status-warning", label: "Berjalan", spin: true },
};

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const { icon: Icon, className, label, spin } = SYNC_STATUS_STYLE[status];
  return (
    <Badge className={cn("gap-1 border-transparent font-normal", className)}>
      <Icon className={cn(spin && "animate-spin")} />
      {label}
    </Badge>
  );
}

const AUDIT_ACTION_STYLE: Record<AuditAction, { icon: React.ElementType; className: string }> = {
  [AuditAction.LOGIN_SUCCESS]: { icon: LogIn, className: "bg-status-good/15 text-status-good" },
  [AuditAction.LOGIN_FAILED]: { icon: XCircle, className: "bg-status-critical/15 text-status-critical" },
  [AuditAction.CHANNEL_CONNECT]: { icon: Link2, className: "bg-accent text-accent-foreground" },
  [AuditAction.CHANNEL_DISCONNECT]: { icon: Unlink, className: "bg-status-warning/15 text-status-warning" },
  [AuditAction.SYNC_TRIGGER]: { icon: RefreshCw, className: "bg-accent text-accent-foreground" },
  [AuditAction.USER_CREATE]: { icon: UserPlus, className: "bg-status-good/15 text-status-good" },
  [AuditAction.USER_UPDATE]: { icon: UserPen, className: "bg-accent text-accent-foreground" },
  [AuditAction.USER_DELETE]: { icon: UserMinus, className: "bg-status-critical/15 text-status-critical" },
};

export function AuditActionBadge({ action }: { action: AuditAction }) {
  const { icon: Icon, className } = AUDIT_ACTION_STYLE[action];
  return (
    <Badge className={cn("gap-1 border-transparent font-normal", className)}>
      <Icon />
      {AUDIT_ACTION_LABEL[action]}
    </Badge>
  );
}
