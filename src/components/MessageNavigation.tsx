import type { User, Message, FullChat } from "../graphql/fragments";
import type {
  DeleteMessageData,
  DeleteMessageVariables
} from "../graphql/mutations";
import React from "react";
import useDeleteMessage from "../hooks/useDeleteMessage";
import ForwardMessage from "./ForwardMessage";
import UpdateMessage from "./UpdateMessage";
import {
  useToast,
  useDisclosure,
  HStack,
  Tooltip,
  IconButton,
  Icon
} from "@chakra-ui/react";
import { RiReplyFill, RiShareForwardFill } from "react-icons/ri";
import { AiFillEdit } from "react-icons/ai";
import { MdRemoveCircle } from "react-icons/md";
import { useMutation } from "@apollo/client";
import { DELETE_MESSAGE } from "../graphql/mutations";

type MessageNavigationProps = {
  user: User;
  chat: FullChat;
  chats: FullChat[];
  message: Message;
  inputRef: React.RefObject<HTMLInputElement>;
  setChat: React.Dispatch<React.SetStateAction<FullChat | null>>;
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  setReply: React.Dispatch<React.SetStateAction<Message | null>>;
  logout: () => void;
};

export type MessageActionProps = Pick<
  MessageNavigationProps,
  "message" | "setMessage" | "logout"
> & {
  isOpen: boolean;
  onClose: () => void;
};

function MessageNavigation(props: MessageNavigationProps): JSX.Element {
  const {
    isOpen: forwardIsOpen,
    onOpen: onForwardOpen,
    onClose: onForwardClose
  } = useDisclosure();
  const {
    isOpen: updateIsOpen,
    onOpen: onUpdateOpen,
    onClose: onUpdateClose
  } = useDisclosure();
  const deleteMessageFromCache = useDeleteMessage();
  const toast = useToast();
  const [deleteMessage] = useMutation<
    DeleteMessageData,
    DeleteMessageVariables
  >(DELETE_MESSAGE, {
    update(cache, result) {
      if (result.data)
        deleteMessageFromCache<DeleteMessageData>(
          cache,
          result.data.deleteMessage
        );
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
  const actionProps: Pick<
    MessageActionProps,
    "message" | "setMessage" | "logout"
  > = {
    message: props.message,
    setMessage: props.setMessage,
    logout: props.logout
  };

  function handleReply() {
    props.setReply(props.message);
    props.inputRef.current && props.inputRef.current.focus();
    props.setMessage(null);
  }

  function handleDelete() {
    deleteMessage({ variables: { messageId: props.message.id } });
    props.setMessage(null);
  }

  return (
    <HStack spacing={5} marginRight="5px">
      <Tooltip
        backgroundColor="white"
        color="black"
        label="reply to message"
        aria-label="reply"
      >
        <IconButton
          color="white"
          icon={<Icon as={RiReplyFill} transform="scale(1.5)" />}
          variant="ghost"
          aria-label="reply"
          _hover={{ backgroundColor: "teal.500" }}
          onClick={handleReply}
        />
      </Tooltip>
      {props.chats.length > 1 && (
        <Tooltip
          backgroundColor="white"
          color="black"
          label="forward message"
          aria-label="forward"
        >
          <IconButton
            color="white"
            icon={<Icon as={RiShareForwardFill} transform="scale(1.5)" />}
            variant="ghost"
            aria-label="forward"
            _hover={{ backgroundColor: "teal.500" }}
            onClick={onForwardOpen}
          />
        </Tooltip>
      )}
      {(props.message.user as User).id === props.user.id && (
        <>
          {!props.message.forwarded && (
            <Tooltip
              backgroundColor="white"
              color="black"
              label="update message"
              aria-label="update"
            >
              <IconButton
                color="white"
                icon={<Icon as={AiFillEdit} transform="scale(1.4)" />}
                variant="ghost"
                aria-label="update"
                _hover={{ backgroundColor: "teal.500" }}
                onClick={onUpdateOpen}
              />
            </Tooltip>
          )}
          <Tooltip
            backgroundColor="white"
            color="black"
            label="delete message"
            aria-label="delete"
          >
            <IconButton
              color="white"
              icon={<Icon as={MdRemoveCircle} transform="scale(1.4)" />}
              variant="ghost"
              aria-label="delete"
              _hover={{ backgroundColor: "teal.500" }}
              onClick={handleDelete}
            />
          </Tooltip>
        </>
      )}
      {updateIsOpen && (
        <UpdateMessage
          {...actionProps}
          isOpen={updateIsOpen}
          onClose={onUpdateClose}
        />
      )}
      {forwardIsOpen && (
        <ForwardMessage
          {...actionProps}
          chats={props.chats.filter(c => c.id !== props.chat.id)}
          isOpen={forwardIsOpen}
          onClose={onForwardClose}
          setChat={props.setChat}
        />
      )}
    </HStack>
  );
}

export default MessageNavigation;
