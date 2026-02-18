package doctor;

import appointment.AppointmentEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@ToString(exclude = {"appointments","departments"})
@AllArgsConstructor
@NoArgsConstructor
public class DoctorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false,length = 100)
    private String name;
    @Column(length = 100)
    private String specialization;
    @Column(nullable = false,unique = true,length = 100)
    private String email;

    @ManyToMany(mappedBy = "doctors",fetch = FetchType.LAZY)
    private Set<Department> departments = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "doctor",fetch = FetchType.LAZY)
    private List<AppointmentEntity  > appointments = new ArrayList<>();

    @Column(nullable = false)
    private boolean available = true;

}
