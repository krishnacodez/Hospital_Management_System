package Hospital_Management_System.demo.appointment;

import Hospital_Management_System.demo.common.ApiResponse;
import Hospital_Management_System.demo.doctor.DoctorEntity;
import Hospital_Management_System.demo.doctor.DoctorRepository;
import Hospital_Management_System.demo.exception.ResourceNotFoundException;
import Hospital_Management_System.demo.patient.PatientEntity;
import Hospital_Management_System.demo.patient.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AppointmentService {
    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);
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
            PatientEntity patient = patientRepository.findById(dto.getPatientId()).orElseThrow(() -> new ResourceNotFoundException("patient not found"));


        DoctorEntity doctor = doctorRepository.findById(dto.getDoctorId()).orElseThrow(() -> new ResourceNotFoundException("doctor not found"));

        LocalDateTime appointmentTime = dto.getAppointmentTime() != null
                ? dto.getAppointmentTime()
                : LocalDateTime.now();
        AppointmentStatus status = dto.getStatus() != null
                ? dto.getStatus()
                : AppointmentStatus.PENDING;

        AppointmentEntity appointment = AppointmentEntity.builder()
                .doctor(doctor)
                .patient(patient)
                .reason(dto.getReason())
                .status(status)
                .appointmentTime(appointmentTime)
                .build();
        AppointmentEntity saved = appointmentRepository.save(appointment);
        log.info("Creating appointment for patientId: {} and doctorId: {}", dto.getPatientId(), dto.getDoctorId());
        return mapToDto(saved);

    }



    //get appointment by patient id

    public List<AppointmentResponseDto> getByPatient(Long patientId) {
        log.info("Fetching appointments for patientId: {}", patientId);
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



    // using pagination
    public ApiResponse<Map<String, Object>> getAllAppointment(int page, int size){

        Pageable pageable = PageRequest.of(page, size);

        Page<AppointmentEntity> appointments = appointmentRepository.findAll(pageable);

        List<AppointmentResponseDto> dtoList = appointments
                .stream()
                .map(this::mapToDto)
                .toList();

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("content", dtoList);
        responseData.put("page", appointments.getNumber());//page no
        responseData.put("totalPages", appointments.getTotalPages());//total pages
        responseData.put("totalElements", appointments.getTotalElements());

        return new ApiResponse<>(
                true,
                "Appointments fetched successfully",
                responseData
        );
    }

    public void deleteAppointmentById(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("appointment not found");
        }
        appointmentRepository.deleteById(id);
    }

    /**
     * Updates status with allowed transitions: PENDING → APPROVED → COMPLETED.
     */
    public void updateAppointmentStatus(Long id, String statusRaw) {
        if (statusRaw == null || statusRaw.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }
        AppointmentStatus newStatus;
        try {
            newStatus = AppointmentStatus.valueOf(statusRaw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid status value");
        }

        AppointmentEntity appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("appointment not found"));

        AppointmentStatus current = appointment.getStatus();
        if (current == AppointmentStatus.PENDING && newStatus != AppointmentStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "only APPROVED is allowed from PENDING");
        }
        if (current == AppointmentStatus.APPROVED && newStatus != AppointmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "only COMPLETED is allowed from APPROVED");
        }
        if (current == AppointmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "appointment is already completed");
        }

        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);
        log.info("Updated appointment {} status to {}", id, newStatus);
    }
}
