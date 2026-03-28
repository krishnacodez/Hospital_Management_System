package Hospital_Management_System.demo.appointment;




import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({
        "id",
        "patientName",
        "doctorName",
        "reason",
        "status",
        "appointmentTime"
})
public class AppointmentResponseDto {
    public Long id;
    public String patientName;
    public String doctorName;
    public String status;
    public String reason;
    public LocalDateTime appointmentTime;
}
