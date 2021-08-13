import type { ApolloCache } from "@apollo/client";
import type { User, Chat, Message, FullChat } from "../graphql/fragments";
import type { FindChatsData, FindUsersData } from "../graphql/queries";
import { useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import { socket } from "../socket";

function isMessage(data: User | Chat | Message | FullChat): data is Message {
  return (data as Message).text !== undefined;
}

function isChat(data: User | Chat | Message | FullChat): data is Chat {
  return (
    (data as Chat).message !== undefined &&
    (data as FullChat).messages === undefined
  );
}

function isFullChat(data: User | Chat | Message | FullChat): data is FullChat {
  return (data as FullChat).messages !== undefined;
}

function toTimeString(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
}

function useSocketEvent<T extends User | Chat | Message | FullChat>(
  event: string,
  updateCache: <C>(cache: ApolloCache<C>, data: T) => void,
  queryData?: FindChatsData | FindUsersData
): void {
  const client = useApolloClient();

  useEffect(() => {
    if (!socket.hasListeners(event) && queryData)
      socket.on(event, (data: T) => {
        if (isMessage(data))
          updateCache(client.cache, {
            ...data,
            time: toTimeString(new Date(data.time))
          });
        else if (isChat(data))
          updateCache(client.cache, {
            ...data,
            message: data.message
              ? {
                  ...data.message,
                  time: toTimeString(new Date(data.message.time))
                }
              : null
          });
        else if (isFullChat(data))
          updateCache(client.cache, {
            ...data,
            message: {
              ...data.message,
              time: toTimeString(new Date((data.message as Message).time))
            },
            messages: data.messages.map(m => ({
              ...m,
              time: toTimeString(new Date(m.time))
            }))
          });
        else updateCache(client.cache, data);
      });
  }, [event, queryData, client.cache, updateCache]);
}

export default useSocketEvent;
