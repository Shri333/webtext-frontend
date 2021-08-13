import type { User, FullChat, Message } from "../graphql/fragments";
import type { FindChatsData, FindChatsVariables } from "../graphql/queries";
import React, { useState, useRef, useCallback, useEffect } from "react";
import useSocketEvent from "../hooks/useSocketEvent";
import useCreateChat from "../hooks/useCreateChat";
import useUpdateChat from "../hooks/useUpdateChat";
import useDeleteChat from "../hooks/useDeleteChat";
import useCreateMessage from "../hooks/useCreateMessage";
import useUpdateMessage from "../hooks/useUpdateMessage";
import useDeleteMessage from "../hooks/useDeleteMessage";
import ChatNavigation from "./ChatNavigation";
import MessageNavigation from "./MessageNavigation";
import Chats from "./Chats";
import Messages from "./Messages";
import {
  useToast,
  useMediaQuery,
  useDisclosure,
  Flex,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Box,
  Grid,
  GridItem,
  Heading,
  Skeleton,
  IconButton,
  Icon,
  Text
} from "@chakra-ui/react";
import { BiArrowBack } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { useQuery } from "@apollo/client";
import { FIND_CHATS } from "../graphql/queries";

export type MainProps = {
  user: User;
  logout: () => void;
};

