package Hospital_Management_System.demo.doctor;

import Hospital_Management_System.demo.exception.ResourceNotFoundException;
import Hospital_Management_System.demo.patient.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class DoctorService {
    private DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository,
                         PatientRepository patientRepository){
        this.doctorRepository = doctorRepository;

    }

    public DoctorEntity createNewDoctor(DoctorEntity doctorEntity){
        if (doctorEntity.getAvailable() == null) {
            doctorEntity.setAvailable(true);
        }
        if (doctorEntity.getEmail() == null || doctorEntity.getEmail().trim().isEmpty()) {
            doctorEntity.setEmail("doc" + System.currentTimeMillis() + "@test.com");
        }
        return doctorRepository.save(doctorEntity);

    }

    public List<DoctorEntity> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public DoctorEntity getDoctorById(Long id) {
        return doctorRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("doctor not found"));
    }

    public void deleteDoctorById(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("doctor not found");
        }
        doctorRepository.deleteById(id);
    }
}
