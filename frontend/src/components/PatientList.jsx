function PatientList({ patients, deletePatient, startEdit }) {
  return (
    <div>
      <h2>Patients</h2>

      {patients.map((p) => (
        <div key={p.id}>
          {p.name} - {p.email}

          <button onClick={() => startEdit(p)}>
            Edit
          </button>

          <button onClick={() => deletePatient(p.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default PatientList;