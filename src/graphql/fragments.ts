import { gql } from "@apollo/client";

export type User = {
  id: string;
  username: string;
};

export type Chat = {
  id: string;
  name: string;
  admin: User;
  users: User[];
  message: Message | null;
};

export type Message = {
  id: string;
  text: string;
  time: string;
  forwarded: boolean;
  chatId: string;
  user: User | null;
  reply: {
    id: string;
    text: string;
    user: User;
  } | null;
};

export type FullChat = Chat & { messages: Message[] };

export const USER_DETAILS = gql`
  fragment UserDetails on User {
    id
    username
  }
`;

export const MESSAGE_DETAILS = gql`
  fragment MessageDetails on Message {
    id
    text
    time
    forwarded
    chatId
    user {
      ...UserDetails
    }
    reply {
      id
      text
      user {
        ...UserDetails
      }
    }
  }
  ${USER_DETAILS}
`;

export const CHAT_DETAILS = gql`
  fragment ChatDetails on Chat {
    id
    name
    admin {
      ...UserDetails
    }
    users {
      ...UserDetails
    }
    message {
      ...MessageDetails
    }
  }
  ${USER_DETAILS}
  ${MESSAGE_DETAILS}
`;
