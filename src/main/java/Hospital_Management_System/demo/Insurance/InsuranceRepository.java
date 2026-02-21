package Hospital_Management_System.demo.Insurance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface InsuranceRepository extends JpaRepository<InsuranceEntity, Long> {

    Optional<InsuranceEntity> findByPolicyNumber(String policyNumber);

}