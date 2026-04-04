package Hospital_Management_System.demo.medicine;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class MedicineRequestDto {
    @NotBlank
    private String name;

    private String description;

    private String manufacturer;

    @NotNull
    @Positive
    private double price;

    @NotNull
    @PositiveOrZero
    private int stock;


}
