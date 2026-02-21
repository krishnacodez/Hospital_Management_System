package medicine;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import prescription.PrescriptionMedicine;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"prescriptionMedicines"})
public class MedicineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false)
    private Double price;

    private String manufacturer;

    private LocalDate expiryDate;

    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "medicine", fetch = FetchType.LAZY)
    private List<PrescriptionMedicine> prescriptionMedicines;
}