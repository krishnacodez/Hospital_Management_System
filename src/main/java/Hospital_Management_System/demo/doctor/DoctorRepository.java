package Hospital_Management_System.demo.doctor;




import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<DoctorEntity, Long> {

    Optional<DoctorEntity> findByEmail(String email);

    List<DoctorEntity> findBySpecialization(String specialization);

}
