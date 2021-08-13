import type { FindUserData, FindUserVariables } from "./graphql/queries";
import React, { useEffect } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Main from "./components/Main";
import { Switch, Route, Redirect } from "react-router-dom";
import { useQuery, useApolloClient } from "@apollo/client";
import { socket } from "./socket";
import { FIND_USER } from "./graphql/queries";

function App(): JSX.Element | null {
  const { loading, data, refetch } = useQuery<FindUserData, FindUserVariables>(
    FIND_USER,
    {
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true
    }
  );
  const client = useApolloClient();

  useEffect(() => {
    if (data && !data.findUser) localStorage.clear();
    if (data && data.findUser && !socket.connected) {
      socket.connect();
      socket.emit("AUTHORIZATION", `Bearer ${localStorage.getItem("token")}`);
    }
  }, [data]);

  function logout() {
    localStorage.clear();
    socket.disconnect();
    client.clearStore();
    refetch();
  }

  if (loading || !data) return null;

  if (!data.findUser)
    return (
      <Switch>
        <Route path="/register">
          <Register refetch={refetch} />
        </Route>
        <Route path="/" exact>
          <Login refetch={refetch} />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    );

  return (
    <>
      <Switch>
        <Route path="/" exact>
          <Main user={data.findUser} logout={logout} />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </>
  );
}

export default App;
