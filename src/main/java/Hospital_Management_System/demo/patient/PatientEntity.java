package Hospital_Management_System.demo.patient;


//import com.krishna.demo.type.BloodGrouptype;
import Hospital_Management_System.demo.Insurance.InsuranceEntity;
import Hospital_Management_System.demo.appointment.AppointmentEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@ToString
@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "same_name_and_birthdate",
                        columnNames = {"name", "birth_date"}
                )
        }
)
public class PatientEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "birth_date")
    private LocalDate birthdate;

    @Column(unique = true)
    private String email;

    private String gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group")
    private BloodGroupType bloodGroup;

    @ToString.Exclude

    @OneToOne(cascade = {CascadeType.MERGE, CascadeType.PERSIST
    },orphanRemoval = true,fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_insurance_id")
    private InsuranceEntity insurance;


    @JsonIgnore
    @OneToMany(mappedBy = "patient",cascade = {CascadeType.REMOVE},orphanRemoval = true)
    @ToString.Exclude
    private List<AppointmentEntity> appointmentEntities;
}
