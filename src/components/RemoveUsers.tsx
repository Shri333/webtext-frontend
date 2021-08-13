import type { ChatActionProps } from "./ChatNavigation";
import type { User } from "../graphql/fragments";
import type {
  RemoveUsersData,
  RemoveUsersVariables
} from "../graphql/mutations";
import React, { useState } from "react";
import UsersModal from "./UsersModal";
import useDeleteChat from "../hooks/useDeleteChat";
import { useToast } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { socket } from "../socket";
import { createText } from "./ChatNavigation";
import { REMOVE_USERS } from "../graphql/mutations";

type RemoveUsersProps = ChatActionProps;

function RemoveUsers(props: RemoveUsersProps): JSX.Element {
  const [_users, _setUsers] = useState<User[]>([]);
  const deleteChatFromCache = useDeleteChat();
  const toast = useToast();
  const [removeUsers, { loading }] = useMutation<
    RemoveUsersData,
    RemoveUsersVariables
  >(REMOVE_USERS, {
    update(cache, result) {
      if (result.data) {
        const { id, users } = result.data.removeUsers;
        if (!users.length) {
          deleteChatFromCache<RemoveUsersData>(cache, result.data.removeUsers);
          props.onClose();
        } else {
          const removedUsers = props.chat.users.filter(
            u => !users.map(u => u.id).includes(u.id)
          );
          const text = createText("removed", removedUsers, props.user);
          props.createMessage({
            variables: {
              text,
              chatId: id,
              notification: true,
              socketId: socket.id
            }
          });
          props.onClose();
        }
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
      } else
        toast({
          title: error.message,
          status: "error",
          duration: 3000,
          isClosable: true
        });
    }
  });

  function executeRemoveUsers() {
    removeUsers({
      variables: { chatId: props.chat.id, userIds: _users.map(u => u.id) }
    });
  }

  return (
    <UsersModal
      users={props.chat.users}
      _users={_users}
      action="Remove Users"
      isOpen={props.isOpen}
      loading={loading || props.loading}
      onClose={props.onClose}
      _setUsers={_setUsers}
      executeMutation={executeRemoveUsers}
    />
  );
}

export default RemoveUsers;
