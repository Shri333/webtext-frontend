import type { User } from "../graphql/fragments";
import type {
  UpdateUserData,
  UpdateUserVariables,
  DeleteUserData,
  DeleteUserVariables
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
  Stack,
  Input,
  Button,
  Box
} from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { UPDATE_USER, DELETE_USER } from "../graphql/mutations";

type ProfileProps = {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  logout: () => void;
};

function Profile(props: ProfileProps): JSX.Element {
  const [username, setUsername] = useState<string>(props.user.username);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const toast = useToast();
  const [updateUser, { loading: updateLoading }] = useMutation<
    UpdateUserData,
    UpdateUserVariables
  >(UPDATE_USER, {
    onCompleted() {
      props.onClose();
      toast({
        title: "Account updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true
      });
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
  const [deleteUser, { loading: deleteLoading }] = useMutation<
    DeleteUserData,
    DeleteUserVariables
  >(DELETE_USER, {
    onCompleted() {
      props.logout();
      toast({
        title: "Account deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true
      });
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
    if (password === confirmPassword)
      updateUser({ variables: { username, password } });
    else
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true
      });
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="teal">Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Stack>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={event => setUsername(event.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
              />
              <Stack direction="row">
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={updateLoading}
                  loadingText="Loading..."
                >
                  Update Account
                </Button>
                <Button type="button" colorScheme="teal" onClick={props.logout}>
                  Logout
                </Button>
                <Button
                  type="button"
                  colorScheme="red"
                  isLoading={deleteLoading}
                  loadingText="Loading..."
                  onClick={() => deleteUser()}
                >
                  Delete Account
                </Button>
              </Stack>
            </Stack>
          </form>
        </ModalBody>
        <Box height="20px" />
      </ModalContent>
    </Modal>
  );
}

export default Profile;
