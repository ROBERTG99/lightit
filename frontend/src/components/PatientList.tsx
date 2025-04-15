import React, { useEffect, useState } from 'react';
import { Patient } from '../types';
import PatientCard from './PatientCard';

interface PatientListProps {
  refreshTrigger: any; 

}

const PatientList: React.FC<PatientListProps> = ({ refreshTrigger }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';


  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiUrl}/api/patients`);
        if (!res.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data: Patient[] = await res.json();
        setPatients(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [refreshTrigger]);

  if (loading) return <p>Loading patients...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      {patients.map((patient) => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
      {patients.length === 0 && (
        <p>No patients found.</p>
      )}
    </div>
  );
};

export default PatientList;
