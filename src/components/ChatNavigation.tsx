import type { MutationFunctionOptions, FetchResult } from "@apollo/client";
import type { User, FullChat } from "../graphql/fragments";
import type { FindUsersData, FindUsersVariables } from "../graphql/queries";
import type {
  CreateMessageData,
  CreateMessageVariables,
  LeaveChatData,
  LeaveChatVariables,
  DeleteChatData,
  DeleteChatVariables
} from "../graphql/mutations";
import React, { useState, useEffect } from "react";
import useSocketEvent from "../hooks/useSocketEvent";
import useCreateUser from "../hooks/useCreateUser";
import useUpdateUser from "../hooks/useUpdateUser";
import useDeleteUser from "../hooks/useDeleteUser";
import useDeleteChat from "../hooks/useDeleteChat";
import useCreateMessage from "../hooks/useCreateMessage";
import Profile from "./Profile";
import CreateChat from "./CreateChat";
import ChatInfo from "./ChatInfo";
import RenameChat from "./RenameChat";
import ChangeAdmin from "./ChangeAdmin";
import AddUsers from "./AddUsers";
import RemoveUsers from "./RemoveUsers";
import {
  useToast,
  useDisclosure,
  Skeleton,
  Menu,
  MenuButton,
  IconButton,
  Icon,
  MenuList,
  MenuItem
} from "@chakra-ui/react";
import { GoKebabVertical } from "react-icons/go";
import { CgProfile, CgRename } from "react-icons/cg";
import { GrAdd, GrSubtract } from "react-icons/gr";
import { BsInfo, BsChevronLeft } from "react-icons/bs";
import { FiUsers, FiUserPlus, FiUserMinus } from "react-icons/fi";
import { useQuery, useMutation } from "@apollo/client";
import { socket } from "../socket";
import { FIND_USERS } from "../graphql/queries";
import { CREATE_MESSAGE, LEAVE_CHAT, DELETE_CHAT } from "../graphql/mutations";

type ChatNavigationProps = {
  user: User;
  chat: FullChat | null;
  chats: FullChat[];
  setChat: React.Dispatch<React.SetStateAction<FullChat | null>>;
  logout: () => void;
};

export type ChatActionProps = Pick<ChatNavigationProps, "user" | "logout"> & {
  chat: FullChat;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  createMessage: (
    options: MutationFunctionOptions<CreateMessageData, CreateMessageVariables>
  ) => Promise<FetchResult<CreateMessageData>>;
};

export function createText(action: string, users: User[], user: User): string {
  let text: string;
  switch (users.length) {
    case 1:
      text = `${user.username} ${action} ${users[0].username}`;
      break;
    case 2:
      text = `${user.username} ${action} ${users[0].username} and ${users[1].username}`;
      break;
    default:
      text = `${user.username} ${action} `;
      for (let i = 0; i < users.length; i++) {
        if (i === users.length - 1) text += `and ${users[i].username}`;
        else text += `${users[i].username}, `;
      }
      break;
  }
  return text;
}

