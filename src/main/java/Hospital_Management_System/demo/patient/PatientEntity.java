package Hospital_Management_System.demo.patient;


//import com.krishna.demo.type.BloodGrouptype;
import Hospital_Management_System.demo.Insurance.InsuranceEntity;
import Hospital_Management_System.demo.appointment.AppointmentEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank(message = "Name is required")
    private String name;

    @Column(name = "birth_date")
    private LocalDate birthdate;

    @Column(unique = true)
    @NotBlank(message = "Email is required")
    @Pattern(regexp = "^.+@.+\\..+$", message = "Invalid email format")
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String gender;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group")
    private BloodGroupType bloodGroup;

    @ToString.Exclude

    @OneToOne(cascade = {CascadeType.MERGE, CascadeType.PERSIST
    },orphanRemoval = true,fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_insurance_id")
    private InsuranceEntity insurance;


    @JsonIgnore
    @OneToMany(
            mappedBy = "patient",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @ToString.Exclude
    private List<AppointmentEntity> appointments;
}
