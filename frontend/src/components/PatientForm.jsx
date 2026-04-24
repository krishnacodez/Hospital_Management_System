import { useState, useEffect } from "react";

function PatientForm({ addPatient, updatePatient, editingPatient,cancelEdit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 🔹 When editing → fill form
  useEffect(() => {
    if (editingPatient) {
      setName(editingPatient.name);
      setEmail(editingPatient.email);
    }
else{
    setEmail("")
    setName("")
    }
  }, [editingPatient]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const patientData = {
      id: editingPatient?.id,
      name,
      email,
      birthdate: "2000-01-01",
      gender: "MALE",
      bloodGroup: "O_POSITIVE",
    };

    if (editingPatient) {
      updatePatient(patientData); // PUT
    } else {
      addPatient(patientData); // POST
    }


  };

  return (
    <div>
      <h2>{editingPatient ? "Edit Patient" : "Add Patient"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {editingPatient && (
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}

        <button type="submit">
          {editingPatient ? "Update" : "Add"}
        </button>


      </form>
    </div>
  );
}

export default PatientForm;