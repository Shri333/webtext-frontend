import type { Message, FullChat } from "../graphql/fragments";
import React from "react";
import { List, ListItem, Flex, Heading, Text } from "@chakra-ui/react";

type ChatProps = {
  width: number;
  chat: FullChat;
  chats: FullChat[];
  setChat: React.Dispatch<React.SetStateAction<FullChat | null>>;
  onClose?: () => void
};

function Chats(props: ChatProps): JSX.Element {
  function handleClick(chat: FullChat) {
    props.setChat(chat);
    props.onClose && props.onClose();
  }

  return (
    <List flex="1" overflow="scroll">
      {props.chats.map(c => {
        const message = c.message as Message;
        return (
          <ListItem
            key={c.id}
            padding="7%"
            borderBottom="1px solid #CBD5E0"
            backgroundColor={props.chat.id === c.id ? "gray.100" : "white"}
            _hover={{ backgroundColor: "gray.100" }}
            onClick={() => handleClick(c)}
          >
            <Flex alignItems="center">
              <Heading flex="1" color="teal" fontSize="lg">
                {c.name}
              </Heading>
              <Text marginLeft="2px">{message.time}</Text>
            </Flex>
            <Text
              marginTop="2px"
              maxWidth={`${0.2 * props.width}px`}
              color="gray.500"
              isTruncated
            >
              {message.text}
            </Text>
          </ListItem>
        );
      })}
    </List>
  );
}

export default Chats;
