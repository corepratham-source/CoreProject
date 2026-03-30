import { useState, useEffect, useRef } from "react";
import api from "../api";
import "./ApplyPage.css";
import TnCPage from "./TnCPage";

export default function ApplyPage() {
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
    function: "",
    resumeText: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  const chatRef = useRef(null);

  const FUNCTIONS = [
    "Sales",
    "Accounting",
    "Marketing",
    "Engineering",
    "HR",
    "Operations"
  ];

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages, jobs]);

  const now = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  const sendMessage = () => {
    if (!input) return;

    const updatedMessages = [
      ...messages,
      { sender: "user", text: input, time: now() }
    ];
    setMessages(updatedMessages);

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
      reply = "How many years of experience do you have?";
      setStep(3);

    } else if (step === 3) {
      setForm((prev) => ({ ...prev, experience: input }));
      reply = "What is your expected salary? Give us a single value - For example for 24LPA, just say 24.";
      setStep(4);

    } else if (step === 4) {
      setForm((prev) => ({ ...prev, salary: input }));
      reply = `Which function are you in? (${FUNCTIONS.join(", ")})`;
      setStep(5);

    } else if (step === 5) {
      setForm((prev) => ({ ...prev, function: input }));
      reply = "Please upload your resume (PDF/DOC)";
      setStep(6);
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: reply, time: now() }
      ]);
    }, 500);

    setInput("");
  };

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload a resume");

    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: "Analyzing your profile...",
        time: now(),
        typing: true
      }
    ]);

    try {
      
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("experience", Number(form.experience));
      formData.append("salary", Number(form.salary));
      formData.append("function", form.function);
      formData.append("resume", file);
      await api.post("/applications/create-application", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setMessages((prev) => [
        ...prev,
        { 
          sender: "ai", 
          text: "We've now got your profile ready! Should our system find any good matches, our team will reach out to you within 24-48 hours. Thank you for applying!", 
          time: now() 
        }
      ]);

    } catch (err) {

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Something went wrong while analyzing your profile.",
          time: now()
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="appCard">
        <TnCPage/>
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
                {msg.typing ? <span className="dots"></span> : msg.text}
                <div className="time">{msg.time}</div>
              </div>
            </div>
          ))}

          {/* Resume Upload */}
          {step === 6 && (
            <div className="uploadBox">
              <input type="file" onChange={handleFile} />
              <button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Resume"}
              </button>
            </div>
          )}

          {/* Job Results */}
          {jobs.map((job, i) => (
            <div key={i} className="jobCard">
              <div className="jobLeft">C</div>
              <div className="jobContent">
                <h4>{job.company || "Company"}</h4>
                <p>{job.title || "Role"} • {job.location || "Location"}</p>
                <span className="salary">
                  {job.salary || "Salary not disclosed"}
                </span>
              </div>
              <button className="viewBtn">View & Consent</button>
            </div>
          ))}
        </div>

        {/* Input */}
        {step < 6 && (
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