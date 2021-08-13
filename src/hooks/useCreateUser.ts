import type { ApolloCache } from "@apollo/client";
import type { User } from "../graphql/fragments";
import type { FindUsersData, FindUsersVariables } from "../graphql/queries";
import { FIND_USERS } from "../graphql/queries";

type CreateUser = <T>(cache: ApolloCache<T>, user: User) => void;

function useCreateUser(): CreateUser {
  return <T>(cache: ApolloCache<T>, user: User) => {
    const { findUsers } = cache.readQuery({
      query: FIND_USERS
    }) as FindUsersData;
    cache.writeQuery<FindUsersData, FindUsersVariables>({
      query: FIND_USERS,
      data: { findUsers: [...findUsers, user] }
    });
  };
}

export default useCreateUser;
