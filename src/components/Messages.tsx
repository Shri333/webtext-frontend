import type { ListItemProps } from "@chakra-ui/react";
import type { User, Message, FullChat } from "../graphql/fragments";
import type {
  CreateMessageData,
  CreateMessageVariables
} from "../graphql/mutations";
import React, { useState } from "react";
import useCreateMessage from "../hooks/useCreateMessage";
import {
  useToast,
  List,
  Box,
  ListItem,
  Text,
  Icon,
  Flex,
  Input,
  IconButton
} from "@chakra-ui/react";
import { RiShareForwardFill } from "react-icons/ri";
import { IoMdClose, IoMdSend } from "react-icons/io";
import { useMutation } from "@apollo/client";
import { CREATE_MESSAGE } from "../graphql/mutations";

type MessagesProps = {
  user: User;
  chat: FullChat;
  message: Message | null;
  reply: Message | null;
  inputRef: React.RefObject<HTMLInputElement>;
  listRef: React.RefObject<HTMLUListElement>;
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  setReply: React.Dispatch<React.SetStateAction<Message | null>>;
  logout: () => void;
};

function Messages(props: MessagesProps): JSX.Element {
  const [text, setText] = useState<string>("");
  const addNewMessageToCache = useCreateMessage(props.listRef);
  const toast = useToast();
  const [createMessage] = useMutation<
    CreateMessageData,
    CreateMessageVariables
  >(CREATE_MESSAGE, {
    optimisticResponse: {
      createMessage: {
        id: "TEMPORARY_MESSAGE_ID",
        text,
        time: new Date().toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true
        }),
        forwarded: false,
        chatId: props.chat.id,
        user: { ...props.user, __typename: "User" } as User,
        reply: props.reply
          ? {
              id: props.reply.id,
              text: props.reply.text,
              user: { ...props.reply.user, __typename: "User" } as User
            }
          : null,
        __typename: "Message"
      } as Message
    },
    update(cache, result) {
      if (result.data) {
        addNewMessageToCache<CreateMessageData>(
          cache,
          result.data.createMessage
        );
        props.setReply(null);
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
    if (text.length > 150) {
      toast({
        title: "Text must be less than 150 characters",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } else {
      let variables: CreateMessageVariables;
      if (props.reply)
        variables = { text, chatId: props.chat.id, messageId: props.reply.id };
      else variables = { text, chatId: props.chat.id };
      createMessage({ variables });
      setText("");
    }
  }

  return (
    <>
      <Box flex="1" />
      <List
        display="flex"
        flexDirection="column-reverse"
        overflow="scroll"
        ref={props.listRef}
      >
        {props.chat.messages.map((m, i) => {
          if (!m.user)
            return (
              <ListItem
                key={m.id}
                width="fit-content"
                maxWidth="20vw"
                color="gray.700"
                backgroundColor="blue.100"
                marginTop={
                  i === props.chat.messages.length - 1 ? "10px" : "0px"
                }
                marginBottom={i === 0 ? "10px" : "5px"}
                marginLeft="auto"
                marginRight="auto"
                padding="5px 15px"
                borderRadius="3xl"
                textAlign="center"
              >
                <Text fontSize="sm">{m.text}</Text>
              </ListItem>
            );
          const messageProps: ListItemProps = {
            width: "fit-content",
            maxWidth: "40vw",
            color: "black",
            backgroundColor:
              m.user.id === props.user.id ? "teal.100" : "gray.100",
            marginBottom: i === 0 ? "10px" : "5px",
            marginRight: m.user.id === props.user.id ? "10px" : "auto",
            marginLeft: m.user.id === props.user.id ? "auto" : "10px",
            padding: "5px 10px",
            borderRadius: "2xl",
            boxShadow:
              props.message && props.message.id === m.id ? "inner" : "base",
            onClick: () => props.setMessage(m)
          };
          if (m.forwarded)
            return (
              <ListItem {...messageProps} key={m.id}>
                {props.chat.users.length > 1 && m.user.id !== props.user.id && (
                  <Text marginBottom="-2px" fontSize="sm" fontWeight="bold">
                    {m.user.username}
                  </Text>
                )}
                <Flex marginBottom="-2px" alignItems="center">
                  <Icon
                    marginRight="5px"
                    color="gray.500"
                    as={RiShareForwardFill}
                  />
                  <Text color="gray.500" fontSize="xs" fontStyle="italic">
                    forwarded
                  </Text>
                </Flex>
                <Text fontSize="sm">{m.text}</Text>
                <Flex>
                  <Box flex="1" />
                  <Text fontSize="xx-small" color="gray">
                    {m.time}
                  </Text>
                </Flex>
              </ListItem>
            );
          if (m.reply)
            return (
              <ListItem {...messageProps} key={m.id}>
                {props.chat.users.length > 1 && m.user.id !== props.user.id && (
                  <Text marginBottom="-5px" fontSize="sm" fontWeight="bold">
                    {m.user.username}
                  </Text>
                )}
                <Box
                  marginTop={
                    props.chat.users.length > 1 && m.user.id !== props.user.id
                      ? "8px"
                      : "5px"
                  }
                  marginBottom="3px"
                  backgroundColor={
                    m.user.id === props.user.id ? "teal.50" : "gray.50"
                  }
                  padding="5px 10px"
                  borderLeft="6px solid teal"
                  borderRadius="md"
                >
                  <Text marginBottom="-5px" fontSize="sm" fontWeight="bold">
                    {m.reply.user.username}
                  </Text>
                  <Text fontSize="sm">{m.reply.text}</Text>
                </Box>
                <Text fontSize="sm">{m.text}</Text>
                <Flex>
                  <Box flex="1" />
                  <Text fontSize="xx-small" color="gray">
                    {m.time}
                  </Text>
                </Flex>
              </ListItem>
            );
          return (
            <ListItem {...messageProps} key={m.id}>
              {props.chat.users.length > 1 && m.user.id !== props.user.id && (
                <Text marginBottom="-5px" fontSize="sm" fontWeight="bold">
                  {m.user.username}
                </Text>
              )}
              <Text fontSize="sm">{m.text}</Text>
              <Flex>
                <Box flex="1" />
                <Text fontSize="xx-small" color="gray">
                  {m.time}
                </Text>
              </Flex>
            </ListItem>
          );
        })}
      </List>
      <form
        style={{ display: "flex", flexDirection: "column" }}
        onSubmit={handleSubmit}
      >
        {props.reply && (
          <Flex
            backgroundColor="gray.100"
            padding="10px 10px 0px 10px"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              flex="1"
              backgroundColor="gray.50"
              padding="5px 10px"
              borderLeft="6px solid teal"
              borderRadius="md"
            >
              <Text marginBottom="-5px" fontSize="sm" fontWeight="bold">
                {(props.reply.user as User).username}
              </Text>
              <Text fontSize="sm">{props.reply.text}</Text>
            </Box>
            <IconButton
              type="button"
              marginLeft="10px"
              icon={<Icon as={IoMdClose} transform="scale(1.3)" />}
              aria-label="cancel"
              onClick={() => props.setReply(null)}
            />
          </Flex>
        )}
        <Box backgroundColor="gray.100" padding="10px">
          <Flex>
            <Input
              backgroundColor="white"
              type="text"
              placeholder="Send Message"
              value={text}
              onChange={event => setText(event.target.value)}
              ref={props.inputRef}
            />
            <IconButton
              type="submit"
              marginLeft="10px"
              colorScheme="teal"
              aria-label="send"
              icon={<Icon as={IoMdSend} />}
            />
          </Flex>
        </Box>
      </form>
    </>
  );
}

export default Messages;
