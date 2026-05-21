import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Boats from "./pages/Boats";
import AddBoat from "./pages/AddBoat";
import Trips from "./pages/Trips";
import AddTrip from "./pages/AddTrip";
import Documents from "./pages/Documents";
import AddDocument from "./pages/AddDocument";
import Fuel from "./pages/Fuel";
import AddFuel from "./pages/AddFuel";
import AIReport from "./pages/AIReport";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Maintenance from "./pages/Maintenance";
import AddMaintenance from "./pages/AddMaintenance";
import Crew from "./pages/Crew";
import AddCrew from "./pages/AddCrew";
import EditBoat from "./pages/EditBoat";
import Billing from "./pages/Billing";
import PaymentSuccess from "./pages/PaymentSuccess";
import SubscriptionGuard from "./components/SubscriptionGuard";

function ProtectedPage({
  children,
  requireSubscription = true,
}: {
  children: React.ReactNode;
  requireSubscription?: boolean;
}) {
  return (
    <ProtectedRoute>
      <AppLayout>
        {requireSubscription ? (
          <SubscriptionGuard>{children}</SubscriptionGuard>
        ) : (
          children
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedPage>
              <Dashboard />
            </ProtectedPage>
          }
        />

        <Route
          path="/boats"
          element={
            <ProtectedPage>
              <Boats />
            </ProtectedPage>
          }
        />

        <Route
          path="/boats/add"
          element={
            <ProtectedPage>
              <AddBoat />
            </ProtectedPage>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedPage>
              <Trips />
            </ProtectedPage>
          }
        />

        <Route
          path="/trips/add"
          element={
            <ProtectedPage>
              <AddTrip />
            </ProtectedPage>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedPage>
              <Documents />
            </ProtectedPage>
          }
        />

        <Route
          path="/documents/add"
          element={
            <ProtectedPage>
              <AddDocument />
            </ProtectedPage>
          }
        />

        <Route
          path="/fuel"
          element={
            <ProtectedPage>
              <Fuel />
            </ProtectedPage>
          }
        />

        <Route
          path="/fuel/add"
          element={
            <ProtectedPage>
              <AddFuel />
            </ProtectedPage>
          }
        />

        <Route
          path="/ai-report"
          element={
            <ProtectedPage>
              <AIReport />
            </ProtectedPage>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedPage>
              <Maintenance />
            </ProtectedPage>
          }
        />

        <Route
          path="/maintenance/add"
          element={
            <ProtectedPage>
              <AddMaintenance />
            </ProtectedPage>
          }
        />
        <Route
          path="/crew"
          element={
            <ProtectedPage>
              <Crew />
            </ProtectedPage>
          }
        />

        <Route
          path="/crew/add"
          element={
            <ProtectedPage>
              <AddCrew />
            </ProtectedPage>
          }
        />
        <Route
          path="/boats/edit/:boatId"
          element={
            <ProtectedPage>
              <EditBoat />
            </ProtectedPage>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedPage>
              <Billing />
            </ProtectedPage>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedPage requireSubscription={false}>
              <Billing />
            </ProtectedPage>
          }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}