package patient;


//import com.krishna.demo.type.BloodGrouptype;
import appointment.AppointmentEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@ToString(exclude = {"appointments","insurance"})
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
    private BloodGrouptype bloodGroup;


    @OneToOne(cascade = {CascadeType.MERGE, CascadeType.PERSIST
    },orphanRemoval = true,fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_insurance_id")
    private Insurance insurance;

    @JsonIgnore
    @OneToMany(mappedBy = "patientEntity",cascade = {CascadeType.REMOVE},orphanRemoval = true)
    @ToString.Exclude
    private List<AppointmentEntity> appointmentEntities;
}
