/** A workspace page whose API call failed, shown inside the shell. */
export function WorkspaceError({
  heading,
  message,
  statusCode,
}: {
  heading?: string;
  message: string;
  statusCode: number;
}) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-2 py-16 text-center">
      <h1 className="text-base font-medium">
        {heading ?? "The moderation workspace is temporarily unavailable."}
      </h1>
      <p className="text-sm text-muted-foreground">
        Status {statusCode}. Please try again in a moment.
      </p>
      <p className="break-words text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
