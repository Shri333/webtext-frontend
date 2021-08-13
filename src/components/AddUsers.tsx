import type { ChatActionProps } from "./ChatNavigation";
import type { User } from "../graphql/fragments";
import type { AddUsersData, AddUsersVariables } from "../graphql/mutations";
import React, { useState } from "react";
import UsersModal from "./UsersModal";
import { useToast } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { socket } from "../socket";
import { createText } from "./ChatNavigation";
import { ADD_USERS } from "../graphql/mutations";

type AddUsersProps = ChatActionProps & { users: User[] };

function AddUsers(props: AddUsersProps): JSX.Element {
  const [_users, _setUsers] = useState<User[]>([]);
  const toast = useToast();
  const [addUsers, { loading }] = useMutation<AddUsersData, AddUsersVariables>(
    ADD_USERS,
    {
      update(_, result) {
        if (result.data) {
          const { id, users } = result.data.addUsers;
          const addedUsers = users.filter(u =>
            _users.map(u => u.id).includes(u.id)
          );
          const text = createText("added", addedUsers, props.user);
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
    }
  );

  function executeAddUsers() {
    addUsers({
      variables: { chatId: props.chat.id, userIds: _users.map(u => u.id) }
    });
  }

  return (
    <UsersModal
      users={props.users}
      _users={_users}
      action="Add Users"
      isOpen={props.isOpen}
      loading={loading || props.loading}
      onClose={props.onClose}
      _setUsers={_setUsers}
      executeMutation={executeAddUsers}
    />
  );
}

export default AddUsers;
