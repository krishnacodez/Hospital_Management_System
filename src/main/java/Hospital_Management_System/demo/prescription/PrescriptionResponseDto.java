package Hospital_Management_System.demo.prescription;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PrescriptionResponseDto {

    private Long id;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private String notes;


    private List<PrescriptionMedicineDto> medicines;


}
