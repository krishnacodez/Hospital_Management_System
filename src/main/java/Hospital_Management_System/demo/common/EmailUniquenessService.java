package Hospital_Management_System.demo.common;

import Hospital_Management_System.demo.doctor.DoctorRepository;
import Hospital_Management_System.demo.exception.DuplicateEmailException;
import Hospital_Management_System.demo.patient.PatientRepository;
import org.springframework.stereotype.Service;

@Service
public class EmailUniquenessService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public EmailUniquenessService(
            DoctorRepository doctorRepository,
            PatientRepository patientRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Ensures the email is not used by any doctor or patient (case-insensitive).
     */
    public void ensureEmailIsAvailable(String email) {
        if (email == null || email.trim().isEmpty()) {
            return;
        }
        String normalized = email.trim();
        if (doctorRepository.existsByEmailIgnoreCase(normalized)
                || patientRepository.existsByEmailIgnoreCase(normalized)) {
            throw new DuplicateEmailException();
        }
    }
}
