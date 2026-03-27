package Hospital_Management_System.demo.appointment;

import Hospital_Management_System.demo.doctor.DoctorEntity;
import Hospital_Management_System.demo.doctor.DoctorRepository;
import Hospital_Management_System.demo.patient.PatientEntity;
import Hospital_Management_System.demo.patient.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class AppointmentService {
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;


    public AppointmentService(PatientRepository patientRepository, DoctorRepository doctorRepository, AppointmentRepository appointmentRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public AppointmentEntity createAppointment(AppointmentRequestDto dto) {
        PatientEntity patient = patientRepository.findById(dto.patientId).orElseThrow(() -> new RuntimeException("patient not found"));


        DoctorEntity doctor = doctorRepository.findById(dto.doctorId).orElseThrow(() -> new RuntimeException("doctor not found"));

        AppointmentEntity appointment = new AppointmentEntity();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setReason(dto.reason);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setAppointmentTime(LocalDateTime.now());

        return appointmentRepository.save(appointment);

    }

    public List<AppointmentEntity> getByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<AppointmentEntity> getByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);


    }
}
