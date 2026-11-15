import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_STATUSES, type AdminReportDetailDataDto } from "@/lib/api/types";
import { getReportStatusLabel } from "@/entities/report/model";
import { updateAdminReportAction } from "@/features/reports/actions";

/** The report's status and the admin's note, saved together. */
export function ReportStatusForm({
  report,
  returnTo,
}: {
  report: AdminReportDetailDataDto;
  returnTo: string;
}) {
  return (
    <Card className="border-primary/40 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Moderation decision</CardTitle>
        <CardDescription>Update the report status and record administrator findings.</CardDescription>
      </CardHeader>
      <form action={updateAdminReportAction}>
        <CardContent className="flex flex-col gap-4">
          <input type="hidden" name="reportId" value={report.id} />
          <input type="hidden" name="returnTo" value={returnTo} />

          <FieldSet className="gap-2">
            <FieldLegend variant="label" className="text-xs uppercase tracking-wide text-muted-foreground">
              Resolution status
            </FieldLegend>
            <RadioGroup name="status" defaultValue={report.status} className="grid grid-cols-2 gap-2">
              {REPORT_STATUSES.map((status) => (
                <Label
                  key={status}
                  htmlFor={`report-status-${status}`}
                  className="flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-xs hover:bg-muted has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:text-primary"
                >
                  <RadioGroupItem id={`report-status-${status}`} value={status} />
                  {getReportStatusLabel(status)}
                </Label>
              ))}
            </RadioGroup>
          </FieldSet>

          <Field className="gap-2">
            <FieldLabel htmlFor="adminNote" className="text-xs uppercase tracking-wide text-muted-foreground">
              Admin note
            </FieldLabel>
            <Textarea
              id="adminNote"
              name="adminNote"
              defaultValue={report.adminNote || ""}
              placeholder="Enter moderation remarks or reason for decision..."
              rows={4}
              maxLength={1000}
              className="text-xs"
            />
            <FieldDescription className="text-xs">
              Max 1,000 characters. Blank or empty clears the current note.
            </FieldDescription>
          </Field>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <Button type="submit" className="w-full">
            Save decision
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
