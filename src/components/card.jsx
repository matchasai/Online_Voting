const Card = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md flex items-center space-x-4">
      <div className="text-blue-500 text-3xl">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default Card;
