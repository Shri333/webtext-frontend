import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import {
  from,
  ApolloLink,
  HttpLink,
  ApolloClient,
  InMemoryCache,
  ApolloProvider
} from "@apollo/client";

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext((context: Record<string, Record<string, string>>) => ({
    headers: {
      ...context.headers,
      authorization: `Bearer ${localStorage.getItem("token")}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }));
  return forward(operation);
});

const httpLink = new HttpLink();

const link = from([authLink, httpLink]);

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        findUsers: { merge: (_, incoming) => incoming },
        findChats: { merge: (_, incoming) => incoming }
      }
    },
    Chat: {
      fields: {
        admin: { merge: (_, incoming) => incoming },
        users: { merge: (_, incoming) => incoming },
        messages: { merge: (_, incoming) => incoming }
      }
    }
  }
});

const client = new ApolloClient({ link, cache });

const theme = extendTheme({
  styles: {
    global: {
      "body::-webkit-scrollbar": {
        display: "none"
      },
      body: {
        msOverflowStyle: "none",
        scrollbarWidth: "none"
      },
      "ul::-webkit-scrollbar": {
        display: "none"
      },
      ul: {
        msOverflowStyle: "none",
        scrollbarWidth: "none"
      }
    }
  }
});

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </ChakraProvider>,
  document.getElementById("root")
);
