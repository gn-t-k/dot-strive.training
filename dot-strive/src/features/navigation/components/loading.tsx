import { Center, Spinner, Stack, Text } from "@/libs/chakra-ui";

import type { FC } from "react";

type Props = {
  description: string;
};
export const Loading: FC<Props> = (props) => {
  return (
    <Center>
      <Stack direction="column" align="center">
        <Spinner size="lg" />
        <Text>{props.description}</Text>
      </Stack>
    </Center>
  );
};
