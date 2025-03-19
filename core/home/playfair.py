def generate_playfair_matrix(key):
    """Generates the 5x5 Playfair matrix using the given key."""
    key = key.upper().replace("J", "I")  # Convert key to uppercase & replace 'J' with 'I'
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"

    # Remove duplicates while maintaining order
    seen = set()
    matrix_string = "".join([char for char in key + alphabet if char not in seen and not seen.add(char)])

    # Convert to 5x5 matrix
    return [list(matrix_string[i:i + 5]) for i in range(0, 25, 5)]

def find_positions(matrix, char):
    """Finds the row and column of a character in the matrix."""
    for row_idx, row in enumerate(matrix):
        if char.upper() in row:  # Handle case-insensitive search
            return row_idx, row.index(char.upper())
    return None  # Should not happen if input text is valid

def prepare_text(text):
    """Prepares the text by removing spaces, converting to uppercase, and replacing 'J' with 'I'."""
    return text.upper().replace("J", "I")

def encrypt(text, key):
    """Encrypts a message using the Playfair cipher."""
    matrix = generate_playfair_matrix(key)
    original_text = text  # Keep the original text for case preservation
    text = prepare_text(text)
    encrypted_text = ""

    for i, char in enumerate(text):
        if char == " ":  # Preserve spaces in the output
            encrypted_text += " "
        else:
            row, col = find_positions(matrix, char)
            # Shift right in the row and preserve the original case
            encrypted_char = matrix[row][(col + 1) % 5]

            # Check the original case of the character
            if original_text[i].isupper():
                encrypted_text += encrypted_char.upper()
            else:
                encrypted_text += encrypted_char.lower()

    return encrypted_text

def decrypt(text, key):
    """Decrypts a Playfair-encrypted message."""
    matrix = generate_playfair_matrix(key)
    original_text = text  # Keep the original text for case preservation
    text = prepare_text(text)
    decrypted_text = ""

    for i, char in enumerate(text):
        if char == " ":  # Preserve spaces in the output
            decrypted_text += " "
        else:
            row, col = find_positions(matrix, char)
            decrypted_char = matrix[row][(col - 1) % 5]  # Shift left in the row

            # Check the original case of the character
            if original_text[i].isupper():
                decrypted_text += decrypted_char.upper()
            else:
                decrypted_text += decrypted_char.lower()

    return decrypted_text

