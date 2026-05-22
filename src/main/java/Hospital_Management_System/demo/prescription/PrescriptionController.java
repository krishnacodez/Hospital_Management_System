package Hospital_Management_System.demo.prescription;

import Hospital_Management_System.demo.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public ApiResponse<PrescriptionResponseDto> create(@RequestBody @Valid PrescriptionRequestDto dto) {
        return new ApiResponse<>(
                true,
                "Prescription created",
                prescriptionService.createPrescription(dto)
        );
    }

    @GetMapping
    public ApiResponse<List<PrescriptionResponseDto>> getAll() {
        return new ApiResponse<>(true, "All prescriptions", prescriptionService.getAll());
    }

    @GetMapping("/patient/{id}")
    public ApiResponse<List<PrescriptionResponseDto>> getByPatient(@PathVariable Long id) {
        return new ApiResponse<>(true, "Patient prescriptions", prescriptionService.getByPatient(id));
    }

    @GetMapping("/doctor/{doctorId}")
    public ApiResponse<List<PrescriptionResponseDto>> getByDoctor(@PathVariable Long doctorId) {
        return new ApiResponse<>(true, "Doctor prescriptions", prescriptionService.getByDoctor(doctorId));
    }
}