import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import Router from "next/router";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SigInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  sigIn(credentials: SigInCredentials): Promise<void>;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");

  Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();
    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut()
        });
    }
  }, []);

  async function sigIn({ email, password }: SigInCredentials) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: "/",
      });
      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ sigIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
