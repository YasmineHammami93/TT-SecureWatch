import React, { useState } from 'react';

const PlaybookExecutor: React.FC<{ alertId: string }> = ({ alertId }) => {
  const [running, setRunning] = useState(false);

  const executePlaybook = async () => {
    setRunning(true);
    // Simulation of executing playbook
    setTimeout(() => {
      setRunning(false);
      alert('Playbook executed successfully');
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-2">Automated Actions</h3>
      <p className="text-sm text-gray-500 mb-4">Run predefined security playbooks for this alert.</p>
      <button
        onClick={executePlaybook}
        disabled={running}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
      >
        {running ? 'Executing...' : 'Run Incident Response'}
      </button>
    </div>
  );
};

export default PlaybookExecutor;
