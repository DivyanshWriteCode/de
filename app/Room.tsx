"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveMap } from "@liveblocks/client";
import { Loader } from "lucide-react";

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider publicApiKey={"pk_dev_FjzV-w2sl5qpPA0uVaxSmee9Uu6QYKgU_UdrJW3e8J5ZRdE9ZbsDWD1-IwD5f3nx"}>
      <RoomProvider id="my-room">
        <ClientSideSuspense fallback={<div><Loader /></div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}