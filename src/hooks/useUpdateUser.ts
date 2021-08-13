import type { ApolloCache } from "@apollo/client";
import type { User } from "../graphql/fragments";
import { gql } from "@apollo/client";

type UpdateUser = <T>(cache: ApolloCache<T>, user: User) => void;

function useUpdateUser(): UpdateUser {
  return <T>(cache: ApolloCache<T>, user: User) => {
    cache.writeFragment<{ username: string }>({
      id: `User:${user.id}`,
      fragment: gql`
        fragment UpdateUserWrite on User {
          username
        }
      `,
      data: { username: user.username }
    });
  };
}

export default useUpdateUser;
