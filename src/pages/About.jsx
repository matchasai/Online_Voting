import { motion } from "framer-motion";
import React from "react";

const teamMembers = [
  { name: "Sai Sujan", role: "Developer", img: "/images/Sai_Sujan.png" },
  { name: "P Sathwik", role: "Backend Lead", img: "/images/Sathwik.png" },
  { name: "S Siddhartha", role: "Frontend Lead", img: "/images/Siddhartha.png" },
];

const About = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen pt-24 overflow-hidden">
      {/* Navbar Placeholder */}
      <div className="container mx-auto px-4 py-1">
        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold text-blue-500">About DeshKaVote</h2>
          <p className="mt-8 text-lg text-gray-300">
            Empowering democracy through secure and transparent online voting.
          </p>
          <p className="mt-6 text-gray-400">
            DeshKaVote is a modern online voting system that ensures a safe,
            secure, and transparent electoral process. Our platform enables
            citizens to participate in elections from anywhere, reducing barriers
            and increasing voter turnout.
          </p>
        </motion.div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-center">
          {[
            { title: "Integrity", desc: "Ensuring fair and unbiased elections through transparency and accountability." },
            { title: "Security", desc: "Protecting every vote with end-to-end encryption and multi-factor authentication." },
            { title: "Accessibility", desc: "Making voting easy and inclusive for all citizens, regardless of their location." },
            { title: "Innovation", desc: "Leveraging cutting-edge technology to modernize the electoral process." },
            { title: "Scalability", desc: "Building a robust infrastructure capable of handling nationwide elections." },
            { title: "Efficiency", desc: "Reducing the cost and time of traditional voting methods." },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="p-6 bg-gray-800 rounded-lg shadow-xl text-center transition transform hover:scale-105 hover:shadow-blue-500/50"
            >
              <h3 className="text-xl font-semibold text-blue-400">🔹 {item.title}</h3>
              <p className="text-gray-300 mt-4">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Goal Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-24"
        >
          <h2 className="text-3xl font-bold text-blue-500">Our Goal</h2>
          <p className="text-gray-300 mt-8">
            Our mission is to modernize the voting system, ensuring every citizen has the ability to
            cast their vote safely and securely from anywhere. We strive to eliminate voter suppression,
            reduce fraud, and create an electoral process that is both efficient and trustworthy.
          </p>
          <p className="text-gray-400 mt-4">
            We aim to build a future where every voice is heard and every vote counts. Our long-term
            vision includes integrating AI for fraud detection, blockchain for transparency, and biometric
            authentication for enhanced security.
          </p>
        </motion.div>

        {/* Meet Our Team */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-24 pb-24"
        >
          <h2 className="text-3xl font-bold text-blue-500">Meet Our Team</h2>
          <p className="text-gray-400 mt-4">
            Our dedicated team of professionals is committed to revolutionizing the voting process with technology.
          </p>
          <div className="grid md:grid-cols-3 gap-10 mt-12">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gray-800 rounded-lg shadow-xl text-center transition transform hover:scale-105 hover:shadow-blue-500/50"
              >
                <div className="flex justify-center">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-32 h-32 rounded-full border-4 border-blue-400 object-cover"
                  />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-blue-300">{member.name}</h3>
                <p className="text-gray-400">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
