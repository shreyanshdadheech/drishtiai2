import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import HomePage from "../pages/HomePage";
import SecondPage from "@/pages/SecondPage";
import Login from "@/pages/Login";

export const HomeRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/home",
  component: HomePage,
});

export const SecondPageRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/second-page",
  component: SecondPage,
});

export const LoginRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/login",
  component: Login,
});

export const rootTree = RootRoute.addChildren([HomeRoute, SecondPageRoute, LoginRoute]);
