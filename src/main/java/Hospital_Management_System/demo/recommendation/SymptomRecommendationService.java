package Hospital_Management_System.demo.recommendation;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Rule-based symptom → specialization matching (no external AI).
 * Longer phrases are matched first to reduce accidental partial hits.
 */
@Service
public class SymptomRecommendationService {

    private static final String GENERAL = "General Physician";

    private record SymptomRule(String phrase, String specialization, int weight, String chipLabel) {}

    /** Rules ordered by phrase length descending before first use. */
    private static final List<SymptomRule> RULES = buildRules();

    private static List<SymptomRule> buildRules() {
        List<SymptomRule> list = new ArrayList<>();
        // Cardiologist
        add(list, "chest pain", "Cardiologist", 4, "chest pain");
        add(list, "heart pain", "Cardiologist", 4, "heart pain");
        add(list, "palpitations", "Cardiologist", 3, "palpitations");
        add(list, "hypertension", "Cardiologist", 3, "hypertension");
        add(list, "high bp", "Cardiologist", 3, "high bp");
        add(list, "blood pressure", "Cardiologist", 2, "blood pressure");
        add(list, "heart", "Cardiologist", 1, "heart");
        // Neurologist
        add(list, "memory loss", "Neurologist", 4, "memory loss");
        add(list, "severe headache", "Neurologist", 3, "severe headache");
        add(list, "headache", "Neurologist", 3, "headache");
        add(list, "migraine", "Neurologist", 3, "migraine");
        add(list, "dizziness", "Neurologist", 3, "dizziness");
        add(list, "seizure", "Neurologist", 4, "seizure");
        add(list, "numbness", "Neurologist", 2, "numbness");
        // Dermatologist
        add(list, "skin allergy", "Dermatologist", 4, "skin allergy");
        add(list, "skin rashes", "Dermatologist", 3, "skin rashes");
        add(list, "itching", "Dermatologist", 3, "itching");
        add(list, "redness", "Dermatologist", 2, "redness");
        add(list, "rash", "Dermatologist", 3, "rash");
        add(list, "acne", "Dermatologist", 3, "acne");
        // Pulmonologist
        add(list, "shortness of breath", "Pulmonologist", 4, "shortness of breath");
        add(list, "breathing difficulty", "Pulmonologist", 4, "breathing difficulty");
        add(list, "lung infection", "Pulmonologist", 4, "lung infection");
        add(list, "difficulty breathing", "Pulmonologist", 4, "difficulty breathing");
        add(list, "asthma", "Pulmonologist", 3, "asthma");
        add(list, "wheezing", "Pulmonologist", 3, "wheezing");
        add(list, "breathing", "Pulmonologist", 2, "breathing difficulty");
        add(list, "cough", "Pulmonologist", 2, "cough");
        // Orthopedic
        add(list, "joint pain", "Orthopedic", 4, "joint pain");
        add(list, "knee pain", "Orthopedic", 4, "knee pain");
        add(list, "back pain", "Orthopedic", 4, "back pain");
        add(list, "bone pain", "Orthopedic", 4, "bone pain");
        add(list, "fracture", "Orthopedic", 4, "fracture");
        add(list, "sprain", "Orthopedic", 2, "sprain");
        // Gastroenterologist
        add(list, "stomach pain", "Gastroenterologist", 4, "stomach pain");
        add(list, "digestion", "Gastroenterologist", 2, "digestion");
        add(list, "vomiting", "Gastroenterologist", 3, "vomiting");
        add(list, "acidity", "Gastroenterologist", 3, "acidity");
        add(list, "ulcer", "Gastroenterologist", 3, "ulcer");
        add(list, "nausea", "Gastroenterologist", 2, "nausea");
        // Ophthalmologist
        add(list, "blurry vision", "Ophthalmologist", 4, "blurry vision");
        add(list, "redness in eyes", "Ophthalmologist", 4, "redness in eyes");
        add(list, "vision loss", "Ophthalmologist", 4, "vision loss");
        add(list, "eye pain", "Ophthalmologist", 4, "eye pain");
        add(list, "eyesight", "Ophthalmologist", 2, "eyesight");
        // General Physician (weak signals — only if nothing else wins strongly)
        add(list, "body pain", "General Physician", 2, "body pain");
        add(list, "weakness", "General Physician", 2, "weakness");
        add(list, "fatigue", "General Physician", 2, "fatigue");
        add(list, "fever", "General Physician", 3, "fever");
        add(list, "cold", "General Physician", 2, "cold");
        // Pediatrician
        add(list, "pediatric", "Pediatrician", 3, "pediatric");
        add(list, "child", "Pediatrician", 2, "child");
        add(list, "infant", "Pediatrician", 3, "infant");
        add(list, "baby", "Pediatrician", 2, "baby");

        list.sort(Comparator.comparingInt((SymptomRule r) -> r.phrase.length()).reversed());
        return List.copyOf(list);
    }

