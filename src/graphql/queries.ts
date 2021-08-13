import type { User, Chat, Message } from "./fragments";
import { gql } from "@apollo/client";
import { USER_DETAILS, CHAT_DETAILS, MESSAGE_DETAILS } from "./fragments";

export type FindUserData = { findUser: User | null };
export type FindUserVariables = Record<string, never>;

export type FindUsersData = { findUsers: User[] };
export type FindUsersVariables = Record<string, never>;

export type FindChatsData = { findChats: (Chat & { messages: Message[] })[] };
export type FindChatsVariables = Record<string, never>;

export const FIND_USER = gql`
  query findUser {
    findUser {
      ...UserDetails
    }
  }
  ${USER_DETAILS}
`;

export const FIND_USERS = gql`
  query findUsers {
    findUsers {
      ...UserDetails
    }
  }
  ${USER_DETAILS}
`;

export const FIND_CHATS = gql`
  query findChats {
    findChats {
      ...ChatDetails
      messages {
        ...MessageDetails
      }
    }
  }
  ${CHAT_DETAILS}
  ${MESSAGE_DETAILS}
`;
