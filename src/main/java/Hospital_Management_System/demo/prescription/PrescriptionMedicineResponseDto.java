package Hospital_Management_System.demo.prescription;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrescriptionMedicineResponseDto {

    private String medicineName;
    private String dosage;
    private Integer quantity;
}
