import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { MessageCircle, X } from "lucide-react";
import { MdFeedback } from "react-icons/md";
// Initialize Supabase client with environment variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const SupportButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [updateRequest, setUpdateRequest] = useState("");
  const [problemFeedback, setProblemFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async () => {
    if (!updateRequest.trim() && !problemFeedback.trim()) {
      setErrorMessage("⚠️ Please provide some feedback!");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase
      .from("user_feedback") // Ensure this table exists in Supabase
      .insert([
        {
          updates_needed: updateRequest,
          problems_faced: problemFeedback,
          submitted_at: new Date().toISOString(),
        },
      ]);

    setLoading(false);

    if (error) {
      setErrorMessage("❌ Error submitting feedback. Please try again.");
    } else {
      setSuccessMessage("✅ Feedback submitted successfully!");
      setUpdateRequest("");
      setProblemFeedback("");
      setTimeout(() => setShowDialog(false), 2000); // Close dialog after success
    }
  };

  return (
    <div>
      {/* Support Button (Bottom-Right) */}
      <button
        className="fixed bottom-8 right-4 bg-[#1B4E8D] text-white p-2.5 rounded-full shadow-md hover:bg-[#1B4E8D] transition-all"
        onClick={() => setShowDialog(true)}
      >
        {/* <MessageCircle size={20} /> */}
        <MdFeedback size={16}/>
      </button>

      {/* Feedback Dialog */}
      {showDialog && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 shadow-lg w-100 relative"> {/* Removed rounded-lg */}
      {/* Close Button */}
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-600 hover:outline-none hover:border-none focus:border-none focus:outline-none"
        onClick={() => setShowDialog(false)}
      >
        <X size={22} />
      </button>

      {/* Centered Heading */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        ✨ Submit Feedback
      </h2>

      {/* Input 1: Updates Needed */}
      <label className="block mb-2 text-sm font-medium text-gray-700">
      How can we enhance your experience?
      </label>
      <textarea
  className="w-full p-2 border mb-3 text-gray-800 bg-gray-50 focus:ring-2 focus:ring-blue-500 resize-none"
  placeholder="Enter your feature requests..."
  value={updateRequest}
  onChange={(e) => setUpdateRequest(e.target.value)}
  rows="1"
  onKeyDown={(e) => {
    if (e.key === "Enter") e.preventDefault();
  }}
/>


      {/* Input 2: Problems Faced */}
      <label className="block mb-2 text-sm font-medium text-gray-700">
      What challenges are you facing while using this?
      </label>
      <textarea
  className="w-full p-2 border mb-4 text-gray-800 bg-gray-50 focus:ring-2 focus:ring-blue-500 resize-none"
  placeholder="Describe any issues..."
  value={problemFeedback}
  onChange={(e) => setProblemFeedback(e.target.value)}
  rows="1"
  onKeyDown={(e) => {
    if (e.key === "Enter") e.preventDefault();
  }}
/>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-600 text-sm mb-2 font-medium">{errorMessage}</p>
      )}
      {/* Success Message */}
      {successMessage && (
        <p className="text-green-600 text-sm mb-2 font-medium">{successMessage}</p>
      )}

      {/* Submit Button */}
      <button
        className="w-full bg-[#1B4E8D] text-white py-2 hover:bg-[#1B4E8D] transition-all font-medium"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default SupportButton;
