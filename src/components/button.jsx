const Button = ({ label, onClick, className = "", type = "primary", icon: Icon }) => {
  const baseStyles = "px-4 py-2 rounded-lg transition flex items-center gap-2 justify-center";
  
  const typeStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${typeStyles[type]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />} {label}
    </button>
  );
};

export default Button;
