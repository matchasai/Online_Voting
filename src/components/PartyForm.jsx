import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { addParty, updateParty } from "../services/api";
import Button from "./button";
import InputField from "./input";

const PartyForm = ({ party, onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [founder, setFounder] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [ideology, setIdeology] = useState("");
  const [symbol, setSymbol] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (party) {
      setName(party.name || "");
      setManifesto(party.manifesto || "");
      setFounder(party.founder || "");
      setFoundedYear(party.foundedYear || "");
      setIdeology(party.ideology || "");
      if (party.symbol) {
        // Handle both base64 and file path symbols
        if (party.symbol.startsWith("data:image")) {
          setPreview(party.symbol);
        } else if (party.symbol.startsWith("/uploads/")) {
          setPreview(`${import.meta.env.VITE_API_URL}${party.symbol}`);
        } else {
          setPreview(`data:image/png;base64,${party.symbol}`);
        }
      }
    } else {
      setName("");
      setManifesto("");
      setFounder("");
      setFoundedYear("");
      setIdeology("");
      setSymbol(null);
      setPreview(null);
    }
  }, [party]);

  const handleSymbolChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSymbol(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !manifesto || !founder || !foundedYear || !ideology) {
      toast.error("All fields are required.");
      return;
    }

    if (!party && !symbol) {
      toast.error("Party symbol is required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("manifesto", manifesto);
    formData.append("founder", founder);
    formData.append("foundedYear", foundedYear);
    formData.append("ideology", ideology);
    if (symbol) {
      formData.append("symbol", symbol);
    }

    try {
      if (party) {
        await updateParty(party._id, formData);
        toast.success("Party updated successfully!");
      } else {
        await addParty(formData);
        toast.success("Party created successfully!");
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Party Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter party name"
        required
      />
      <InputField
        label="Founder"
        value={founder}
        onChange={(e) => setFounder(e.target.value)}
        placeholder="Enter founder's name"
        required
      />
      <InputField
        label="Founded Year"
        type="number"
        value={foundedYear}
        onChange={(e) => setFoundedYear(e.target.value)}
        placeholder="Enter the year the party was founded"
        required
      />
      <InputField
        label="Ideology"
        value={ideology}
        onChange={(e) => setIdeology(e.target.value)}
        placeholder="Enter party ideology"
        required
      />
      <InputField
        label="Manifesto"
        value={manifesto}
        onChange={(e) => setManifesto(e.target.value)}
        placeholder="Enter party manifesto"
        required
      />
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Party Symbol</label>
        <InputField
          type="file"
          accept="image/*"
          onChange={handleSymbolChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
        />
        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Symbol Preview" className="h-20 w-20 object-contain border rounded-md" />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          label="Cancel"
        />
        <Button type="submit" label={party ? "Update" : "Create"} />
      </div>
    </form>
  );
};

export default PartyForm; 