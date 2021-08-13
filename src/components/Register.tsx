import type { ApolloQueryResult } from "@apollo/client";
import type { FindUserData } from "../graphql/queries";
import type {
  CreateUserData,
  CreateUserVariables,
  LoginData,
  LoginVariables
} from "../graphql/mutations";
import React, { useState } from "react";
import {
  useToast,
  useMediaQuery,
  Flex,
  Spacer,
  Box,
  Stack,
  Center,
  Heading,
  Input,
  Button,
  Text,
  Link as ChakraLink
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_USER, LOGIN } from "../graphql/mutations";

type RegisterProps = {
  refetch: () => Promise<ApolloQueryResult<FindUserData>>;
};

function Register(props: RegisterProps): JSX.Element {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const toast = useToast();
  const [mobile] = useMediaQuery("(max-width: 750px)");
  const [login, { loading: loginLoading }] = useMutation<
    LoginData,
    LoginVariables
  >(LOGIN, {
    onCompleted(data) {
      localStorage.setItem("token", data.login);
      props.refetch();
      toast({
        title: message,
        status: "success",
        duration: 3000,
        isClosable: true
      });
    }
  });
  const [createUser, { loading: createUserLoading }] = useMutation<
    CreateUserData,
    CreateUserVariables
  >(CREATE_USER, {
    onCompleted(data) {
      setMessage(`User ${data.createUser.username} created successfully`);
      login({ variables: { username, password } });
    },
    onError(error) {
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
    if (password === confirmPassword)
      createUser({ variables: { username, password } });
    else
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true
      });
  }

  return (
    <Flex direction="column" height="lg">
      <Spacer flex="1" />
      <Flex flex="10">
        <Spacer flex={mobile ? "2" : "5"} />
        <Box flex="3">
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Center>
                <Heading>Register</Heading>
              </Center>
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
              <Button
                type="submit"
                colorScheme="teal"
                isLoading={createUserLoading || loginLoading}
                loadingText="Loading..."
              >
                Register
              </Button>
              <Center>
                <Text fontSize="sm">
                  Have an account? Login{" "}
                  <ChakraLink color="teal" as={Link} to="/">
                    here
                  </ChakraLink>
                </Text>
              </Center>
            </Stack>
          </form>
        </Box>
        <Spacer flex={mobile ? "2" : "5"} />
      </Flex>
    </Flex>
  );
}

export default Register;
