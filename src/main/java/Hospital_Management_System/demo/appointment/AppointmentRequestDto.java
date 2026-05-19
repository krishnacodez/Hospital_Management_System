package Hospital_Management_System.demo.appointment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentRequestDto {


    @NotNull(message = "Patient Id is required!")
    private Long patientId;

    @NotNull(message = "Doctor Id is required!")
    private Long doctorId;

    @NotBlank(message = "Reason cannot be empty!")
    private String reason;

    /** When null, the service uses the current date-time. */
    private LocalDateTime appointmentTime;

    /** When null, the service defaults to PENDING. */
    private AppointmentStatus status;

}
