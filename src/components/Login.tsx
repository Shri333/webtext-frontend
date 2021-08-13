import type { ApolloQueryResult } from "@apollo/client";
import type { FindUserData } from "../graphql/queries";
import type { LoginData, LoginVariables } from "../graphql/mutations";
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
import { LOGIN } from "../graphql/mutations";

type LoginProps = { refetch: () => Promise<ApolloQueryResult<FindUserData>> };

function Login(props: LoginProps): JSX.Element {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const toast = useToast();
  const [mobile] = useMediaQuery("(max-width: 750px)");
  const [login, loginResult] = useMutation<LoginData, LoginVariables>(LOGIN, {
    onCompleted(data) {
      localStorage.setItem("token", data.login);
      props.refetch();
      toast({
        title: `Logged in as ${username}`,
        status: "success",
        duration: 3000,
        isClosable: true
      });
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
    login({ variables: { username, password } });
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
                <Heading>Login</Heading>
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
              <Button
                type="submit"
                colorScheme="teal"
                isLoading={loginResult.loading}
                loadingText="Loading..."
              >
                Login
              </Button>
              <Center>
                <Text fontSize="sm">
                  Don&#39;t have an account? Register{" "}
                  <ChakraLink color="teal" as={Link} to="/register">
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

export default Login;
