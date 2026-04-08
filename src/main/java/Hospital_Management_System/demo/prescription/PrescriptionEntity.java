package Hospital_Management_System.demo.prescription;

import Hospital_Management_System.demo.appointment.AppointmentEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import Hospital_Management_System.demo.doctor.DoctorEntity;
import jakarta.persistence.*;
import lombok.*;
import Hospital_Management_System.demo.patient.PatientEntity;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString

@Entity
public class PrescriptionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String diagnosis;

    private String notes;

    @JsonIgnore
    @ToString.Exclude

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private PatientEntity patient;
    @ToString.Exclude

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private DoctorEntity doctor;
    @ToString.Exclude

//    @JsonIgnore
//    @OneToMany(mappedBy = "prescription",
//            cascade = CascadeType.ALL,
//            orphanRemoval = true,
//            fetch = FetchType.LAZY)
//    private List<PrescriptionMedicine> medicines;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private AppointmentEntity appointment;


}

