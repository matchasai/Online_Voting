import { motion } from "framer-motion";
import React, { useState } from "react";

const parties = [
    {
      name: "Telugu Desam Party (TDP)",
      founder: "Nandamuri Taraka Rama Rao (NTR)",
      year: 1982,
      ideology: "Regionalism, Welfare Politics",
      achievements:
        "Pioneered rural electrification, innovative welfare schemes, boosted IT sector growth in Andhra Pradesh.",
      image: "/party_img/tdp.png",
    },
    {
      name: "YSR Congress Party (YSRCP)",
      founder: "Y. S. Jagan Mohan Reddy",
      year: 2011,
      ideology: "Welfare Politics, Social Justice",
      achievements:
        "Implemented schemes like Amma Vodi and Rythu Bharosa in Andhra Pradesh.",
      image: "/party_img/ysrcp.png",
    },
    {
      name: "Bharat Rashtra Samithi (BRS)",
      founder: "K. Chandrashekar Rao (KCR)",
      year: 2001,
      ideology: "Regionalism, Social Justice",
      achievements:
        "Key role in the formation of Telangana and implementing welfare schemes in Telangana.",
      image: "/party_img/brs.png",
    },
    {
      name: "Praja Shanti Party (PSP)",
      founder: "Dr. R. V. Rao",
      year: 2015,
      ideology: "Peace, Social Justice, Progressive Governance",
      achievements:
        "Advocated for transparent political reforms and increased public participation.",
      image: "/party_img/psp.png",
    },
    {
      name: "Bharatiya Janata Party (BJP)",
      founder: "Atal Bihari Vajpayee, L.K. Advani",
      year: 1980,
      ideology: "Hindutva, Nationalism, Conservatism",
      achievements:
        "Revoked Article 370, launched Digital India, and promoted Make in India.",
      image: "/party_img/bjp.png",
    },
    {
      name: "Jana Sena Party (JSP)",
      founder: "Pawan Kalyan",
      year: 2014,
      ideology: "Democratic Reforms, Anti-Corruption, Regionalism",
      achievements: "Promoted youth empowerment and transparency in politics.",
      image: "/party_img/jsp.png",
    },
    {
      name: "Communist Party of India (CPI)",
      founder: "S.A. Dange and others",
      year: 1925,
      ideology: "Marxism-Leninism, Proletarian Revolution",
      achievements:
        "Instrumental in labor movements, land reforms, and social welfare initiatives.",
      image: "/party_img/cpi.png",
    },
    {
      name: "Indian National Congress (INC)",
      founder: "Allan Octavian Hume",
      year: 1885,
      ideology: "Liberalism, Secularism",
      achievements:
        "Key role in India's independence and the implementation of major social reforms.",
      image: "/party_img/inc.png",
    },
    {
      name: "Bahujan Samaj Party (BSP)",
      founder: "Kanshi Ram",
      year: 1984,
      ideology: "Dalit Socialism, Social Justice",
      achievements:
        "Empowered marginalized communities and implemented reservation policies in Uttar Pradesh.",
      image: "/party_img/bsp.png",
    },
    {
      name: "Nationalist Congress Party (NCP)",
      founder: "Sharad Pawar",
      year: 1999,
      ideology: "Centrism, Secularism, Regionalism",
      achievements:
        "Championed agricultural development and progressive reforms in Maharashtra.",
      image: "/party_img/ncp.png",
    },
    {
      name: "Aam Aadmi Party (AAP)",
      founder: "Arvind Kejriwal",
      year: 2012,
      ideology: "Anti-Corruption, Populism, Welfare Politics",
      achievements:
        "Implemented Mohalla Clinics, provided free utilities in Delhi, and reformed education.",
      image: "/party_img/aap.png",
    },
    {
      name: "National People's Party (NPP)",
      founder: "P. A. Sangma",
      year: 2013,
      ideology: "Regionalism, Progressive Development",
      achievements:
        "Advocated for indigenous rights and influenced local policies in Northeast India.",
      image: "/party_img/npp.png",
    },
  ];

const InfoSection = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="p-10 bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
      <motion.h2
        className="text-4xl font-extrabold mb-6 text-center text-orange-500 mt-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Indian Political Parties
      </motion.h2>

      <div className="flex justify-center mb-8">
        <motion.input
          type="text"
          placeholder="Search Party..."
          className="w-2/3 p-4 rounded-lg bg-gray-800 text-white text-lg text-center border border-gray-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          onChange={(e) => setSearch(e.target.value)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
        {parties
          .filter((party) =>
            party.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((party, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gray-800 rounded-lg shadow-xl text-center transition transform hover:scale-105 hover:shadow-orange-500/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.img
                src={party.image}
                alt={party.name}
                className="h-24 w-24 mx-auto mb-4 border border-orange-500"
                whileHover={{ scale: 1.1 }}
              />
              <h3 className="text-2xl font-semibold text-orange-400">{party.name}</h3>
              <p className="mt-2">
                <strong>Founder:</strong> {party.founder}
              </p>
              <p>
                <strong>Year:</strong> {party.year}
              </p>
              <p>
                <strong>Ideology:</strong> {party.ideology}
              </p>
              <p>
                <strong>Achievements:</strong> {party.achievements}
              </p>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default InfoSection;