function Main(props: MainProps): JSX.Element {
  const [height, setHeight] = useState<number>(window.innerHeight);
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [chat, setChat] = useState<FullChat | null>(null);
  const [chats, setChats] = useState<FullChat[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [reply, setReply] = useState<Message | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const addNewChatToCache = useCreateChat();
  const updateChatInCache = useUpdateChat();
  const deleteChatFromCache = useDeleteChat();
  const addNewMessageToCache = useCreateMessage(listRef);
  const updateMessageInCache = useUpdateMessage();
  const deleteMessageFromCache = useDeleteMessage();
  const toast = useToast();
  const [mobile] = useMediaQuery("(max-width: 650px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { loading, data } = useQuery<FindChatsData, FindChatsVariables>(
    FIND_CHATS,
    {
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
    }
  );
  useSocketEvent("CHAT_CREATED", addNewChatToCache, data);
  useSocketEvent("CHAT_UPDATED", updateChatInCache, data);
  useSocketEvent("CHAT_DELETED", deleteChatFromCache, data);
  useSocketEvent("MESSAGE_CREATED", addNewMessageToCache, data);
  useSocketEvent("MESSAGE_UPDATED", updateMessageInCache, data);
  useSocketEvent("MESSAGE_DELETED", deleteMessageFromCache, data);

  const resize = useCallback(() => {
    setHeight(window.innerHeight);
    setWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  useEffect(() => {
    if (data) {
      if (!data.findChats.length) setChats([]);
      else
        setChats(
          data.findChats.map(chat => {
            if (!chat.name) {
              const everyone = [chat.admin, ...chat.users].filter(
                u => u.id !== props.user.id
              );
              if (everyone.length === 1)
                return { ...chat, name: `${everyone[0].username}` };
              else if (everyone.length === 2)
                return {
                  ...chat,
                  name: `${everyone[0].username} and ${everyone[1].username}`
                };
              else
                return {
                  ...chat,
                  name: `${everyone[0].username} and ${
                    everyone.length - 1
                  } others`
                };
            }
            return chat;
          })
        );
    }
  }, [data, props.user]);

  useEffect(() => {
    setChat(chat => {
      const _chat = chat && chats.find(c => c.id === chat.id);
      if (!_chat) return chats.length ? chats[0] : null;
      return _chat;
    });
  }, [chats]);

  if (mobile)
    return (
      <Flex height={`${height}px`} flexDirection="column">
        <Flex flex="1" backgroundColor="teal" alignItems="center">
          {data && (
            <Skeleton
              display="flex"
              flex="1"
              alignItems="center"
              isLoaded={!loading}
            >
              {chat && message ? (
                <>
                  <Box flex="1">
                    <IconButton
                      marginLeft="10px"
                      icon={<Icon as={BiArrowBack} transform="scale(1.5)" />}
                      aria-label="back"
                      color="white"
                      variant="ghost"
                      _hover={{ backgroundColor: "teal.500" }}
                      onClick={() => setMessage(null)}
                    />
                  </Box>
                  <MessageNavigation
                    user={props.user}
                    chat={chat}
                    chats={chats}
                    message={message}
                    inputRef={inputRef}
                    setChat={setChat}
                    setMessage={setMessage}
                    setReply={setReply}
                    logout={props.logout}
                  />
                </>
              ) : (
                <>
                  <IconButton
                    margin="0px 10px"
                    icon={<Icon as={GiHamburgerMenu} transform="scale(1.3)" />}
                    aria-label="chats"
                    color="white"
                    variant="ghost"
                    _hover={{ backgroundColor: "teal.500" }}
                    onClick={onOpen}
                    ref={buttonRef}
                  />
                  <Heading flex="1" fontSize="25px" color="white">
                    WebText
                  </Heading>
                </>
              )}
              <ChatNavigation
                user={props.user}
                chat={chat}
                chats={chats}
                setChat={setChat}
                logout={props.logout}
              />
              {isOpen && (
                <Drawer
                  isOpen={isOpen}
                  placement="left"
                  onClose={onClose}
                  finalFocusRef={buttonRef}
                >
                  <DrawerOverlay />
                  <DrawerContent>
                    <DrawerHeader>Chats</DrawerHeader>
                    <DrawerCloseButton />
                    <DrawerBody>
                      {chat ? (
                        <Chats
                          width={width}
                          chat={chat}
                          chats={chats}
                          setChat={setChat}
                          onClose={onClose}
                        />
                      ) : (
                        <Text margin="20px">No chats found</Text>
                      )}
                    </DrawerBody>
                    <DrawerFooter />
                  </DrawerContent>
                </Drawer>
              )}
            </Skeleton>
          )}
        </Flex>
        <Flex flex="12" overflow="auto">
          <Skeleton
            flex="1"
            display="flex"
            flexDirection="column"
            isLoaded={!loading}
          >
            {data && chat && (
              <Messages
                user={props.user}
                chat={chat}
                message={message}
                reply={reply}
                inputRef={inputRef}
                listRef={listRef}
                setMessage={setMessage}
                setReply={setReply}
                logout={props.logout}
              />
            )}
            {data && !chats.length && (
              <Flex flex="1" justifyContent="center" alignItems="center">
                <Text>No chats found</Text>
              </Flex>
            )}
          </Skeleton>
        </Flex>
      </Flex>
    );

  return (
    <Box
      height={`${height}px`}
      width={`${width}px`}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Grid
        height={`${0.85 * height}px`}
        width={`${0.85 * width}px`}
        templateRows="repeat(20, 1fr)"
        templateColumns="repeat(20, 1fr)"
        boxShadow="2xl"
        borderRadius="md"
      >
        <GridItem
          rowStart={1}
          rowEnd={3}
          colStart={1}
          colEnd={6}
          backgroundColor="teal"
          borderTopLeftRadius="md"
          display="flex"
          alignItems="center"
        >
          <Heading marginLeft="20px" fontSize="25px" color="white">
            WebText
          </Heading>
        </GridItem>
        <GridItem
          rowStart={1}
          rowEnd={3}
          colStart={6}
          colEnd={21}
          backgroundColor="teal"
          borderTopRightRadius="md"
          display="flex"
          alignItems="center"
        >
          <Box flex="1">
            {message && (
              <IconButton
                marginLeft="5px"
                icon={<Icon as={BiArrowBack} transform="scale(1.5)" />}
                aria-label="back"
                color="white"
                variant="ghost"
                _hover={{ backgroundColor: "teal" }}
                onClick={() => setMessage(null)}
              />
            )}
          </Box>
          <Skeleton
            marginRight="5px"
            display="flex"
            alignItems="center"
            isLoaded={!loading}
          >
            {data && (
              <>
                {chat && message && (
                  <MessageNavigation
                    user={props.user}
                    chat={chat}
                    chats={chats}
                    message={message}
                    inputRef={inputRef}
                    setChat={setChat}
                    setMessage={setMessage}
                    setReply={setReply}
                    logout={props.logout}
                  />
                )}
                <ChatNavigation
                  user={props.user}
                  chat={chat}
                  chats={chats}
                  setChat={setChat}
                  logout={props.logout}
                />
              </>
            )}
          </Skeleton>
        </GridItem>
        <GridItem
          rowStart={3}
          rowEnd={21}
          colStart={1}
          colEnd={6}
          backgroundColor="white"
          borderBottomLeftRadius="md"
          borderRight="1px solid #CBD5E0"
          display="flex"
        >
          <Skeleton flex="1" display="flex" isLoaded={!loading}>
            {data && (
              <>
                {chat ? (
                  <Chats
                    width={width}
                    chat={chat}
                    chats={chats}
                    setChat={setChat}
                  />
                ) : (
                  <Text margin="20px">No chats found</Text>
                )}
              </>
            )}
          </Skeleton>
        </GridItem>
        <GridItem
          rowStart={3}
          rowEnd={21}
          colStart={6}
          colEnd={21}
          backgroundColor="white"
          borderBottomRightRadius="md"
          display="flex"
        >
          <Skeleton
            flex="1"
            display="flex"
            flexDirection="column"
            isLoaded={!loading}
          >
            {data && chat && (
              <Messages
                user={props.user}
                chat={chat}
                message={message}
                reply={reply}
                inputRef={inputRef}
                listRef={listRef}
                setMessage={setMessage}
                setReply={setReply}
                logout={props.logout}
              />
            )}
          </Skeleton>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default Main;
