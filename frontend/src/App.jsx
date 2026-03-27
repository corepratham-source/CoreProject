import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ApplyPage from "./ApplicationScripts/ApplyPage";
import CreateJob from "./JobScripts/CreateJob";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ApplyPage />} />
        <Route path="/create-job" element={<CreateJob />} />
      </Routes>
    </Router>
  );
}

export default App;