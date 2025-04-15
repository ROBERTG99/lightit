import React, { useState, useRef } from 'react';
import { Patient } from '../types';
import Button from './Button';
import Modal from './Modal';

interface AddPatientModalProps {
  onClose: () => void;
  onAdded: (newPatient: Patient) => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ onClose, onAdded }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /@gmail\.com$/i;
  const phoneCountryRegex = /^\+?\d+$/;
  const phoneNumberRegex = /^\d+$/;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);
    setErrors(prev => ({
      ...prev,
      fullName: nameRegex.test(val) ? '' : 'Name must contain letters and spaces only.'
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setErrors(prev => ({
      ...prev,
      email: emailRegex.test(val) ? '' : 'Email must be a @gmail.com address.'
    }));
  };

  const handlePhoneCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhoneCountry(val);
    setErrors(prev => ({
      ...prev,
      phoneCountry: phoneCountryRegex.test(val) ? '' : 'Country code must be numeric (optionally starting with +).'
    }));
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhoneNumber(val);
    setErrors(prev => ({
      ...prev,
      phoneNumber: phoneNumberRegex.test(val) ? '' : 'Phone number must be numeric.'
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (!file.name.toLowerCase().endsWith('.jpg')) {
        setErrors(prev => ({ ...prev, photo: 'Only .jpg files are allowed.' }));
        setPhotoFile(null);
      } else {
        setErrors(prev => ({ ...prev, photo: '' }));
        setPhotoFile(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (dt.files && dt.files[0]) {
      const file = dt.files[0];
      if (!file.name.toLowerCase().endsWith('.jpg')) {
        setErrors(prev => ({ ...prev, photo: 'Only .jpg files are allowed.' }));
        setPhotoFile(null);
      } else {
        setErrors(prev => ({ ...prev, photo: '' }));
        setPhotoFile(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!nameRegex.test(fullName)) {
      newErrors.fullName = 'Name must contain letters and spaces only.';
    }
    if (!emailRegex.test(email)) {
      newErrors.email = 'Email must be a @gmail.com address.';
    }
    if (!phoneCountryRegex.test(phoneCountry) || !phoneCountry) {
      newErrors.phoneCountry = 'Country code must be numeric (optionally +).';
    }
    if (!phoneNumberRegex.test(phoneNumber) || !phoneNumber) {
      newErrors.phoneNumber = 'Phone number must be numeric.';
    }
    if (!photoFile) {
      newErrors.photo = 'Please select a .jpg photo.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    console.log('Submitting new patient:', { fullName, email, phoneCountry, phoneNumber, photoFile });
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phoneCountry', phoneCountry);
    formData.append('phoneNumber', phoneNumber);
    if (photoFile) formData.append('photo', photoFile);
    console.log('FormData about to be sent:', Array.from(formData.entries()));
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/patients`, {
        method: 'POST',
        body: formData,
      });
      console.log('POST /api/patients response:', response);
      const result = await response.json();
      if (response.ok) {
        setSubmitMessage('Patient added successfully!');
        const newPatient: Patient = {
          id: result.id,
          fullName,
          email,
          phoneCountry,
          phoneNumber,
          photoURL: result.photoURL,
        };
        onAdded(newPatient);
        setTimeout(() => {
          setSubmitMessage(null);
          setIsSubmitting(false);
          onClose();
        }, 1000);
      } else {
        const errorMsg = result.error || 'Failed to add patient.';
        setSubmitMessage(`Error: ${errorMsg}`);
      }
    } catch (error) {
      setSubmitMessage('Error: Could not submit form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={true} onClose={onClose}>
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>Add Patient</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Full Name:</label><br />
            <input type="text" value={fullName} onChange={handleNameChange} style={{ width: '100%' }} />
            {errors.fullName && <div style={{ color: 'red', fontSize: '0.85rem' }}>{errors.fullName}</div>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email (must be @gmail.com):</label><br />
            <input type="email" value={email} onChange={handleEmailChange} style={{ width: '100%' }} />
            {errors.email && <div style={{ color: 'red', fontSize: '0.85rem' }}>{errors.email}</div>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Phone:</label>
            <div style={{ display: 'flex', marginTop: '4px' }}>
              <input type="text" placeholder="+1" value={phoneCountry} onChange={handlePhoneCountryChange} style={{ width: '25%', marginRight: '0.5rem' }} />
              <input type="text" placeholder="1234567" value={phoneNumber} onChange={handlePhoneNumberChange} style={{ width: '75%' }} />
            </div>
            {errors.phoneCountry && <div style={{ color: 'red', fontSize: '0.85rem' }}>{errors.phoneCountry}</div>}
            {errors.phoneNumber && <div style={{ color: 'red', fontSize: '0.85rem' }}>{errors.phoneNumber}</div>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Document Photo (.jpg only):</label><br />
            <div onDrop={handleDrop} onDragOver={handleDragOver} style={{ border: '2px dashed #ccc', padding: '1rem', textAlign: 'center', marginTop: '4px' }}>
              {photoFile ? <p>Selected file: {photoFile.name}</p> : <p>Drag & drop a .jpg file here, or click below</p>}
              <input type="file" accept=".jpg" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} />
              <Button type="button" onClick={() => fileInputRef.current?.click()}>{photoFile ? 'Change Photo' : 'Choose Photo'}</Button>
            </div>
            {errors.photo && <div style={{ color: 'red', fontSize: '0.85rem' }}>{errors.photo}</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Add Patient'}</Button>
            <Button type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          </div>
        </form>
        {submitMessage && <div style={{ marginTop: '1rem', color: submitMessage.startsWith('Error') ? 'red' : 'green' }}>{submitMessage}</div>}
      </div>
    </Modal>
  );
};

export default AddPatientModal;
