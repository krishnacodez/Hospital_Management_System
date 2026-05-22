package Hospital_Management_System.demo.prescription;


import Hospital_Management_System.demo.appointment.AppointmentEntity;
import Hospital_Management_System.demo.appointment.AppointmentRepository;
import Hospital_Management_System.demo.exception.ResourceNotFoundException;
import Hospital_Management_System.demo.medicine.MedicineEntity;
import Hospital_Management_System.demo.medicine.MedicineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionMedicineRepository prescriptionMedicineRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository, AppointmentRepository appointmentRepository, MedicineRepository medicineRepository, PrescriptionMedicineRepository prescriptionMedicineRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicineRepository = medicineRepository;
        this.prescriptionMedicineRepository = prescriptionMedicineRepository;
    }

    @Transactional
    public PrescriptionResponseDto createPrescription(PrescriptionRequestDto dto) {
        AppointmentEntity appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("appointment not found"));

        if (dto.getMedicines() == null || dto.getMedicines().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "At least one medicine is required");
        }

        if (prescriptionRepository.existsByAppointmentId(appointment.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Prescription already exists for this appointment");
        }

        PrescriptionEntity prescription = PrescriptionEntity.builder()
                .appointment(appointment)
                .doctor(appointment.getDoctor())
                .patient(appointment.getPatient())
                .diagnosis(dto.getDiagnosis())
                .notes(dto.getNotes())
                .build();

        PrescriptionEntity savedPrescription = prescriptionRepository.save(prescription);

        for (MedicineItemDto item : dto.getMedicines()) {
            MedicineEntity medicine = medicineRepository.findById(item.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("medicine not found"));

            if (medicine.getStock() < item.getQuantity()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Not enough stock for " + medicine.getName());
            }

            medicine.setStock(medicine.getStock() - item.getQuantity());
            medicineRepository.save(medicine);

            PrescriptionMedicine pm = PrescriptionMedicine.builder()
                    .medicine(medicine)
                    .prescription(savedPrescription)
                    .dosage(item.getDosage())
                    .quantity(item.getQuantity())
                    .build();

            prescriptionMedicineRepository.save(pm);
        }
        return mapToDto(savedPrescription);
    }


  private PrescriptionResponseDto mapToDto(PrescriptionEntity p){

    List<PrescriptionMedicineResponseDto> medicineDtos =
            p.getMedicines()
            .stream()
            .map(pm -> PrescriptionMedicineResponseDto.builder()
                    .medicineName(pm.getMedicine().getName())
                    .dosage(pm.getDosage())
                    .quantity(pm.getQuantity())
                    .build())
            .toList();

    return PrescriptionResponseDto.builder()
            .id(p.getId())
            .appointmentId(p.getAppointment() != null ? p.getAppointment().getId() : null)
            .createdAt(p.getCreatedAt())
            .patientName(p.getPatient().getName())
            .doctorName(p.getDoctor().getName())
            .diagnosis(p.getDiagnosis())
            .notes(p.getNotes())
            .medicines(medicineDtos)
            .build();
}

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDto> getAll() {
        return prescriptionRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDto> getByPatient(Long id) {
        return prescriptionRepository.findByPatientId(id).stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDto> getByDoctor(Long doctorId) {
        return prescriptionRepository.findByDoctor_Id(doctorId).stream().map(this::mapToDto).toList();
    }
}