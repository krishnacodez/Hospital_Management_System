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
import org.springframework.stereotype.Service;


import java.nio.file.ReadOnlyFileSystemException;
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

        AppointmentEntity appointment = AppointmentEntity.builder()
                .doctor(doctor)
                .patient(patient)
                .reason(dto.getReason())
                .status(AppointmentStatus.PENDING)
                .appointmentTime(LocalDateTime.now())
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
}
