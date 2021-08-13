import type { ChatActionProps } from "./ChatNavigation";
import type { RenameChatData, RenameChatVariables } from "../graphql/mutations";
import React, { useState } from "react";
import {
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  Button,
  ModalFooter
} from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { socket } from "../socket";
import { RENAME_CHAT } from "../graphql/mutations";

type RenameChatProps = ChatActionProps;

function RenameChat(props: RenameChatProps): JSX.Element {
  const [name, setName] = useState<string>("");
  const toast = useToast();
  const [renameChat, { loading }] = useMutation<
    RenameChatData,
    RenameChatVariables
  >(RENAME_CHAT, {
    update(_, result) {
      if (result.data) {
        const { id, name } = result.data.renameChat;
        props.createMessage({
          variables: {
            text: `${props.user.username} renamed this chat to ${name}`,
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
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    renameChat({ variables: { chatId: props.chat.id, name } });
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="teal">Rename Chat</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form style={{ display: "flex" }} onSubmit={handleSubmit}>
            <Input
              flex="1"
              type="text"
              value={name}
              placeholder={props.chat.name}
              onChange={event => setName(event.target.value)}
            />
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={loading || props.loading}
              loadingText="Loading..."
            >
              Rename Chat
            </Button>
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default RenameChat;
