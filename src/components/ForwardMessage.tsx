import type { MessageActionProps } from "./MessageNavigation";
import type { FullChat } from "../graphql/fragments";
import type {
  CreateMessageData,
  CreateMessageVariables
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
import useCreateMessage from "../hooks/useCreateMessage";
import { useMutation } from "@apollo/client";
import { CREATE_MESSAGE } from "../graphql/mutations";

type ForwardMessageProps = MessageActionProps & {
  chats: FullChat[];
  setChat: React.Dispatch<React.SetStateAction<FullChat | null>>;
};

function ForwardMessage(props: ForwardMessageProps): JSX.Element {
  const [chatId, setChatId] = useState<string>(props.chats[0].id);
  const toast = useToast();
  const addNewMessageToCache = useCreateMessage();
  const [createMessage, { loading }] = useMutation<
    CreateMessageData,
    CreateMessageVariables
  >(CREATE_MESSAGE, {
    update(cache, result) {
      if (result.data) {
        addNewMessageToCache<CreateMessageData>(
          cache,
          result.data.createMessage
        );
        props.onClose();
        props.setMessage(null);
        props.setChat(props.chats.find(c => c.id === chatId) as FullChat);
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
    createMessage({
      variables: { text: props.message.text, chatId, forwarded: true }
    });
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="teal">Forward Message</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form style={{ display: "flex" }} onSubmit={handleSubmit}>
            <Select
              flex="1"
              value={chatId}
              onChange={event => setChatId(event.target.value)}
            >
              {props.chats.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={loading}
              loadingText="Loading..."
            >
              Forward Message
            </Button>
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default ForwardMessage;
