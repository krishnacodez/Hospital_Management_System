package Hospital_Management_System.demo.appointment;

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
    public AppointmentResponseDto createApppointment(@RequestBody AppointmentRequestDto dto){
        return appointmentService.createAppointment(dto);
    }

    @GetMapping("/patient/{patientId}")

    public List<AppointmentResponseDto> getAppointmentByPatient(@PathVariable Long patientId){
        return appointmentService.getByPatient(patientId);
    }


    @GetMapping("/doctor/{doctorId}")

    public List<AppointmentResponseDto> getAppointmentByDoctor(@PathVariable Long doctorId){
        return appointmentService.getByDoctor(doctorId);

    }





}
