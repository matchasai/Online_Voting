import { motion } from "framer-motion";
import electionImage from "../assets/election_img.png";

const WhyElections = () => {
  return (
    <section className="py-20 px-6 md:px-16 bg-gray-100 text-gray-900" id="WhyElections">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-blue-600">Why Are Elections Conducted? 📢</h2>
        <p className="mt-4 text-lg md:text-xl">
          Elections serve as the foundation of a democratic system, enabling people to choose their representatives.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Left Side - Cards */}
        <div className="space-y-6">
          {[
            { title: "Ensures People's Choice", desc: "Elections allow citizens to select leaders who represent their values and interests." },
            { title: "Promotes Accountability", desc: "Governments remain answerable to the public through periodic elections." },
            { title: "Encourages Participation", desc: "A democratic system thrives when citizens actively engage in the electoral process." },
            { title: "Prevents Autocracy", desc: "Regular elections prevent the concentration of power and uphold citizens' freedom." },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4"
            >
              <div className="bg-blue-500 text-white p-4 rounded-full text-xl font-bold">{index + 1}</div>
              <div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Side - Image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img src={electionImage} alt="Why Elections Are Conducted" className="w-full rounded-lg shadow-lg" />
        </motion.div>
      </div>
    </section>
  );
};

export default WhyElections;
