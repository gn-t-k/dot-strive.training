"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider as OriginalChakraProvider } from "@chakra-ui/react";

import type { FC, PropsWithChildren } from "react";

export const ChakraUIProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <CacheProvider>
      <OriginalChakraProvider>{children}</OriginalChakraProvider>
    </CacheProvider>
  );
};
