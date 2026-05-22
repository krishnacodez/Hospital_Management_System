package Hospital_Management_System.demo.exception;

public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException() {
        super("Email already registered");
    }

    public DuplicateEmailException(String message) {
        super(message);
    }
}
