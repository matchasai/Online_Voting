import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";

const StatCard = ({ card, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`min-w-[160px] flex flex-col items-center justify-center p-4 text-center ${card.bg} rounded-lg shadow-lg relative group cursor-pointer focus-within:ring-2 focus-within:ring-yellow-400 outline-none`}
      data-tooltip-id={`tooltip-${index}`}
      style={{ transition: "box-shadow 0.2s" }}
      tabIndex={0}
      aria-label={card.label}
    >
      <Link to={card.link} className="w-full h-full">
        <div className="flex justify-center items-center text-3xl mb-2">{card.icon}</div>
        <h3 className="text-lg font-bold mb-2 text-white">{card.label}</h3>
        <p className="text-3xl font-bold text-white">{card.value}</p>
        <Tooltip id={`tooltip-${index}`} content={card.tooltip} />
        <span className="absolute top-2 right-2 text-xs bg-black bg-opacity-30 px-2 py-1 rounded hidden group-hover:block">Go</span>
      </Link>
    </motion.div>
  );
};

export default StatCard; 