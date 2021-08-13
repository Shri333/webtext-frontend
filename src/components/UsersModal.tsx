import type { ListItemProps } from "@chakra-ui/react";
import type { ChatActionProps } from "./ChatNavigation";
import type { User } from "../graphql/fragments";
import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Input,
  List,
  ListItem,
  Text,
  CloseButton,
  Button,
  ModalFooter
} from "@chakra-ui/react";

type UsersModalProps = Pick<
  ChatActionProps,
  "isOpen" | "loading" | "onClose"
> & {
  users: User[];
  _users: User[];
  action: "Create Chat" | "Add Users" | "Remove Users";
  _setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  executeMutation: () => void;
};

function UsersModal(props: UsersModalProps): JSX.Element {
  const [filter, setFilter] = useState<string>("");
  const [users, setUsers] = useState<User[]>(props.users);

  const compare = useCallback((a: User, b: User) => {
    if (a.id > b.id) return 1;
    else if (a.id < b.id) return -1;
    return 0;
  }, []);

  useEffect(() => {
    const copy = [...props.users].sort(compare);
    const everyone = [...props._users, ...users].sort(compare);
    let equal = true;
    if (copy.length !== everyone.length) equal = false;
    else
      for (let i = 0; i < copy.length; i++)
        if (copy[i].username !== everyone[i].username) equal = false;
    if (!equal) {
      for (const user of props.users) {
        const _user = everyone.find(u => u.id === user.id);
        if (!_user) setUsers(users.concat(user));
        else if (_user.username !== user.username) {
          if (props._users.find(u => u.id === _user.id))
            props._setUsers(
              props._users.map(u => (u.id === _user.id ? user : u))
            );
          else setUsers(users.map(u => (u.id === _user.id ? user : u)));
        }
      }
      if (everyone.length > props.users.length)
        for (const user of everyone)
          if (!props.users.find(u => u.id === user.id)) {
            if (props._users.find(u => u.id === user.id))
              props._setUsers(props._users.filter(u => u.id !== user.id));
            else setUsers(users.filter(u => u.id !== user.id));
          }
    }
  }, [props, users, compare]);

  const _usersHeight = `${
    props._users.length > 5 ? 40 * 5 : 40 * props._users.length
  }px`;
  const usersHeight = `${users.length > 5 ? 40 * 5 : 40 * users.length}px`;

  function computeProps(userList: User[], index: number): ListItemProps {
    let props: ListItemProps;
    if (index === 0 && userList.length > 1)
      props = {
        borderTopLeftRadius: "5px",
        borderTopRadius: "5px",
        border: "1px solid #E2E8F0"
      };
    else if (index === 0 && userList.length === 1)
      props = {
        borderRadius: "5px",
        border: "1px solid #E2E8F0"
      };
    else if (index === userList.length - 1)
      props = {
        borderBottomLeftRadius: "5px",
        borderBottomRightRadius: "5px",
        borderLeft: "1px solid #E2E8F0",
        borderRight: "1px solid #E2E8F0",
        borderBottom: "1px solid #E2E8F0"
      };
    else
      props = {
        borderLeft: "1px solid #E2E8F0",
        borderRight: "1px solid #E2E8F0",
        borderBottom: "1px solid #E2E8F0"
      };
    return props;
  }

  function handleAddUser(user: User) {
    props._setUsers(props._users.concat(user));
    setUsers(users.filter(u => u.id !== user.id));
  }

  function handleRemoveUser(user: User) {
    props._setUsers(props._users.filter(u => u.id !== user.id));
    setUsers(users.concat(user));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.executeMutation();
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="teal">{props.action}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Input
                type="text"
                placeholder="Search Users"
                value={filter}
                onChange={event => setFilter(event.target.value)}
              />
              {props._users.length > 0 && (
                <List height={_usersHeight} overflow="scroll">
                  {props._users.map((u, i) => {
                    const listItemProps = computeProps(props._users, i);
                    return (
                      <ListItem
                        key={u.id}
                        display="flex"
                        paddingTop="7px"
                        paddingLeft="15px"
                        paddingBottom="7px"
                        {...listItemProps}
                      >
                        <Text flex="1">{u.username}</Text>
                        <CloseButton
                          size="sm"
                          marginRight="10px"
                          onClick={() => handleRemoveUser(u)}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
              {users.length > 0 && (
                <List height={usersHeight} overflow="scroll">
                  {users
                    .filter(u => u.username.toLowerCase().includes(filter))
                    .map((u, i) => {
                      const listItemProps = computeProps(users, i);
                      return (
                        <ListItem
                          key={u.id}
                          paddingTop="7px"
                          paddingLeft="15px"
                          paddingBottom="7px"
                          {...listItemProps}
                          _hover={{ backgroundColor: "gray.100" }}
                          onClick={() => handleAddUser(u)}
                        >
                          <Text>{u.username}</Text>
                        </ListItem>
                      );
                    })}
                </List>
              )}
              <Button
                type="submit"
                colorScheme="teal"
                isLoading={props.loading}
                loadingText="Loading..."
              >
                {props.action}
              </Button>
            </Stack>
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default UsersModal;
