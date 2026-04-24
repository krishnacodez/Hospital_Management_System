package Hospital_Management_System.demo.prescription;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrescriptionMedicineDto {
    private String  name;
    private String dosage;
    private int quantity;

}
