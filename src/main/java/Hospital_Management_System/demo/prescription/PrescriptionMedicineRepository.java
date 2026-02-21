package Hospital_Management_System.demo.prescription;

import org.springframework.data.jpa.repository.JpaRepository;


public interface PrescriptionMedicineRepository extends JpaRepository<PrescriptionMedicine, Long> {
}