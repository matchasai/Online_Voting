import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const AdminResults = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const savedDate = localStorage.getItem("resultsDate");
    const savedTime = localStorage.getItem("resultsTime");

    if (savedDate) setSelectedDate(savedDate);
    if (savedTime) setSelectedTime(savedTime);
  }, []);

  const saveResultsDateTime = () => {
    if (!selectedDate || !selectedTime) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select both date and time!",
      });
      return;
    }

    localStorage.setItem("resultsDate", selectedDate);
    localStorage.setItem("resultsTime", selectedTime);

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: `Results will be declared on ${selectedDate} at ${selectedTime}`,
      confirmButtonColor: "#3085d6",
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-300">
        Admin Results Management
      </h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <label className="block mb-2 font-semibold">
          Set Results Declaration Date:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
        />

        <label className="block mb-2 font-semibold">
          Set Results Declaration Time:
        </label>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-700 text-white"
        />

        <button
          onClick={saveResultsDateTime}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md w-full transition-all"
        >
          Save Date & Time
        </button>
      </div>
    </div>
  );
};

export default AdminResults;
