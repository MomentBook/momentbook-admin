export function AdminWorkspaceErrorPage({
  heading,
  message,
  statusCode,
}: {
  heading?: string;
  message: string;
  statusCode: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-sm text-muted-foreground">
        {heading ?? "The moderation workspace is temporarily unavailable."}
      </p>
      <p className="text-xs text-muted-foreground">
        Status {statusCode}. Please try again in a moment.
      </p>
      <p className="text-[10px] text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
