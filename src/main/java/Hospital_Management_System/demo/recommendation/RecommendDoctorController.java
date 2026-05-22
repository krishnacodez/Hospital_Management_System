package Hospital_Management_System.demo.recommendation;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
public class RecommendDoctorController {

    private final SymptomRecommendationService symptomRecommendationService;

    public RecommendDoctorController(SymptomRecommendationService symptomRecommendationService) {
        this.symptomRecommendationService = symptomRecommendationService;
    }

    @PostMapping("/recommend-doctor")
    public RecommendDoctorResponseDto recommend(@Valid @RequestBody RecommendDoctorRequestDto body) {
        return symptomRecommendationService.recommend(body.getSymptoms());
    }
}
