package Hospital_Management_System.demo.recommendation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RecommendDoctorRequestDto {

    @NotBlank(message = "Symptoms are required")
    @Size(min = 3, max = 2000, message = "Symptoms must be at least 3 characters")
    private String symptoms;
}
