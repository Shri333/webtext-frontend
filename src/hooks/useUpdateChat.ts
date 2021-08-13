import type { ApolloCache } from "@apollo/client";
import type { User, Chat } from "../graphql/fragments";
import { gql } from "@apollo/client";
import { USER_DETAILS } from "../graphql/fragments";

type UpdateChat = <T>(cache: ApolloCache<T>, chat: Chat) => void;

function useUpdateChat(): UpdateChat {
  return <T>(cache: ApolloCache<T>, chat: Chat) => {
    cache.writeFragment<{ name: string; admin: User; users: User[] }>({
      id: `Chat:${chat.id}`,
      fragment: gql`
        fragment UpdateChatWrite on Chat {
          name
          admin {
            ...UserDetails
          }
          users {
            ...UserDetails
          }
        }
        ${USER_DETAILS}
      `,
      data: { name: chat.name, admin: chat.admin, users: chat.users },
      fragmentName: "UpdateChatWrite"
    });
  };
}

export default useUpdateChat;
