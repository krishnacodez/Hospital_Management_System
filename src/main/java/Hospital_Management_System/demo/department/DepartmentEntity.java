package Hospital_Management_System.demo.department;


import com.fasterxml.jackson.annotation.JsonIgnore;
import Hospital_Management_System.demo.doctor.DoctorEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class DepartmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true,length = 100)
    private String name;


    @ToString.Exclude

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "head_doctor_id")
    private DoctorEntity headDoctor;

    @JsonIgnore
    @ManyToMany
    @ToString.Exclude


    @JoinTable(
            name="my_dept_doctors",
            joinColumns = @JoinColumn(name = "dpt_id"),
            inverseJoinColumns = @JoinColumn(name="doctor_id")
    )
    private Set<DoctorEntity>doctors = new HashSet<>();
}
