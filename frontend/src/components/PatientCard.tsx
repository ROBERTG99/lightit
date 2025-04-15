import React, { useState } from 'react';
import { Patient } from '../types';
import './PatientCard.css';

interface PatientCardProps {
  patient: Patient;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '1rem',
        margin: '0.5rem 0',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
      onClick={toggleExpand}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={patient.photoURL}
          alt={`${patient.fullName}'s document`}
          style={{ width: 50, height: 50, borderRadius: '50%', marginRight: '1rem', objectFit: 'cover' }}
        />
        <h3 style={{ margin: 0 }}>{patient.fullName}</h3>
      </div>
      {expanded && (
        <div style={{ marginTop: '0.5rem' }}>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Phone:</strong> {patient.phoneCountry} {patient.phoneNumber}</p>
        </div>
      )}
    </div>
  );
};

export default PatientCard;
