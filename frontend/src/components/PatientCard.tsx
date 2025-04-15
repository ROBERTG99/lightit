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
        <div className="patient-card" onClick={toggleExpand}>
            <div className="card-header">
                <img src={patient.photoURL} alt={`${patient.fullName}'s document`} className="photo" />
                <h3>{patient.fullName}</h3>
            </div>
            {expanded && (
                <div className="card-details">
                    <p><strong>Email:</strong> {patient.email}</p>
                    <p><strong>Phone:</strong> {patient.phoneCountry} {patient.phoneNumber}</p>
                </div>
            )}
        </div>
    );
};
export default PatientCard;
