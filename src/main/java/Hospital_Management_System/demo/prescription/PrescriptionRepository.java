package Hospital_Management_System.demo.prescription;

import Hospital_Management_System.demo.patient.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<PrescriptionEntity, Long> {

    List<PrescriptionEntity> findByPatient(PatientEntity patient);

}