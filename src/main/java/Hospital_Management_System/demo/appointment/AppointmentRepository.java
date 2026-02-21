package Hospital_Management_System.demo.appointment;

import Hospital_Management_System.demo.doctor.DoctorEntity;
import Hospital_Management_System.demo.patient.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Long> {

    List<AppointmentEntity> findByDoctor(DoctorEntity doctor);

    List<AppointmentEntity> findBypatient(PatientEntity patient);

}