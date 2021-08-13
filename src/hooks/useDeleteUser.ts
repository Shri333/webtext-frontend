import type { ApolloCache } from "@apollo/client";
import type { User } from "../graphql/fragments";
import type { FindUsersData, FindUsersVariables } from "../graphql/queries";
import { FIND_USERS } from "../graphql/queries";

type DeleteUser = <T>(cache: ApolloCache<T>, user: User) => void;

function useDeleteUser(currentUser: User, logout: () => void): DeleteUser {
  return <T>(cache: ApolloCache<T>, user: User) => {
    if (currentUser.id === user.id) logout();
    else {
      const { findUsers } = cache.readQuery({
        query: FIND_USERS
      }) as FindUsersData;
      cache.evict({ id: `User:${user.id}` });
      cache.writeQuery<FindUsersData, FindUsersVariables>({
        query: FIND_USERS,
        data: { findUsers: findUsers.filter(u => u.id !== user.id) }
      });
      cache.gc();
    }
  };
}

export default useDeleteUser;
