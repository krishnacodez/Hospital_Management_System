package Hospital_Management_System.demo.medicine;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedicineRepository extends JpaRepository<MedicineEntity, Long> {

    Optional<MedicineEntity> findByName(String name);

}