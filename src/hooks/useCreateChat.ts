import type { ApolloCache } from "@apollo/client";
import type { FullChat } from "../graphql/fragments";
import type { FindChatsData, FindChatsVariables } from "../graphql/queries";
import { FIND_CHATS } from "../graphql/queries";

type CreateChat = <T>(cache: ApolloCache<T>, chat: FullChat) => void;

function useCreateChat(): CreateChat {
  return <T>(cache: ApolloCache<T>, chat: FullChat) => {
    const { findChats } = cache.readQuery({
      query: FIND_CHATS
    }) as FindChatsData;
    if (!findChats.find(c => c.id === chat.id))
      cache.writeQuery<FindChatsData, FindChatsVariables>({
        query: FIND_CHATS,
        data: { findChats: [...findChats, chat] }
      });
  };
}

export default useCreateChat;
