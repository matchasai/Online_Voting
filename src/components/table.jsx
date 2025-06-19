const Table = ({ children, className }) => {
  return <table className={`min-w-full border ${className}`}>{children}</table>;
};

const Thead = ({ children, className }) => {
  return <thead className={`bg-gray-200 ${className}`}>{children}</thead>;
};

const Tbody = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

const Tr = ({ children, className }) => {
  return <tr className={`border-b ${className}`}>{children}</tr>;
};

const Th = ({ children, className }) => {
  return <th className={`p-3 font-semibold ${className}`}>{children}</th>;
};

const Td = ({ children, className }) => {
  return <td className={`p-3 ${className}`}>{children}</td>;
};

// Correctly export all components
export { Table, Tbody, Td, Th, Thead, Tr };

