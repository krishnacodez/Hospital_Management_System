package Hospital_Management_System.demo.login;

import Hospital_Management_System.demo.common.ApiResponse;
import Hospital_Management_System.demo.doctor.DoctorEntity;
import Hospital_Management_System.demo.doctor.DoctorRepository;
import Hospital_Management_System.demo.patient.PatientEntity;
import Hospital_Management_System.demo.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LoginService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Value("${hms.admin.email:admin@gmail.com}")
    private String adminEmail;

    public LoginService(DoctorRepository doctorRepository, PatientRepository patientRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Identifies the user by email. Password check is intentionally minimal (no JWT yet).
     */
    public ApiResponse<LoginResponseDto> login(LoginRequestDto request) {
        String email = request.getEmail().trim();
        String admin = adminEmail == null ? "" : adminEmail.trim();

        Optional<DoctorEntity> doctor = doctorRepository.findByEmail(email);
        if (doctor.isPresent()) {
            DoctorEntity d = doctor.get();
            LoginResponseDto data = LoginResponseDto.builder()
                    .role("DOCTOR")
                    .doctorId(d.getId())
                    .name(d.getName())
                    .build();
            return new ApiResponse<>(true, "Login successful", data);
        }

        Optional<PatientEntity> patient = patientRepository.findByEmail(email);
        if (patient.isPresent()) {
            PatientEntity p = patient.get();
            LoginResponseDto data = LoginResponseDto.builder()
                    .role("PATIENT")
                    .patientId(p.getId())
                    .name(p.getName())
                    .build();
            return new ApiResponse<>(true, "Login successful", data);
        }

        if (!admin.isEmpty() && email.equalsIgnoreCase(admin)) {
            LoginResponseDto data = LoginResponseDto.builder()
                    .role("ADMIN")
                    .build();
            return new ApiResponse<>(true, "Login successful", data);
        }

        return new ApiResponse<>(false, "Invalid credentials", null);
    }
}
