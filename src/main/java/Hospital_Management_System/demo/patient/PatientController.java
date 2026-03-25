package Hospital_Management_System.demo.patient;

import lombok.Getter;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("patients")
public class PatientController {
    private PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public PatientEntity createNewPatient(@RequestBody PatientEntity patient ) {
    return patientService.createNewPatient(patient);
    }

    @GetMapping
    public List<PatientEntity> getAllPatients(){
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public PatientEntity getPatientById(@PathVariable Long id){
        return patientService.getPatientById(id);
    }


}

