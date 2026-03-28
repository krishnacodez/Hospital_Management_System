package Hospital_Management_System.demo.appointment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AppointmentRequestDto {


    @NotNull(message = "Patient Id is required!")
    public Long patientId;

    @NotNull(message = "Doctor Id is required!")
    public Long doctorId;

    @NotBlank(message = "Reason cannot be empty!")
    public String reason;

}
