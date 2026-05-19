package Hospital_Management_System.demo.appointment;

import Hospital_Management_System.demo.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;


    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ApiResponse<AppointmentResponseDto> createApppointment(@Valid @RequestBody AppointmentRequestDto dto){

        AppointmentResponseDto response =  appointmentService.createAppointment(dto);

        return new ApiResponse<>(
                true,
                "appointment created successfully",
                response
        );

    }

    @GetMapping("/patient/{patientId}")

    public ApiResponse<List<AppointmentResponseDto>> getAppointmentByPatient(@PathVariable Long patientId){
        return new ApiResponse<>(
                true,
                "appointments fetched successfully",
                appointmentService.getByPatient(patientId)
    );
    }


    @GetMapping("/doctor/{doctorId}")

    public ApiResponse<List<AppointmentResponseDto>> getAppointmentByDoctor(@PathVariable Long doctorId){
        return new ApiResponse<>(
                true,
                "appointments fetched successfully",
                appointmentService.getByDoctor(doctorId)

        );

    }

    @GetMapping
    public ApiResponse<Map<String,Object>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ){
        return appointmentService.getAllAppointment(page,size);

    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointmentById(id);
        return new ApiResponse<>(true, "appointment deleted successfully", null);
    }

    @PatchMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body != null ? body.get("status") : null;
        appointmentService.updateAppointmentStatus(id, status);
    }

}
