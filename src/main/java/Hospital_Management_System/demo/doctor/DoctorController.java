package Hospital_Management_System.demo.doctor;

import Hospital_Management_System.demo.patient.PatientEntity;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("doctors")
public class DoctorController {

    private DoctorService doctorService;

    public DoctorController(DoctorService doctorService){
        this.doctorService = doctorService;
    }


    @PostMapping
    public DoctorEntity createNewDoctor(@RequestBody DoctorEntity doctor){
        return doctorService.createNewDoctor(doctor);
    }

    @GetMapping
    public List<DoctorEntity> getAllDoctors(){
        return doctorService.getAllDoctors();
    }

    @GetMapping("/{id}")
    public DoctorEntity getDoctorById(@PathVariable Long id){
        return doctorService.getDoctorById(id);
    }
}
