import { useState, useEffect } from "react";
import PatientForm from "./components/PatientForm";
import PatientList from "./components/PatientList";

function App() {
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);

  // 🔹 Fetch patients
  useEffect(() => {
    fetch("http://localhost:8080/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data));
  }, []);

  // 🔹 ADD
  const addPatient = async (patient) => {
    const res = await fetch("http://localhost:8080/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    });

    const saved = await res.json();
    setPatients((prev) => [...prev, saved]);
  };

  // 🔹 DELETE
  const deletePatient = async (id) => {
    await fetch(`http://localhost:8080/patients/${id}`, {
      method: "DELETE",
    });

    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  // 🔹 START EDIT
  const startEdit = (patient) => {
    setEditingPatient(patient);
  };

  // 🔹 UPDATE (PUT)
  const updatePatient = async (updatedPatient) => {
    const res = await fetch(
      `http://localhost:8080/patients/${updatedPatient.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPatient),
      }
    );

    const saved = await res.json();

setPatients((prev) =>
  prev.map((p) =>
    p.id === updatedPatient.id ? updatedPatient : p
  )
);

setEditingPatient(null); // keep this

  };

const cancelEdit = () => {
  setEditingPatient(null);
};

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hospital Management System</h1>

      <PatientForm

  addPatient={addPatient}
  updatePatient={updatePatient}
  editingPatient={editingPatient}
  cancelEdit={cancelEdit}
        />

      <PatientList
        patients={patients}
        deletePatient={deletePatient}
        startEdit={startEdit}
      />
    </div>
  );
}

export default App;