package Hospital_Management_System.demo.medicine;
import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class MedicineResponseDto {
    private Long id;
    private String name;
    private String manufacturer;
    private double price;
    private int stock;
}
