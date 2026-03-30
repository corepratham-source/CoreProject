import { useState, useRef, useEffect } from "react";
import "./TnCPage.css";

export default function TnCPage({ onAccept }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const contentRef = useRef(null);

  // Detect scroll to bottom
  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;

    const isBottom =
      el.scrollHeight - el.scrollTop <= el.clientHeight + 5;

    setIsScrolledToBottom(isBottom);
  };

  const handleClose = () => {
    if (isChecked) {
      setIsOpen(false);
      onAccept && onAccept(); // optional callback
    }
  };

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="tnc-overlay">
      <div className="tnc-modal">

        <h2>CANDIDATE TERMS OF USE & CONSENT AGREEMENT</h2>

        {/* Scrollable content */}
        <div className="tnc-content" ref={contentRef}>
          <p>
            By proceeding to upload your resume and details on this platform, you (“Candidate”) agree to the following terms and conditions:
        </p>
            <p>
            1. Platform Ownership & Role

            This platform is owned and operated by the employer, and currently functions solely for the purpose of identifying and evaluating potential candidates for internal hiring requirements.

            At this stage, we are the only employer on this platform, and no third-party employers have access to your data.

            ---
        </p> 
        <br/>
        <p>
            2. No Fees or Charges

            You expressly acknowledge and agree that:

            - No fees, charges, or payments are required at any stage of the recruitment process.
            - We do not charge candidates for registration, shortlisting, interviews, or job offers.
            - Any request for payment claiming to be on our behalf should be treated as fraudulent and reported immediately.

            ---
        </p>
        <br/>
        <p>
            3. Information Provided by Candidate

            You agree that all information submitted by you, including but not limited to:

            - Name
            - Date of Birth
            - Functional expertise (in your own words)
            - Current Compensation (CTC)
            - Notice Period
            - Current Location
            - Resume / CV

            is accurate, truthful, and not misleading.

            You understand that any false or misleading information may lead to immediate disqualification without notice.

            ---
        </p>
        <br/>
        <p>
            4. Data Processing & AI Evaluation

            You explicitly consent to:

            - Your profile being processed using automated systems, including AI-based tools, for:
            - Role matching
            - Profile normalization
            - Initial screening and filtering
            - Your inputs (such as “function”) being standardized or interpreted programmatically.

            This processing is solely for recruitment purposes.

            ---
        </p>
        <br/>
        <p>
            5. Matching & Communication

            Based on your submitted information:

            - If your profile matches a job requirement, you may receive a message such as:
            “Hi, your profile seems to match this job. Someone will get in touch with you shortly.”

            - If there is no current match, you may receive a regret notification.

            You acknowledge that:

            - These are preliminary automated responses.
            - Final decisions are subject to human review and further assessment.

            ---
        </p>
        <br/>
        <p>
            6. Internal Review & Contact

            If your profile is shortlisted:

            - Your resume may be flagged internally with a note such as:
            “Please speak to this candidate.”
            - Our team may contact you for further discussions, interviews, or assessments.

            If not shortlisted:

            - Your profile may still be retained in our database for future opportunities.

            ---
        </p>
        <br/>
        <p>
            7. Data Storage & Talent Database

            By registering, you consent to:

            - Your data being stored in our internal talent database from day one.
            - Your profile being considered for current and future roles.
            - Retention of your data unless you explicitly request deletion.

            ---
        </p>
        <br/>
        <p>
            8. Confidentiality & Data Usage

            Your data will:

            - Be used strictly for recruitment and internal hiring purposes.
            - Not be sold, rented, or shared with unauthorized third parties.

            ---
        </p>
        <br/>
        <p>
            9. No Guarantee of Employment

            Submission of your profile does not guarantee:

            - Shortlisting
            - Interview calls
            - Job offers

            All hiring decisions are at the sole discretion of the employer.

            ---
        </p>
        <br/>
        <p>
            10. Candidate Responsibility

            You agree:

            - Not to impersonate another individual.
            - Not to upload malicious, irrelevant, or inappropriate content.
            - To maintain professionalism in all interactions.

            ---
        </p>
        <br/>
        <p>
            11. Limitation of Liability

            The platform shall not be liable for:

            - Any indirect or consequential loss arising from use of the platform.
            - Delays or non-selection in the recruitment process.

            ---
            </p>
            <br/>
            <p>
            12. Contact & Communication

            For any queries or concerns, you may contact:

            Email: rajiv.ghoshrajiv@gmail.com

            ---
            </p>
            <br/>
            <p>
            13. Acceptance of Terms

            By clicking “I Agree” and uploading your resume, you confirm that:

            - You have read, understood, and accepted all the above terms.
            - You voluntarily consent to the use and processing of your data as described.

            ---
          </p>
          <p style={{ marginTop: 200 }}>
            END OF TERMS
          </p>
        </div>

        {/* Checkbox */}
        <div className="tnc-footer">
          <label>
            <input
              type="checkbox"
              disabled={!isScrolledToBottom}
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            I have read and agree to the Terms & Conditions
          </label>

          <button
            className="close-btn"
            disabled={!isChecked}
            onClick={handleClose}
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
}