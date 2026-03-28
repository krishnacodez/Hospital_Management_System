package Hospital_Management_System.demo.appointment;

import Hospital_Management_System.demo.common.ApiResponse;
import jakarta.validation.Valid;
import org.hibernate.cfg.Compatibility;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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





}
