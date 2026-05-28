package Hospital_Management_System.demo.patient;

import Hospital_Management_System.demo.common.EmailUniquenessService;
import Hospital_Management_System.demo.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

@Service
public class PatientService {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final PatientRepository patientRepository;
    private final EmailUniquenessService emailUniquenessService;

    public PatientService(
            PatientRepository patientRepository,
            EmailUniquenessService emailUniquenessService) {
        this.patientRepository = patientRepository;
        this.emailUniquenessService = emailUniquenessService;
    }


    public PatientEntity createNewPatient(PatientEntity patient) {
        emailUniquenessService.ensureEmailIsAvailable(patient.getEmail());
        if (patient.getPassword() != null && !patient.getPassword().trim().isEmpty()) {
            patient.setPassword(passwordEncoder.encode(patient.getPassword().trim()));
        }
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
