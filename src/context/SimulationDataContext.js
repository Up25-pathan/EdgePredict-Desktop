import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Correct: imports the real api

const SimulationDataContext = createContext();

export const useSimulationData = () => useContext(SimulationDataContext);

export const SimulationDataProvider = ({ children }) => {
  // Renamed 'reports' to 'simulations' for consistency
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Renamed function for clarity
    const fetchSimulations = async () => {
      try {
        // FIX: Changed api.getReports() to api.getSimulations()
        const response = await api.getSimulations();
        setSimulations(response.data);
      } catch (error) {
        console.error("Failed to fetch simulations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSimulations();
  }, []); // Empty dependency array means this runs once on mount

  // Renamed function for clarity
  const getSimulationById = (id) => {
    // Ensure we are comparing numbers to numbers for a reliable find
    const simId = parseInt(id, 10);
    return simulations.find(sim => sim.id === simId);
  };

  // Updated the value provided by the context
  const value = { simulations, loading, getSimulationById };

  return (
    <SimulationDataContext.Provider value={value}>
      {children}
    </SimulationDataContext.Provider>
  );
};