package Hospital_Management_System.demo.patient;

import Hospital_Management_System.demo.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {
    private PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }


    public PatientEntity createNewPatient(PatientEntity patient) {
        return patientRepository.save(patient);

    }

    public List<PatientEntity> getAllPatients() {
        return patientRepository.findAll();
    }

    public PatientEntity getPatientById(Long id) {
        return patientRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("patient not found with id "));

    }

        public void deletePatientById(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("patient not found with id ");
        }
         patientRepository.deleteById(id);


    }
}
