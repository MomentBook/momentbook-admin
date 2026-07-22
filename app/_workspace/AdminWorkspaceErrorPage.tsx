import { VStack } from "@astryxdesign/core/VStack";
import { Text } from "@astryxdesign/core/Text";

export function AdminWorkspaceErrorPage({
  message,
  statusCode,
}: {
  message: string;
  statusCode: number;
}) {
  return (
    <VStack gap={3} hAlign="center" vAlign="center" padding={4}>
      <Text type="body" size="sm" color="secondary">
        The moderation workspace is temporarily unavailable.
      </Text>
      <Text type="supporting" size="xsm" color="secondary">
        Status {statusCode}. Please try again in a moment.
      </Text>
      <Text type="supporting" size="2xs" color="secondary">
        {message}
      </Text>
    </VStack>
  );
}
