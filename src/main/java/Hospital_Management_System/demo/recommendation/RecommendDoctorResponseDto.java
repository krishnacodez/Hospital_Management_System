package Hospital_Management_System.demo.recommendation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendDoctorResponseDto {

    private String specialization;
    private String confidence;
    private List<String> matchedKeywords;
    private String message;
}
