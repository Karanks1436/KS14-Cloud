import { Routes, Route } from "react-router-dom";
import Auth from "./Auth";
// import SavedMessages from "./SavedMessages";
import ProtectedRoute from "./ProtectedRoute";
import Table from "./Table";
import Admin from "./Admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />

      <Route
        path="/table"
        element={
          <ProtectedRoute>
           <Table/>
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin"
        element={
          <ProtectedRoute>
           <Admin/>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
