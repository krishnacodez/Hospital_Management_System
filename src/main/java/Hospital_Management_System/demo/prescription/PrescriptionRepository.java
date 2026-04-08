package Hospital_Management_System.demo.prescription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<PrescriptionEntity, Long> {

    List<PrescriptionEntity> findByPatientId(Long patient);

}