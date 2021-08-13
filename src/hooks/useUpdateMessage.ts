import type { ApolloCache } from "@apollo/client";
import type { Message } from "../graphql/fragments";
import { gql } from "@apollo/client";

type UpdateMessage = <T>(cache: ApolloCache<T>, message: Message) => void;

function useUpdateMessage(): UpdateMessage {
  return <T>(cache: ApolloCache<T>, message: Message) => {
    cache.writeFragment<{ text: string }>({
      id: `Message:${message.id}`,
      fragment: gql`
        fragment UpdateMessageWrite on Message {
          text
        }
      `,
      data: { text: message.text }
    });
  };
}

export default useUpdateMessage;
