import type { ChatActionProps } from "./ChatNavigation";
import type {
  ChangeAdminData,
  ChangeAdminVariables
} from "../graphql/mutations";
import React, { useState } from "react";
import {
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Select,
  Button,
  ModalFooter
} from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { socket } from "../socket";
import { CHANGE_ADMIN } from "../graphql/mutations";

type ChangeAdminProps = ChatActionProps;

function ChangeAdmin(props: ChangeAdminProps): JSX.Element {
  const [userId, setUserId] = useState<string>(props.chat.users[0].id);
  const toast = useToast();
  const [changeAdmin, { loading }] = useMutation<
    ChangeAdminData,
    ChangeAdminVariables
  >(CHANGE_ADMIN, {
    update(_, result) {
      if (result.data) {
        const { id, admin } = result.data.changeAdmin;
        const text = `${props.user.username} changed the admin to ${admin.username}`;
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
      }
    }
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    changeAdmin({ variables: { chatId: props.chat.id, userId: userId } });
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="teal">Change Admin</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form style={{ display: "flex" }} onSubmit={handleSubmit}>
            <Select
              flex="1"
              value={userId}
              onChange={event => setUserId(event.target.value)}
            >
              {props.chat.users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </Select>
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={loading || props.loading}
              loadingText="Loading..."
            >
              Change Admin
            </Button>
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default ChangeAdmin;
