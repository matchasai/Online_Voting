import { motion } from "framer-motion";
import importanceImage from "../assets/importance_img.png"; // Ensure the image is in the assets folder

const ImportanceOfVoting = () => {
  return (
    <section className="py-20 px-6 md:px-16 bg-white text-gray-900" id="Importance">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-blue-600">Importance of Voting 🗳️</h2>
        <p className="mt-4 text-lg md:text-xl">
          Voting is the backbone of democracy, ensuring that citizens have a voice in shaping the nation's future.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Left Side - Image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img src={importanceImage} alt="Importance of Voting" className="w-full rounded-lg shadow-lg" />
        </motion.div>

        {/* Right Side - Reasons */}
        <div className="space-y-6">
          {[
            { title: "Empowers Citizens", desc: "Voting gives people the power to choose their leaders and influence policies." },
            { title: "Ensures Representation", desc: "A high voter turnout leads to fairer governance that reflects public interest." },
            { title: "Drives Change", desc: "By voting, you can address issues like corruption, education, and economy." },
            { title: "Strengthens Democracy", desc: "Every vote contributes to a transparent and accountable government." },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-blue-100 p-6 rounded-lg shadow-md flex items-center space-x-4"
            >
              <div className="bg-blue-500 text-white p-4 rounded-full text-xl font-bold">{index + 1}</div>
              <div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImportanceOfVoting;
