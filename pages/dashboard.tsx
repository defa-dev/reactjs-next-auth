import { useContext, useEffect } from "react";

import { api } from "../services/apiClient";
import { setUpAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";
import { AuthContext } from "../context/AuthContext";
import { useCan } from "../hooks/useCan";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const userCanSeeMetrics = useCan({
    permissions: ["metrics.list"],
  });

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
      { userCanSeeMetrics && <div>Métricasl</div>}
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
