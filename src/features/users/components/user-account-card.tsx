import type { ReactNode } from "react";
import {
  DateValue,
  Field,
  Placeholder,
  SectionNote,
  TextValue,
} from "@/components/detail-parts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminUserDetailDataDto, AdminUserProfileDto } from "@/lib/api/types";
import { humanizeEnum } from "@/entities/user/model";

function erasureText(profile: AdminUserProfileDto): ReactNode {
  if (profile.erasedAt) {
    return (
      <>
        Erased <DateValue value={profile.erasedAt} />
      </>
    );
  }

  if (profile.erasureDueAt) {
    return (
      <>
        Due <DateValue value={profile.erasureDueAt} />
      </>
    );
  }

  return <Placeholder />;
}

/** Who the account is: contact, provider, preferences and consents. */
export function UserAccountCard({ detail }: { detail: AdminUserDetailDataDto }) {
  const { profile, consents } = detail;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Contact email">
            <TextValue value={profile.email} />
          </Field>
          <Field label="Email verified">
            {profile.emailVerifiedAt ? (
              <DateValue value={profile.emailVerifiedAt} />
            ) : (
              <span className="text-muted-foreground">Not verified</span>
            )}
          </Field>
          <Field label="Provider email">
            <TextValue value={profile.providerEmail} />
          </Field>
          <Field label="Provider">
            {profile.provider ? (
              <span className="capitalize">{profile.provider.toLowerCase()}</span>
            ) : (
              <Placeholder />
            )}
          </Field>
          <Field label="Language">
            <TextValue value={profile.preferredLanguage} />
          </Field>
          <Field label="Notifications">{profile.notificationEnabled ? "On" : "Off"}</Field>
          <Field label="Push token">{profile.hasPushToken ? "Registered" : "None"}</Field>
          <Field label="Erasure">{erasureText(profile)}</Field>
          <Field label="Updated">
            <DateValue value={profile.updatedAt} />
          </Field>
        </dl>
        {profile.biography ? (
          <Field label="Biography">
            <span className="whitespace-pre-wrap break-words">{profile.biography}</span>
          </Field>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Consents</h3>
          {consents.length > 0 ? (
            <ul className="flex flex-col gap-1 text-sm">
              {consents.map((consent) => (
                <li
                  key={`${consent.consentType}-${consent.createdAt}`}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="break-all">
                    {humanizeEnum(consent.consentType)}
                    {consent.isRequired ? null : (
                      <span className="text-xs text-muted-foreground"> (optional)</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={consent.agreement ? "outline" : "secondary"}>
                      {consent.agreement ? "Agreed" : "Declined"}
                    </Badge>
                    <DateValue value={consent.createdAt} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <SectionNote>No consents recorded.</SectionNote>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
