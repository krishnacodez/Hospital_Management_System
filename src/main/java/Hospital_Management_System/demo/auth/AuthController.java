package Hospital_Management_System.demo.auth;

import Hospital_Management_System.demo.common.ApiResponse;
import Hospital_Management_System.demo.patient.PatientEntity;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/patient")
    public ResponseEntity<ApiResponse<PatientEntity>> registerPatient(
            @Valid @RequestBody PatientRegistrationRequestDto request
    ) {
        PatientEntity patient = authService.registerPatient(request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Patient account created successfully", patient)
        );
    }
}
