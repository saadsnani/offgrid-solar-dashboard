
import { useState } from "react";
import Dashboard from "../components/dashboard";
import { LoginPage } from "../components/login-page";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? (
    <Dashboard onLogout={() => setLoggedIn(false)} userEmail={"demo@local"} />
  ) : (
    <LoginPage onLogin={() => setLoggedIn(true)} />
  );
}
