/**
 * PhoneNumber utility class for validating and parsing phone numbers
 *
 * Supports international phone numbers with country codes (e.g., +1, +44, +95)
 *
 * Example usage:
 * ```typescript
 * const phone = new PhoneNumber("+1234567890");
 * if (phone.isValid()) {
 *   console.log(phone.getCountryCode()); // "+1"
 *   console.log(phone.toString()); // "+1234567890"
 * }
 * ```
 */
export class PhoneNumber {
    private readonly rawNumber: string;
    private readonly cleanNumber: string;

    constructor(phoneNumber: string) {
        this.rawNumber = phoneNumber;
        // Remove all non-digit characters except leading +
        this.cleanNumber = phoneNumber.trim().replace(/[^\d+]/g, '');
    }

    /**
     * Validates if the phone number is in a valid format
     *
     * Valid formats:
     * - Must start with + for international format
     * - Country code (1-3 digits after +)
     * - Followed by 7-15 digits
     * - Total length: 8-18 characters (including +)
     *
     * Examples:
     * - +1234567890 ✓
     * - +441234567890 ✓
     * - +959123456789 ✓
     * - 1234567890 ✗ (missing +)
     * - +1 ✗ (too short)
     */
    isValid(): boolean {
        // Phone number must start with + and be followed by digits
        if (!this.cleanNumber.startsWith('+')) {
            return false;
        }

        // Remove the + sign for length validation
        const numberWithoutPlus = this.cleanNumber.slice(1);

        // Must contain only digits after the +
        if (!/^\d+$/.test(numberWithoutPlus)) {
            return false;
        }

        // International phone numbers typically:
        // - Country code: 1-3 digits
        // - National number: 7-15 digits
        // - Total: 8-18 digits (not including +)
        const length = numberWithoutPlus.length;
        if (length < 8 || length > 18) {
            return false;
        }

        return true;
    }

    /**
     * Extracts the country code from the phone number
     *
     * Returns the country code with + prefix, or null if invalid
     *
     * Examples:
     * - "+1234567890" → "+1"
     * - "+441234567890" → "+44"
     * - "+959123456789" → "+95"
     */
    getCountryCode(): string | null {
        if (!this.isValid()) {
            return null;
        }

        // Common country code lengths: 1-3 digits
        // Try to extract country code intelligently
        const numberWithoutPlus = this.cleanNumber.slice(1);

        // Common single-digit country codes: +1 (US/Canada)
        if (numberWithoutPlus[0] === '1' && numberWithoutPlus.length >= 11) {
            return '+1';
        }

        // Try 3-digit country code first
        if (numberWithoutPlus.length >= 10) {
            const threeDigitCode = '+' + numberWithoutPlus.slice(0, 3);
            // Common 3-digit codes start with specific patterns
            if (numberWithoutPlus.startsWith('95')) { // Myanmar
                return '+95';
            }
        }

        // Try 2-digit country code
        if (numberWithoutPlus.length >= 9) {
            const twoDigitCode = '+' + numberWithoutPlus.slice(0, 2);
            // Common 2-digit codes
            const commonTwoDigitCodes = ['44', '49', '33', '39', '34', '81', '86', '91', '61', '55', '52', '27', '20', '65', '60', '66', '63'];
            if (commonTwoDigitCodes.includes(numberWithoutPlus.slice(0, 2))) {
                return twoDigitCode;
            }
        }

        // Default to 1-digit country code if nothing else matches
        return '+' + numberWithoutPlus[0];
    }

    /**
     * Returns the phone number as a formatted string
     *
     * Returns the cleaned phone number with + prefix
     *
     * Examples:
     * - new PhoneNumber("+1 (234) 567-890").toString() → "+1234567890"
     * - new PhoneNumber("+44 123 456 7890").toString() → "+441234567890"
     */
    toString(): string {
        return this.cleanNumber;
    }

    /**
     * Returns the original input string as provided
     */
    toRawString(): string {
        return this.rawNumber;
    }

    /**
     * Returns a formatted phone number for display
     *
     * Format depends on country code:
     * - +1: +1 (234) 567-890
     * - Others: +XX XXX XXX XXXX
     */
    toFormattedString(): string {
        if (!this.isValid()) {
            return this.rawNumber;
        }

        const countryCode = this.getCountryCode();
        if (!countryCode) {
            return this.cleanNumber;
        }

        const numberWithoutCountryCode = this.cleanNumber.slice(countryCode.length);

        // Format for US/Canada (+1)
        if (countryCode === '+1' && numberWithoutCountryCode.length === 10) {
            return `${countryCode} (${numberWithoutCountryCode.slice(0, 3)}) ${numberWithoutCountryCode.slice(3, 6)}-${numberWithoutCountryCode.slice(6)}`;
        }

        // Generic format for other countries
        // Group digits in sets of 3-4
        const parts: string[] = [];
        let remaining = numberWithoutCountryCode;

        while (remaining.length > 0) {
            if (remaining.length <= 4) {
                parts.push(remaining);
                break;
            }
            parts.push(remaining.slice(0, 3));
            remaining = remaining.slice(3);
        }

        return `${countryCode} ${parts.join(' ')}`;
    }

    /**
     * Static method to validate a phone number string without creating an instance
     */
    static isValidPhoneNumber(phoneNumber: string): boolean {
        return new PhoneNumber(phoneNumber).isValid();
    }

    /**
     * Static method to extract country code without creating an instance
     */
    static extractCountryCode(phoneNumber: string): string | null {
        return new PhoneNumber(phoneNumber).getCountryCode();
    }
}

export default PhoneNumber;