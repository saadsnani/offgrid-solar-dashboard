import Dashboard from "../components/dashboard";

export default function DashboardPage() {
  // Tu peux ajouter ici une logique d'authentification si besoin
  return <Dashboard onLogout={() => {}} userEmail={"demo@local"} />;
}
