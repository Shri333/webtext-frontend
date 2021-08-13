import type { ApolloCache } from "@apollo/client";
import type { Chat, Message } from "../graphql/fragments";
import React from "react";
import { gql } from "@apollo/client";
import { CHAT_DETAILS, MESSAGE_DETAILS } from "../graphql/fragments";

type CreateMessage = <T>(cache: ApolloCache<T>, message: Message) => void;

function useCreateMessage(
  listRef?: React.RefObject<HTMLUListElement>
): CreateMessage {
  return <T>(cache: ApolloCache<T>, message: Message) => {
    const chat = cache.readFragment({
      id: `Chat:${message.chatId}`,
      fragment: gql`
        fragment CreateMessageRead on Chat {
          ...ChatDetails
          messages {
            ...MessageDetails
          }
        }
        ${CHAT_DETAILS}
      `,
      fragmentName: "CreateMessageRead"
    }) as Chat & { messages: Message[] };
    if (!chat.messages.find(m => m.id === message.id)) {
      cache.writeFragment<{ message: Message; messages: Message[] }>({
        id: `Chat:${chat.id}`,
        fragment: gql`
          fragment CreateMessageWrite on Chat {
            message {
              ...MessageDetails
            }
            messages {
              ...MessageDetails
            }
          }
          ${MESSAGE_DETAILS}
        `,
        data: { message, messages: [message, ...chat.messages] },
        fragmentName: "CreateMessageWrite"
      });
    }
    if (listRef && listRef.current)
      listRef.current.scrollTop =
        listRef.current.scrollHeight - listRef.current.clientHeight;
  };
}

export default useCreateMessage;
