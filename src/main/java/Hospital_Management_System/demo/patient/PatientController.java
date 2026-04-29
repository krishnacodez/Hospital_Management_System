package Hospital_Management_System.demo.patient;

import lombok.Getter;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("patients")
public class PatientController {
    private PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<?> createNewPatient(
            @Valid @RequestBody PatientEntity patient,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError fieldError : bindingResult.getFieldErrors()) {
                // Keep the first validation message per field (e.g., "Email is required"
                // instead of overriding with an additional pattern error for empty strings).
                errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        return ResponseEntity.ok(patientService.createNewPatient(patient));
    }

    @GetMapping
    public List<PatientEntity> getAllPatients(){
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public PatientEntity getPatientById(@PathVariable Long id){
        return patientService.getPatientById(id);
    }

    @DeleteMapping("/{id}")
    public void deletePatientById(@PathVariable Long id){
         patientService.deletePatientById(id);
    }


}

