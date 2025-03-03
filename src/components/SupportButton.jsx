
import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { MessageCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const SupportButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [updateRequest, setUpdateRequest] = useState("");
  const [problemFeedback, setProblemFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!updateRequest.trim() && !problemFeedback.trim()) {
      alert("Please provide some feedback!");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("user_feedback") // Your Supabase table name
      .insert([
        {
          updates_needed: updateRequest,
          problems_faced: problemFeedback,
          submitted_at: new Date().toISOString(),
        },
      ]);

    setLoading(false);

    if (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback");
    } else {
      alert("Feedback submitted successfully!");
      setUpdateRequest("");
      setProblemFeedback("");
      setShowDialog(false);
    }
  };

  return (
    <div>
      {/* Support Icon (Fixed at Bottom Right) */}
      <button
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-800 transition-all z-50"
        onClick={() => setShowDialog(true)}
        aria-label="Support"
      >
        <MessageCircle size={24} />
      </button>

      {/* Dialog Box */}
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 transition-colors"
              onClick={() => setShowDialog(false)}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <h2 className="text-lg font-semibold mb-4">Submit Feedback</h2>

            {/* Input 1: Updates Needed */}
            <label className="block mb-2 text-sm font-medium">What updates do you need in the next version?</label>
            <Textarea
              className="w-full p-2 border rounded mb-3"
              placeholder="Enter your feature requests..."
              value={updateRequest}
              onChange={(e) => setUpdateRequest(e.target.value)}
            />

            {/* Input 2: Problems Faced */}
            <label className="block mb-2 text-sm font-medium">What problems are you facing in the current version?</label>
            <Textarea
              className="w-full p-2 border rounded mb-4"
              placeholder="Describe any issues..."
              value={problemFeedback}
              onChange={(e) => setProblemFeedback(e.target.value)}
            />

            {/* Submit Button */}
            <button
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-800 transition-colors"
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
