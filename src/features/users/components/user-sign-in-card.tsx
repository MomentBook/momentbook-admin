import { DateValue, Field, SectionNote, TextValue } from "@/components/detail-parts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminUserDetailDataDto } from "@/lib/api/types";
import { humanizeEnum } from "@/entities/user/model";

type SignInDetail = Pick<
  AdminUserDetailDataDto,
  "currentSession" | "signInMethods" | "deviceCredentials"
>;

function CurrentSession({ session }: { session: SignInDetail["currentSession"] }) {
  if (!session) {
    return <SectionNote>No active session.</SectionNote>;
  }

  return (
    <dl className="grid grid-cols-2 gap-3">
      {/* The session row is replaced on every sign-in and refresh. */}
      <Field label="Signed in or refreshed">
        <DateValue value={session.createdAt} withTime />
      </Field>
      <Field label="Expires">
        <DateValue value={session.expiresAt} withTime />
      </Field>
      <Field label="Platform">
        <TextValue value={session.platform} />
      </Field>
      <Field label="IP">
        <TextValue value={session.ip} />
      </Field>
      <div className="col-span-2">
        <Field label="User agent">
          <span className="break-all text-xs">{session.userAgent ?? "—"}</span>
        </Field>
      </div>
    </dl>
  );
}

function SignInMethods({ methods }: { methods: SignInDetail["signInMethods"] }) {
  if (methods.identities.length + methods.passkeys.length === 0) {
    return <SectionNote>None.</SectionNote>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {methods.identities.map((identity) => (
        <li key={`identity-${identity.provider}-${identity.createdAt}`} className="flex flex-col">
          <span>
            <span className="capitalize">{identity.provider.toLowerCase()}</span>
            {identity.email ? (
              <span className="break-all text-muted-foreground"> · {identity.email}</span>
            ) : null}
          </span>
          <span className="text-xs text-muted-foreground">
            Linked <DateValue value={identity.createdAt} /> · Last used{" "}
            <DateValue value={identity.lastUsedAt} />
          </span>
        </li>
      ))}
      {methods.passkeys.map((passkey, index) => (
        <li key={`passkey-${passkey.createdAt}-${index}`} className="flex flex-col">
          <span>
            Passkey · {passkey.deviceLabel || passkey.deviceType}
            {passkey.platform ? (
              <span className="text-muted-foreground"> ({passkey.platform})</span>
            ) : null}
          </span>
          <span className="text-xs text-muted-foreground">
            Added <DateValue value={passkey.createdAt} /> · Last used{" "}
            <DateValue value={passkey.lastUsedAt} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function DeviceCredentials({ credentials }: { credentials: SignInDetail["deviceCredentials"] }) {
  if (credentials.length === 0) {
    return <SectionNote>None.</SectionNote>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {credentials.map((credential, index) => (
        <li key={`credential-${credential.createdAt}-${index}`} className="flex flex-col">
          <span className="flex flex-wrap items-center gap-2">
            {credential.deviceLabel || credential.platform}
            <Badge variant="outline">{humanizeEnum(credential.attestationLevel)}</Badge>
            {credential.status === "REVOKED" ? <Badge variant="secondary">Revoked</Badge> : null}
          </span>
          <span className="text-xs text-muted-foreground">
            {[
              credential.platform,
              credential.osVersion,
              credential.appVersion ? `app ${credential.appVersion}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <span className="text-xs text-muted-foreground">
            Added <DateValue value={credential.createdAt} /> · Last used{" "}
            <DateValue value={credential.lastUsedAt} />
            {credential.revokedAt ? (
              <>
                {" "}
                · Revoked <DateValue value={credential.revokedAt} />
              </>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** How the account signs in: its session, linked methods and devices. */
export function UserSignInCard({ detail }: { detail: SignInDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sign-in &amp; devices</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Current session</h3>
          <CurrentSession session={detail.currentSession} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Sign-in methods</h3>
          <SignInMethods methods={detail.signInMethods} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Device credentials</h3>
          <DeviceCredentials credentials={detail.deviceCredentials} />
        </div>
      </CardContent>
    </Card>
  );
}
