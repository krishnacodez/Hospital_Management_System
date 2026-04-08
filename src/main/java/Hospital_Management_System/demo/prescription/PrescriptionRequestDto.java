package Hospital_Management_System.demo.prescription;


import lombok.Data;

import java.util.List;

@Data
public class PrescriptionRequestDto {

    private Long appointmentId;
    private String diagnosis;
    private String notes;

    private List<MedicineItemDto> medicines;

}
