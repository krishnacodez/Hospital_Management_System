package Hospital_Management_System.demo.doctor;

import Hospital_Management_System.demo.appointment.AppointmentEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import Hospital_Management_System.demo.department.DepartmentEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DoctorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false,length = 100)
    @NotBlank(message = "Name is required")
    private String name;
    @Column(length = 100)
    private String specialization;
    @Column(nullable = false, unique = true, length = 100)
    @Email(message = "Invalid email")
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @ToString.Exclude
    @JsonIgnore
    @ManyToMany(mappedBy = "doctors",fetch = FetchType.LAZY)
    @Builder.Default
    private Set<DepartmentEntity> departments = new HashSet<>();

    @ToString.Exclude

    @JsonIgnore
    @OneToMany(mappedBy = "doctor",fetch = FetchType.LAZY)
    @Builder.Default
    private List<AppointmentEntity> appointments = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean available = true;

    @PrePersist
    @PreUpdate
    private void applyDefaults() {
        if (available == null) {
            available = true;
        }
        if (email == null || email.trim().isEmpty()) {
            email = "doc" + System.currentTimeMillis() + "@test.com";
        }
    }

}
