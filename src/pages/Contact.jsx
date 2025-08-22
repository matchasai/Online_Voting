import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sanitizeInput } from "../utils/sanitizeInput";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedbackType: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: sanitizeInput(e.target.value) });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.feedbackType || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Sanitize all formData before sending
    const sanitizedData = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, sanitizeInput(v)])
    );

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: sanitizedData.name,
          email: sanitizedData.email,
          message: sanitizedData.message,
          feedback_type: sanitizedData.feedbackType, // Optional: Send feedback type
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", feedbackType: "", message: "" });
      })
      .catch((error) => {
        toast.error("Failed to send message.");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6  ">



      <motion.div
        className="bg-gray-800 p-9 mt-16 rounded-lg shadow-lg w-full max-w-lg display-none"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-green-400">Contact Us</h2>
        <p className="text-gray-400 text-center mt-2">We'd love to hear from you!</p>

        <form onSubmit={sendEmail} className="mt-6 space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Feedback Type Dropdown */}
          <div>
            <label className="block text-gray-300">Feedback Type</label>
            <motion.select
              name="feedbackType"
              value={formData.feedbackType}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-green-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              required
            >
              <option value="">Select Feedback</option>
              <option value="Bug Report">🐞 Bug Report</option>
              <option value="Feature Request">✨ Feature Request</option>
              <option value="General Feedback">💡 General Feedback</option>
            </motion.select>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-gray-300">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-green-400"
              rows="4"
              required
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 p-3 rounded text-white font-bold transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            Send Message
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;
