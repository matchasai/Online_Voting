import { motion } from "framer-motion";
import voteImage from "../assets/vote_img.png"; // Make sure to add an image in your assets folder

const WhyVote = () => {
  return (
    <section className="py-20 px-6 md:px-16 bg-gray-100 text-gray-900" id="WhyVote">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-blue-600">
          Why Should You Vote? 🗳️
        </h2>
        <p className="mt-4 text-lg md:text-xl">
          Voting is a fundamental right that shapes the future of our nation. Every vote counts in building a better democracy!
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Left Side - Image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img src={voteImage} alt="Voting Importance" className="w-full rounded-lg shadow-lg" />
        </motion.div>

        {/* Right Side - Cards */}
        <div className="space-y-6">
          {[
            { title: "Strengthens Democracy", desc: "Your vote ensures a government chosen by the people, for the people." },
            { title: "Every Vote Counts", desc: "Even a single vote can decide the fate of a nation." },
            { title: "Your Right, Your Power", desc: "Voting is a right that empowers you to bring change." },
            { title: "Shape the Future", desc: "By voting, you play a role in shaping policies and governance." },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4"
            >
              <div className="bg-blue-500 text-white p-4 rounded-full text-xl font-bold">
                {index + 1}
              </div>
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

export default WhyVote;
