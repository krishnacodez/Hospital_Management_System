package Hospital_Management_System.demo.doctor;

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
        return doctorRepository.save(doctorEntity);

    }

    public List<DoctorEntity> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public DoctorEntity getDoctorById(Long id) {
        return doctorRepository.findById(id).orElseThrow(()-> new RuntimeException("doctor not found"));
    }
}
