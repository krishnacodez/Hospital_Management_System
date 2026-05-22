package Hospital_Management_System.demo.doctor;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService){
        this.doctorService = doctorService;
    }


    @PostMapping
    public DoctorEntity createNewDoctor(@RequestBody DoctorEntity doctor){
        System.out.println(doctor);
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

    @DeleteMapping("/{id}")
    public void deleteDoctorById(@PathVariable Long id){
        doctorService.deleteDoctorById(id);
    }
}
