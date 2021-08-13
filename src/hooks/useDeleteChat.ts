import type { ApolloCache } from "@apollo/client";
import type { Chat } from "../graphql/fragments";
import type { FindChatsData, FindChatsVariables } from "../graphql/queries";
import { FIND_CHATS } from "../graphql/queries";

type DeleteChat = <T>(cache: ApolloCache<T>, chat: Chat) => void;

function useDeleteChat(): DeleteChat {
  return <T>(cache: ApolloCache<T>, chat: Chat) => {
    const { findChats } = cache.readQuery({
      query: FIND_CHATS
    }) as FindChatsData;
    if (findChats.find(c => c.id === chat.id)) {
      cache.evict({ id: `Chat:${chat.id}` });
      cache.writeQuery<FindChatsData, FindChatsVariables>({
        query: FIND_CHATS,
        data: { findChats: findChats.filter(c => c.id !== chat.id) }
      });
      cache.gc();
    }
  };
}

export default useDeleteChat;