    private static void add(
            List<SymptomRule> list,
            String phrase,
            String specialization,
            int weight,
            String chipLabel) {
        list.add(new SymptomRule(phrase.toLowerCase(Locale.ROOT), specialization, weight, chipLabel));
    }

    public RecommendDoctorResponseDto recommend(String rawSymptoms) {
        String normalized = normalize(rawSymptoms);
        if (normalized.length() < 3) {
            return RecommendDoctorResponseDto.builder()
                    .specialization(GENERAL)
                    .confidence("Low")
                    .matchedKeywords(List.of())
                    .message("No exact match found. Please consult a General Physician.")
                    .build();
        }

        Map<String, Integer> scores = new HashMap<>();
        Set<String> chips = new LinkedHashSet<>();
        /* Padded spaces so short tokens like "cold" do not match inside unrelated words */
        String working = " " + normalized + " ";

        for (SymptomRule rule : RULES) {
            String token = " " + rule.phrase + " ";
            if (working.contains(token)) {
                scores.merge(rule.specialization, rule.weight, Integer::sum);
                chips.add(rule.chipLabel);
                working = working.replace(token, "   ");
            }
        }

        int best = scores.values().stream().mapToInt(Integer::intValue).max().orElse(0);
        if (best == 0) {
            return RecommendDoctorResponseDto.builder()
                    .specialization(GENERAL)
                    .confidence("Low")
                    .matchedKeywords(List.of())
                    .message("No exact match found. Please consult a General Physician.")
                    .build();
        }

        String winner = pickWinner(scores);
        String confidence = resolveConfidence(scores, winner, best);
        String message = buildMessage(winner, confidence, chips.isEmpty());

        return RecommendDoctorResponseDto.builder()
                .specialization(winner)
                .confidence(confidence)
                .matchedKeywords(new ArrayList<>(chips))
                .message(message)
                .build();
    }

    private static String normalize(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9\\s]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static String pickWinner(Map<String, Integer> scores) {
        int max = scores.values().stream().mapToInt(Integer::intValue).max().orElse(0);
        List<String> top = scores.entrySet().stream()
                .filter(e -> e.getValue() == max)
                .map(Map.Entry::getKey)
                .sorted()
                .toList();
        if (top.size() == 1) {
            return top.get(0);
        }
        // Tie: prefer non–General Physician specialty if tied
        return top.stream()
                .filter(s -> !GENERAL.equals(s))
                .findFirst()
                .orElse(top.get(0));
    }

    private static String resolveConfidence(Map<String, Integer> scores, String winner, int bestScore) {
        int second = scores.entrySet().stream()
                .filter(e -> !e.getKey().equals(winner))
                .mapToInt(Map.Entry::getValue)
                .max()
                .orElse(0);
        int margin = bestScore - second;
        if (GENERAL.equals(winner) && bestScore <= 2) {
            return "Low";
        }
        if (bestScore >= 6 || (bestScore >= 4 && margin >= 2)) {
            return "High";
        }
        if (bestScore >= 3 || margin >= 1) {
            return "Medium";
        }
        return "Low";
    }

    private static String buildMessage(String specialization, String confidence, boolean noChips) {
        if (GENERAL.equals(specialization) && "Low".equals(confidence) && noChips) {
            return "No exact match found. Please consult a General Physician.";
        }
        return "Based on the symptoms, a " + specialization + " is recommended.";
    }
}
