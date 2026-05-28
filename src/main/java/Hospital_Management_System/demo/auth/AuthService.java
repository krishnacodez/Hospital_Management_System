package Hospital_Management_System.demo.auth;

import Hospital_Management_System.demo.common.EmailUniquenessService;
import Hospital_Management_System.demo.patient.PatientEntity;
import Hospital_Management_System.demo.patient.PatientRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class AuthService {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final PatientRepository patientRepository;
    private final EmailUniquenessService emailUniquenessService;

    public AuthService(
            PatientRepository patientRepository,
            EmailUniquenessService emailUniquenessService) {
        this.patientRepository = patientRepository;
        this.emailUniquenessService = emailUniquenessService;
    }

    public PatientEntity registerPatient(PatientRegistrationRequestDto request) {
        String email = request.getEmail().trim().toLowerCase();
        emailUniquenessService.ensureEmailIsAvailable(email);

        PatientEntity patient = new PatientEntity();
        patient.setName(request.getName().trim());
        patient.setEmail(email);
        patient.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        patient.setGender(request.getGender().trim());
        patient.setPhone(request.getPhone().trim());
        patient.setBirthdate(LocalDate.now().minusYears(request.getAge()));

        return patientRepository.save(patient);
    }
}
