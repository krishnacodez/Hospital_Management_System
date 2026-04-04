package Hospital_Management_System.demo.medicine;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }


    private MedicineResponseDto mapToDto(MedicineEntity m){
        return MedicineResponseDto.builder()
                .id(m.getId())
                .name(m.getName())
                .manufacturer(m.getManufacturer())
                .stock(m.getStock())
                .price(m.getPrice())
                .build();
    }



    public MedicineResponseDto createMedicine(MedicineRequestDto dto){
        MedicineEntity medicine = MedicineEntity.builder()
                .name(dto.getName())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .description(dto.getDescription())
                .manufacturer(dto.getManufacturer())
                .build();

        MedicineEntity saved = medicineRepository.save(medicine);

        return mapToDto(saved);
    }
    public List<MedicineResponseDto> getAllMedicines(){
        return medicineRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }



}
