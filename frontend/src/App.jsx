import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ApplyPage from "./ApplicationScripts/ApplyPage";
import CreateJob from "./JobScripts/CreateJob";
import JobDashboard from "./JobScripts/JobDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ApplyPage />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/dashboard" element={<JobDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;