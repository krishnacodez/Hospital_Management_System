package Hospital_Management_System.demo.appointment;

import Hospital_Management_System.demo.doctor.DoctorEntity;
import Hospital_Management_System.demo.doctor.DoctorRepository;
import Hospital_Management_System.demo.exception.ResourceNotFoundException;
import Hospital_Management_System.demo.patient.PatientEntity;
import Hospital_Management_System.demo.patient.PatientRepository;
import org.springframework.stereotype.Service;

import java.nio.file.ReadOnlyFileSystemException;
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


    //Create an appointment
    public AppointmentResponseDto createAppointment(AppointmentRequestDto dto) {
            PatientEntity patient = patientRepository.findById(dto.patientId).orElseThrow(() -> new ResourceNotFoundException("patient not found"));


        DoctorEntity doctor = doctorRepository.findById(dto.doctorId).orElseThrow(() -> new ResourceNotFoundException("doctor not found"));

        AppointmentEntity appointment = new AppointmentEntity();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setReason(dto.reason);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setAppointmentTime(LocalDateTime.now());

        AppointmentEntity saved = appointmentRepository.save(appointment);
        return mapToDto(saved);

    }



    //get appointment by patient id

    public List<AppointmentResponseDto> getByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }



    //get appointment by doctor id
    public List<AppointmentResponseDto> getByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::mapToDto)
                .toList();


    }

    // using dto by using manual mapping
    public AppointmentResponseDto mapToDto(AppointmentEntity appointment){
        AppointmentResponseDto dto = new AppointmentResponseDto();

        dto.id = appointment.getId();
        dto.doctorName = appointment.getDoctor().getName();
        dto.patientName = appointment.getPatient().getName();
        dto.reason = appointment.getReason();
        dto.status = appointment.getStatus().name();
        dto.appointmentTime = appointment.getAppointmentTime();

        return dto;
    }
}
