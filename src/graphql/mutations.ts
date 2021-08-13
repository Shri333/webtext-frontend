import type { User, Chat, Message, FullChat } from "./fragments";
import { gql } from "@apollo/client";
import { USER_DETAILS, CHAT_DETAILS, MESSAGE_DETAILS } from "./fragments";

export type LoginData = { login: string };
export type LoginVariables = {
  username: string;
  password: string;
};

export type CreateUserData = { createUser: User };
export type CreateUserVariables = {
  username: string;
  password: string;
};

export type UpdateUserData = { updateUser: User };
export type UpdateUserVariables = {
  username: string;
  password: string;
};

export type DeleteUserData = { deleteUser: User };
export type DeleteUserVariables = Record<string, never>;

export type CreateChatData = { createChat: FullChat };
export type CreateChatVariables = { userIds: string[] };

export type LeaveChatData = { leaveChat: Chat };
export type LeaveChatVariables = { chatId: string };

export type RenameChatData = { renameChat: Chat };
export type RenameChatVariables = {
  chatId: string;
  name: string;
};

export type ChangeAdminData = { changeAdmin: Chat };
export type ChangeAdminVariables = {
  chatId: string;
  userId: string;
};

export type AddUsersData = { addUsers: Chat };
export type AddUsersVariables = {
  chatId: string;
  userIds: string[];
};

export type RemoveUsersData = { removeUsers: Chat };
export type RemoveUsersVariables = {
  chatId: string;
  userIds: string[];
};

export type DeleteChatData = { deleteChat: Chat };
export type DeleteChatVariables = { chatId: string };

export type CreateMessageData = { createMessage: Message };
export type CreateMessageVariables = {
  text: string;
  forwarded?: boolean;
  chatId: string;
  notification?: boolean;
  socketId?: string;
  messageId?: string;
};

export type UpdateMessageData = { updateMessage: Message };
export type UpdateMessageVariables = {
  messageId: string;
  text: string;
};

export type DeleteMessageData = { deleteMessage: Message };
export type DeleteMessageVariables = { messageId: string };

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;
export const CREATE_USER = gql`
  mutation createUser($username: String!, $password: String!) {
    createUser(username: $username, password: $password) {
      ...UserDetails
    }
  }
  ${USER_DETAILS}
`;

export const UPDATE_USER = gql`
  mutation updateUser($username: String!, $password: String!) {
    updateUser(username: $username, password: $password) {
      ...UserDetails
    }
  }
  ${USER_DETAILS}
`;

export const DELETE_USER = gql`
  mutation deleteUser {
    deleteUser {
      ...UserDetails
    }
  }
  ${USER_DETAILS}
`;

export const CREATE_CHAT = gql`
  mutation createChat($userIds: [ID!]!) {
    createChat(userIds: $userIds) {
      ...ChatDetails
      messages {
        ...MessageDetails
      }
    }
  }
  ${CHAT_DETAILS}
  ${MESSAGE_DETAILS}
`;

export const LEAVE_CHAT = gql`
  mutation leaveChat($chatId: ID!) {
    leaveChat(chatId: $chatId) {
      ...ChatDetails
    }
  }
  ${CHAT_DETAILS}
`;

export const RENAME_CHAT = gql`
  mutation renameChat($chatId: ID!, $name: String!) {
    renameChat(chatId: $chatId, name: $name) {
      ...ChatDetails
    }
  }
  ${CHAT_DETAILS}
`;

export const CHANGE_ADMIN = gql`
  mutation changeAdmin($chatId: ID!, $userId: ID!) {
    changeAdmin(chatId: $chatId, userId: $userId) {
      ...ChatDetails
    }
  }
  ${CHAT_DETAILS}
`;

export const ADD_USERS = gql`
  mutation addUsers($chatId: ID!, $userIds: [ID!]!) {
    addUsers(chatId: $chatId, userIds: $userIds) {
      ...ChatDetails
    }
  }
  ${CHAT_DETAILS}
`;

export const REMOVE_USERS = gql`
  mutation removeUsers($chatId: ID!, $userIds: [ID!]!) {
    removeUsers(chatId: $chatId, userIds: $userIds) {
      ...ChatDetails
    }
  }
  ${CHAT_DETAILS}
`;

export const DELETE_CHAT = gql`
  mutation deleteChat($chatId: ID!) {
    deleteChat(chatId: $chatId) {
      ...ChatDetails
    }
  }
  ${CHAT_DETAILS}
`;

export const CREATE_MESSAGE = gql`
  mutation createMessage(
    $text: String!
    $forwarded: Boolean
    $chatId: ID!
    $notification: Boolean
    $messageId: ID
  ) {
    createMessage(
      text: $text
      forwarded: $forwarded
      chatId: $chatId
      notification: $notification
      messageId: $messageId
    ) {
      ...MessageDetails
    }
  }
  ${MESSAGE_DETAILS}
`;

export const UPDATE_MESSAGE = gql`
  mutation updateMessage($messageId: ID!, $text: String!) {
    updateMessage(messageId: $messageId, text: $text) {
      ...MessageDetails
    }
  }
  ${MESSAGE_DETAILS}
`;

export const DELETE_MESSAGE = gql`
  mutation deleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId) {
      ...MessageDetails
    }
  }
  ${MESSAGE_DETAILS}
`;
