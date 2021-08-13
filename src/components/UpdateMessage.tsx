import type { MessageActionProps } from "./MessageNavigation";
import type {
  UpdateMessageData,
  UpdateMessageVariables
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
  Input,
  Button,
  ModalFooter
} from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { UPDATE_MESSAGE } from "../graphql/mutations";

type UpdateMessageProps = MessageActionProps;

function UpdateMessage(props: UpdateMessageProps): JSX.Element {
  const [text, setText] = useState<string>("");
  const toast = useToast();
  const [updateMessage, { loading }] = useMutation<
    UpdateMessageData,
    UpdateMessageVariables
  >(UPDATE_MESSAGE, {
    onCompleted() {
      props.onClose();
      props.setMessage(null);
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
    updateMessage({ variables: { messageId: props.message.id, text } });
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="teal">Update Message</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form style={{ display: "flex" }} onSubmit={handleSubmit}>
            <Input
              flex="1"
              type="text"
              value={text}
              placeholder={props.message.text}
              onChange={event => setText(event.target.value)}
            />
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={loading}
              loadingText="Loading..."
            >
              Update Message
            </Button>
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default UpdateMessage;
