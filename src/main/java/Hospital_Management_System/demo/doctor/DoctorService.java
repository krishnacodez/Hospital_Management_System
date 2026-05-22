package Hospital_Management_System.demo.doctor;

import Hospital_Management_System.demo.common.EmailUniquenessService;
import Hospital_Management_System.demo.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final EmailUniquenessService emailUniquenessService;

    public DoctorService(
            DoctorRepository doctorRepository,
            EmailUniquenessService emailUniquenessService) {
        this.doctorRepository = doctorRepository;
        this.emailUniquenessService = emailUniquenessService;
    }

    public DoctorEntity createNewDoctor(DoctorEntity doctorEntity){
        if (doctorEntity.getAvailable() == null) {
            doctorEntity.setAvailable(true);
        }
        if (doctorEntity.getEmail() == null || doctorEntity.getEmail().trim().isEmpty()) {
            doctorEntity.setEmail("doc" + System.currentTimeMillis() + "@test.com");
        } else {
            emailUniquenessService.ensureEmailIsAvailable(doctorEntity.getEmail());
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
