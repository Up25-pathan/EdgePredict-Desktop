import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';

const ReportsPage = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const response = await api.getSimulations();
        const sortedSimulations = response.data.sort((a, b) => b.id - a.id);
        setSimulations(sortedSimulations);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch simulations:", err);
        setError("Could not load simulation data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="ml-4 text-gray-400">Loading Simulations...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Simulation Reports</h1>
      {simulations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim) => (
            <Card key={sim.id} className="hover:border-indigo-500 transition-all duration-300">
              <div className="p-5">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-white">
                  {sim.name} (ID: {sim.id})
                </h5>
                <p className="mb-3 font-normal text-gray-400">
                  {sim.description}
                </p>
                <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        sim.status === 'COMPLETED' ? 'bg-green-600 text-white' :
                        sim.status === 'FAILED' ? 'bg-red-600 text-white' :
                        'bg-yellow-500 text-black'
                    }`}>
                        {sim.status}
                    </span>
                  <Link
                    to={`/simulation/${sim.id}`}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300"
                  >
                    View Results
                    <svg className="w-4 h-4 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">No simulations found. Run one from the Simulation Setup page!</p>
      )}
    </div>
  );
};

export default ReportsPage;