function ChatNavigation(props: ChatNavigationProps): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const addNewUserToCache = useCreateUser();
  const updateUserInCache = useUpdateUser();
  const deleteUserFromCache = useDeleteUser(props.user, props.logout);
  const deleteChatFromCache = useDeleteChat();
  const addNewMessageToCache = useCreateMessage();
  const toast = useToast();
  const {
    isOpen: profileIsOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose
  } = useDisclosure();
  const {
    isOpen: createChatIsOpen,
    onOpen: onCreateChatOpen,
    onClose: onCreateChatClose
  } = useDisclosure();
  const {
    isOpen: chatInfoIsOpen,
    onOpen: onChatInfoOpen,
    onClose: onChatInfoClose
  } = useDisclosure();
  const {
    isOpen: renameChatIsOpen,
    onOpen: onRenameChatOpen,
    onClose: onRenameChatClose
  } = useDisclosure();
  const {
    isOpen: changeAdminIsOpen,
    onOpen: onChangeAdminOpen,
    onClose: onChangeAdminClose
  } = useDisclosure();
  const {
    isOpen: addUsersIsOpen,
    onOpen: onAddUsersOpen,
    onClose: onAddUsersClose
  } = useDisclosure();
  const {
    isOpen: removeUsersIsOpen,
    onOpen: onRemoveUsersOpen,
    onClose: onRemoveUsersClose
  } = useDisclosure();
  const { loading, data } = useQuery<FindUsersData, FindUsersVariables>(
    FIND_USERS,
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
  const [createMessage, { loading: createMessageLoading }] = useMutation<
    CreateMessageData,
    CreateMessageVariables
  >(CREATE_MESSAGE, {
    update(cache, result) {
      if (result.data)
        addNewMessageToCache<CreateMessageData>(
          cache,
          result.data.createMessage
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
  const [leaveChat] = useMutation<LeaveChatData, LeaveChatVariables>(
    LEAVE_CHAT,
    {
      update(cache, result) {
        if (result.data) {
          const { id, users } = result.data.leaveChat;
          const text = `${props.user.username} left the chat`;
          deleteChatFromCache<LeaveChatData>(cache, result.data.leaveChat);
          users.length &&
            createMessage({
              variables: {
                text,
                chatId: id,
                notification: true,
                socketId: socket.id
              }
            });
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
    }
  );
  const [deleteChat] = useMutation<DeleteChatData, DeleteChatVariables>(
    DELETE_CHAT,
    {
      update(cache, result) {
        if (result.data)
          deleteChatFromCache<DeleteChatData>(cache, result.data.deleteChat);
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
    }
  );
  useSocketEvent("USER_CREATED", addNewUserToCache, data);
  useSocketEvent("USER_UPDATED", updateUserInCache, data);
  useSocketEvent("USER_DELETED", deleteUserFromCache, data);

  useEffect(() => {
    if (data) setUsers(data.findUsers);
  }, [data]);

  const actionProps: Pick<
    ChatActionProps,
    "user" | "chat" | "loading" | "createMessage" | "logout"
  > = {
    user: props.user,
    chat: props.chat as FullChat,
    loading: createMessageLoading,
    createMessage,
    logout: props.logout
  };

  function handleLeaveChat() {
    leaveChat({ variables: { chatId: (props.chat as FullChat).id } });
  }

  function handleDeleteChat() {
    deleteChat({ variables: { chatId: (props.chat as FullChat).id } });
  }

  return (
    <Skeleton isLoaded={!loading}>
      {data && (
        <Menu>
          <MenuButton
            backgroundColor="teal"
            as={IconButton}
            icon={
              <Icon as={GoKebabVertical} color="white" transform="scale(1.2)" />
            }
            borderRadius="full"
            _hover={{ bg: "teal.500" }}
            _active={{ bg: "teal.500" }}
            _expanded={{ bg: "teal.500" }}
          />
          <MenuList>
            <MenuItem icon={<Icon as={CgProfile} />} onClick={onProfileOpen}>
              Profile
            </MenuItem>
            <MenuItem icon={<Icon as={GrAdd} />} onClick={onCreateChatOpen}>
              Create Chat
            </MenuItem>
            {props.chat && (
              <>
                <MenuItem
                  icon={<Icon as={BsInfo} transform="scale(1.5)" />}
                  onClick={onChatInfoOpen}
                >
                  Group Info
                </MenuItem>
                <MenuItem
                  icon={<Icon as={BsChevronLeft} />}
                  onClick={handleLeaveChat}
                >
                  Leave Chat
                </MenuItem>
                {props.user.id === props.chat.admin.id && (
                  <>
                    {props.chat.users.length > 1 && (
                      <>
                        <MenuItem
                          icon={<Icon as={CgRename} />}
                          onClick={onRenameChatOpen}
                        >
                          Rename Chat
                        </MenuItem>
                      </>
                    )}
                    <MenuItem
                      icon={<Icon as={FiUsers} />}
                      onClick={onChangeAdminOpen}
                    >
                      Change Admin
                    </MenuItem>
                    {users.filter(
                      u => !actionProps.chat.users.find(_u => _u.id === u.id)
                    ).length > 0 && (
                      <MenuItem
                        icon={<Icon as={FiUserPlus} />}
                        onClick={onAddUsersOpen}
                      >
                        Add Users
                      </MenuItem>
                    )}
                    {props.chat.users.length > 1 && (
                      <MenuItem
                        icon={<Icon as={FiUserMinus} />}
                        onClick={onRemoveUsersOpen}
                      >
                        Remove Users
                      </MenuItem>
                    )}
                    <MenuItem
                      icon={<Icon as={GrSubtract} />}
                      onClick={handleDeleteChat}
                    >
                      Delete Chat
                    </MenuItem>
                  </>
                )}
              </>
            )}
            {profileIsOpen && (
              <Profile
                user={props.user}
                isOpen={profileIsOpen}
                onClose={onProfileClose}
                logout={props.logout}
              />
            )}
            {createChatIsOpen && (
              <CreateChat
                user={props.user}
                users={users}
                chats={props.chats}
                isOpen={createChatIsOpen}
                onClose={onCreateChatClose}
                setChat={props.setChat}
                logout={props.logout}
              />
            )}
            {chatInfoIsOpen && (
              <ChatInfo
                chat={props.chat as FullChat}
                isOpen={chatInfoIsOpen}
                onClose={onChatInfoClose}
              />
            )}
            {renameChatIsOpen && (
              <RenameChat
                {...actionProps}
                isOpen={renameChatIsOpen}
                onClose={onRenameChatClose}
              />
            )}
            {changeAdminIsOpen && (
              <ChangeAdmin
                {...actionProps}
                isOpen={changeAdminIsOpen}
                onClose={onChangeAdminClose}
              />
            )}
            {addUsersIsOpen && (
              <AddUsers
                {...actionProps}
                users={users.filter(
                  u => !actionProps.chat.users.find(_u => _u.id === u.id)
                )}
                isOpen={addUsersIsOpen}
                onClose={onAddUsersClose}
              />
            )}
            {removeUsersIsOpen && (
              <RemoveUsers
                {...actionProps}
                isOpen={removeUsersIsOpen}
                onClose={onRemoveUsersClose}
              />
            )}
          </MenuList>
        </Menu>
      )}
    </Skeleton>
  );
}

export default ChatNavigation;
