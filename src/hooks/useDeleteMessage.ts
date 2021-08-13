import type { ApolloCache } from "@apollo/client";
import type { Chat, Message } from "../graphql/fragments";
import { gql } from "@apollo/client";
import { CHAT_DETAILS, MESSAGE_DETAILS } from "../graphql/fragments";

type DeleteMessage = <T>(cache: ApolloCache<T>, message: Message) => void;

function useDeleteMessage(): DeleteMessage {
  return <T>(cache: ApolloCache<T>, message: Message) => {
    const chat = cache.readFragment({
      id: `Chat:${message.chatId}`,
      fragment: gql`
        fragment DeleteMessageRead on Chat {
          ...ChatDetails
          messages {
            ...MessageDetails
          }
        }
        ${CHAT_DETAILS}
      `,
      fragmentName: "DeleteMessageRead"
    }) as Chat & { messages: Message[] };
    if (chat.messages.find(m => m.id === message.id)) {
      if ((chat.message as Message).id === message.id)
        cache.writeFragment<{ message: Message }>({
          id: `Chat:${chat.id}`,
          fragment: gql`
            fragment DeleteMessageWrite_ on Chat {
              message {
                ...MessageDetails
              }
            }
            ${MESSAGE_DETAILS}
          `,
          data: { message: chat.messages[1] },
          fragmentName: "DeleteMessageWrite_"
        });
      cache.evict({ id: `Message${message.id}` });
      cache.writeFragment<{ messages: Message[] }>({
        id: `Chat:${chat.id}`,
        fragment: gql`
          fragment DeleteMessageWrite on Chat {
            messages {
              ...MessageDetails
            }
          }
          ${MESSAGE_DETAILS}
        `,
        data: { messages: chat.messages.filter(m => m.id !== message.id) },
        fragmentName: "DeleteMessageWrite"
      });
      cache.gc();
    }
  };
}

export default useDeleteMessage;
