package Hospital_Management_System.demo.medicine;


import Hospital_Management_System.demo.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/medicines")
@RestController
@CrossOrigin(origins = "*")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @PostMapping
    public ApiResponse<MedicineResponseDto> create(@RequestBody @Valid MedicineRequestDto dto){
        return new ApiResponse<>(true,"medicine created", medicineService.createMedicine(dto));
    }


    @GetMapping
    public ApiResponse<List<MedicineResponseDto>> getAll(){
        return new ApiResponse<>(true,"All medicines",medicineService.getAllMedicines());

    }
}
