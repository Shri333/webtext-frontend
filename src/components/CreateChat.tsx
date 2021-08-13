import type { User, FullChat } from "../graphql/fragments";
import type { CreateChatData, CreateChatVariables } from "../graphql/mutations";
import React, { useState } from "react";
import UsersModal from "./UsersModal";
import useCreateChat from "../hooks/useCreateChat";
import { useToast } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { CREATE_CHAT } from "../graphql/mutations";

type CreateChatProps = {
  user: User;
  users: User[];
  chats: FullChat[];
  isOpen: boolean;
  onClose: () => void;
  setChat: React.Dispatch<React.SetStateAction<FullChat | null>>;
  logout: () => void;
};

function CreateChat(props: CreateChatProps): JSX.Element {
  const [_users, _setUsers] = useState<User[]>([]);
  const addNewChatToCache = useCreateChat();
  const toast = useToast();
  const [createChat, { loading }] = useMutation<
    CreateChatData,
    CreateChatVariables
  >(CREATE_CHAT, {
    update(cache, result) {
      if (result.data) {
        addNewChatToCache<CreateChatData>(cache, result.data.createChat);
        props.setChat(result.data.createChat);
        props.onClose();
        toast({
          title: "Chat created",
          status: "success",
          duration: 3000,
          isClosable: true
        });
      }
    },
    onError(error) {
      if (error.message === "Not logged in") {
        props.logout();
        toast({
          title: "Token expired. Please log back in",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      } else if (error.message === "Chat already exists") {
        const chat = props.chats.find(c => {
          const everyone = [c.admin.id, ...c.users.map(u => u.id)].sort();
          const _everyone = [props.user.id, ..._users.map(u => u.id)].sort();
          if (everyone.length !== _everyone.length) return false;
          for (let i = 0; i < everyone.length; i++)
            if (everyone[i] !== _everyone[i]) return false;
          return true;
        }) as FullChat;
        props.onClose();
        props.setChat(chat);
      } else
        toast({
          title: error.message,
          status: "error",
          duration: 3000,
          isClosable: true
        });
    }
  });

  function executeCreateChat() {
    createChat({ variables: { userIds: _users.map(u => u.id) } });
  }

  return (
    <UsersModal
      users={props.users}
      _users={_users}
      action="Create Chat"
      isOpen={props.isOpen}
      loading={loading}
      onClose={props.onClose}
      _setUsers={_setUsers}
      executeMutation={executeCreateChat}
    />
  );
}

export default CreateChat;
