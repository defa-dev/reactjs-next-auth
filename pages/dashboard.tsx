import { useContext, useEffect } from "react";

import { api } from "../services/apiClient";
import { setUpAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";
import { AuthContext } from "../context/AuthContext";
import { useCan } from "../hooks/useCan";
import { Can } from "../components/Can";

export default function Dashboard() {
  const { user, isAuthenticated, signOut } = useContext(AuthContext);

  useEffect(() => {
    api
      .get("/me")
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
        <button onClick={signOut}>Sign out</button>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setUpAPIClient(ctx);
  const response = await apiClient.get("me");
  
  return {
    props: {},
  };
});
