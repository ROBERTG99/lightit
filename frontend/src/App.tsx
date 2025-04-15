import React, { useState } from 'react';
import PatientList from './components/PatientList';
import AddPatientModal from './components/AddPatientModal';
import { Patient } from './types';


function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };


  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', marginTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username:</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '200px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '200px' }}
          />
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}


function PatientPage() {
  const [showModal, setShowModal] = useState(false);

  const [refreshCount, setRefreshCount] = useState(0);


  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      fullName: 'John Doe',
      email: 'john.doe@gmail.com',
      phoneCountry: '+1',
      phoneNumber: '5551234',
      photoURL: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?cs=srgb&dl=pexels-andrewperformance1-697509.jpg&fm=jpg',
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      email: 'jane.smith@gmail.com',
      phoneCountry: '+44',
      phoneNumber: '7700123456',
      photoURL: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?cs=srgb&dl=pexels-pixabay-415829.jpg&fm=jpg',
    },
  ]);

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [...prev, newPatient]);
  };
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Patient Registry</h1>
      <button onClick={() => setShowModal(true)}>
        Add Patient
      </button>

      <PatientList refreshTrigger={refreshCount} />

      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onAdded={handleAddPatient}
        />
      )}
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('loggedIn') === 'true';
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('loggedIn', 'true');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }
  return <PatientPage />;
}

export default App;
