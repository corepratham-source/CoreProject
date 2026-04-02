import { useState, useEffect, useRef } from "react";
import api from "../api";
import "./ApplyPage.css";
import TnCPage from "./TnCPage";

export default function ApplyPage() {

  const FUNCTION_MAP = {
    "Sales & Business Development": [
      "Key Account Management",
      "Channel / Distribution Sales",
      "B2B / Institutional Sales",
      "B2C / Retail Sales",
      "Business Development",
      "Territory / Area Sales",
      "Inside Sales"
    ],
    "Marketing & Brand": [
      "Digital Marketing",
      "Brand Management",
      "Product Marketing",
      "Performance Marketing",
      "Market Research & Insights",
      "Trade Marketing",
      "Content & Communication"
    ],
    "Finance & Accounts": [
      "Financial Accounting",
      "Taxation",
      "Audit & Compliance",
      "FP&A",
      "Controllership",
      "Treasury",
      "MIS & Reporting"
    ],
    "Human Resources (HR)": [
      "Talent Acquisition",
      "HRBP",
      "L&D",
      "Compensation & Benefits",
      "Payroll",
      "Employee Relations",
      "HR Analytics"
    ],
    "Operations & Supply Chain": [
      "Supply Chain Management",
      "Logistics & Transportation",
      "Warehouse Management",
      "Demand / Supply Planning",
      "Inventory Management",
      "Distribution",
      "Order Fulfillment"
    ],
    "Manufacturing / Engineering": [
      "Production / Operations",
      "Maintenance",
      "Industrial Engineering",
      "Process Engineering",
      "Plant Management",
      "Lean / Six Sigma",
      "Project Execution"
    ],
    "Procurement & Sourcing": [
      "Strategic Sourcing",
      "Vendor Development",
      "Purchase Operations",
      "Contract Management",
      "Costing & Negotiation",
      "Import / Export"
    ],
    "Technology / IT / Data": [
      "Software Development",
      "IT Infrastructure",
      "Data Analytics",
      "Cybersecurity",
      "Cloud / DevOps",
      "ERP Systems",
      "AI / Machine Learning"
    ],
    "Quality & Compliance": [
      "Quality Assurance",
      "Quality Control",
      "Regulatory Compliance",
      "Audits",
      "Process Quality",
      "EHS"
    ],
    "Customer Service & Support": [
      "Customer Support",
      "After-Sales Service",
      "Client Servicing",
      "Technical Support",
      "Complaint Resolution",
      "Service Operations"
    ],
    "Administration & Facilities": [
      "Office Administration",
      "Facilities Management",
      "Travel Coordination",
      "Security",
      "General Administration"
    ],
    "Strategy & Leadership": [
      "Business Strategy",
      "Corporate Planning",
      "Consulting",
      "Business Transformation",
      "Program Management",
      "CEO Office"
    ]
  };

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Please be careful while sharing data as you will not be able to change it once submitted.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    },
    {
      sender: "ai",
      text: "Hello! 👋 Let's get you matched with the best jobs. What’s your full name?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    experience: "",
    salary: "",
    functionCategory: "",
    subFunction: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const now = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  const handleChipClick = (value) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: value, time: now() }
    ]);

    if (step === 5) {
      setForm((prev) => ({ ...prev, functionCategory: value }));

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "Great. Now select your sub-function:", time: now() }
        ]);
      }, 300);

      setStep(6);
    }

    else if (step === 6) {
      setForm((prev) => ({ ...prev, subFunction: value }));

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "Please upload your resume (PDF/DOC)", time: now() }
        ]);
      }, 300);

      setStep(7);
    }
  };

  const sendMessage = () => {
    if (!input) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input, time: now() }
    ]);

    let reply = "";

    if (step === 0) {
      setForm((prev) => ({ ...prev, name: input }));
      reply = "Great! Can I have your contact number?";
      setStep(1);

    } else if (step === 1) {
      setForm((prev) => ({ ...prev, phone: input }));
      reply = "Thanks! What’s your email address?";
      setStep(2);

    } else if (step === 2) {
      setForm((prev) => ({ ...prev, email: input }));
      reply = "How many years of experience do you have? For example, for 2 years say 2, for 6 months say 0.5";
      setStep(3);

    } else if (step === 3) {
      setForm((prev) => ({ ...prev, experience: input }));
      reply = "What is your expected annual salary? For example, for 5 LPA say 5";
      setStep(4);

    } else if (step === 4) {
      setForm((prev) => ({ ...prev, salary: input }));
      reply = "Please select your function below:";
      setStep(5);
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: reply, time: now() }
      ]);
    }, 400);

    setInput("");
  };

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Upload resume");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("experience", Number(form.experience));
      formData.append("salary", Number(form.salary));
      formData.append("functionCategory", form.functionCategory);
      formData.append("subFunction", form.subFunction);
      formData.append("resume", file);

      const res = await api.post("/applications/create-application", formData);

      const id = res.data._id;
      await api.get(`/applications/${id}/match`);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Profile submitted successfully.Should we find a suitable match, someone from our team will reach out within 24-48 hours.",
          time: now()
        }
      ]);

    } catch {
      alert("Error submitting");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="appCard">
        <TnCPage />

        {/* Navbar */}
        <div className="navbar">
          <div className="logo">
            <img src="https://res.cloudinary.com/dwnzd0c2t/image/upload/v1774591468/coreLogo_xpqd8n.png" alt="Core Logo" />
          </div>
          <div className="navButtons">
            <button className="login">Login</button>
            <button className="signup">Sign Up</button>
          </div>
        </div>

        {/* Header */}
        <div className="header">
          <h2>Welcome to the Core Careers Hiring Engine</h2>
          <p>Smart hiring. Effortless matching. All in one place.</p>
        </div>

        {/* Chat */}
        <div className="chat" ref={chatRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`row ${msg.sender}`}>
              <div className={`bubble ${msg.sender}`}>
                {msg.text}
                <div className="time">{msg.time}</div>
              </div>
            </div>
          ))}

          {/* Function Chips */}
          {step === 5 && (
            <div className="chipContainer">
              {Object.keys(FUNCTION_MAP).map((func) => (
                <button
                  key={func}
                  className={`chip ${form.functionCategory === func ? "selected" : ""}`}
                  onClick={() => handleChipClick(func)}
                >
                  {func}
                </button>
              ))}
            </div>
          )}

          {/* Sub-function Chips */}
          {step === 6 && (
            <div className="chipContainer">
              {FUNCTION_MAP[form.functionCategory].map((sub) => (
                <button
                  key={sub}
                  className={`chip ${form.subFunction === sub ? "selected" : ""}`}
                  onClick={() => handleChipClick(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Upload */}
          {step === 7 && (
            <div className="uploadBox">
              <input type="file" onChange={handleFile} />
              <button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Resume"}
              </button>
            </div>
          )}
        </div>

        {/* Input */}
        {step < 5 && (
          <div className="inputBox">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        )}
      </div>
    </div>
  );
}