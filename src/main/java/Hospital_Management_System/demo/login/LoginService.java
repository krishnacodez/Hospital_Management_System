package Hospital_Management_System.demo.login;

import Hospital_Management_System.demo.common.ApiResponse;
import Hospital_Management_System.demo.doctor.DoctorEntity;
import Hospital_Management_System.demo.doctor.DoctorRepository;
import Hospital_Management_System.demo.patient.PatientEntity;
import Hospital_Management_System.demo.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LoginService {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Value("${hms.admin.email:admin@gmail.com}")
    private String adminEmail;
    @Value("${hms.admin.password:admin123}")
    private String adminPassword;

    public LoginService(DoctorRepository doctorRepository, PatientRepository patientRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public ApiResponse<LoginResponseDto> login(LoginRequestDto request) {
        String email = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword() == null ? "" : request.getPassword().trim();
        String admin = adminEmail == null ? "" : adminEmail.trim();
        String adminSecret = adminPassword == null ? "" : adminPassword.trim();

        Optional<DoctorEntity> doctor = doctorRepository.findByEmailIgnoreCase(email);
        if (doctor.isPresent()) {
            DoctorEntity d = doctor.get();
            if (!passwordMatches(rawPassword, d.getPassword())) {
                return new ApiResponse<>(false, "Invalid credentials", null);
            }
            LoginResponseDto data = LoginResponseDto.builder()
                    .role("DOCTOR")
                    .doctorId(d.getId())
                    .name(d.getName())
                    .build();
            return new ApiResponse<>(true, "Login successful", data);
        }

        Optional<PatientEntity> patient = patientRepository.findByEmailIgnoreCase(email);
        if (patient.isPresent()) {
            PatientEntity p = patient.get();
            if (!passwordMatches(rawPassword, p.getPassword())) {
                return new ApiResponse<>(false, "Invalid credentials", null);
            }
            LoginResponseDto data = LoginResponseDto.builder()
                    .role("PATIENT")
                    .patientId(p.getId())
                    .name(p.getName())
                    .build();
            return new ApiResponse<>(true, "Login successful", data);
        }

        if (!admin.isEmpty()
                && !adminSecret.isEmpty()
                && email.equalsIgnoreCase(admin)
                && rawPassword.equals(adminSecret)) {
            LoginResponseDto data = LoginResponseDto.builder()
                    .role("ADMIN")
                    .build();
            return new ApiResponse<>(true, "Login successful", data);
        }

        return new ApiResponse<>(false, "Invalid credentials", null);
    }

    private boolean passwordMatches(String rawPassword, String storedHash) {
        if (storedHash == null || storedHash.trim().isEmpty()) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, storedHash);
    }
}
