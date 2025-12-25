import {Address} from "@prisma/client";

/**
 * AddressFormatter utility class for formatting addresses
 *
 * Provides various formatting options for address display
 *
 * Example usage:
 * ```typescript
 * const address = new AddressFormatter({
 *   street1: "123 Main Street",
 *   street2: "Suite 100",
 *   city: "Los Angeles",
 *   zip: "90001",
 *   country: "United States"
 * });
 * console.log(address.toFormattedString()); // "123 Main Street, Suite 100, Los Angeles, 90001, United States"
 * ```
 */
export class AddressFormatter {
    private readonly address: Omit<Address, 'id' | 'userId'>;

    constructor(address: Omit<Address, 'id' | 'userId'>) {
        this.address = address;
    }

    /**
     * Returns the address as a formatted single-line string
     *
     * Format: "street1, street2, city, zip, country"
     * Omits empty fields
     *
     * Examples:
     * - "123 Main Street, Suite 100, Los Angeles, 90001, United States"
     * - "456 Oak Ave, Seattle, 98101, United States" (no street2)
     */
    toFormattedString(): string {
        const parts: string[] = [];

        if (this.address.street1?.trim()) {
            parts.push(this.address.street1.trim());
        }

        if (this.address.street2?.trim()) {
            parts.push(this.address.street2.trim());
        }

        if (this.address.city?.trim()) {
            parts.push(this.address.city.trim());
        }

        if (this.address.zip?.trim()) {
            parts.push(this.address.zip.trim());
        }

        if (this.address.country?.trim()) {
            parts.push(this.address.country.trim());
        }

        return parts.join(', ');
    }

    /**
     * Returns the address as a multi-line string
     *
     * Format:
     * street1
     * street2
     * city, zip
     * country
     */
    toMultiLineString(): string {
        const lines: string[] = [];

        if (this.address.street1?.trim()) {
            lines.push(this.address.street1.trim());
        }

        if (this.address.street2?.trim()) {
            lines.push(this.address.street2.trim());
        }

        const cityZipParts: string[] = [];
        if (this.address.city?.trim()) {
            cityZipParts.push(this.address.city.trim());
        }
        if (this.address.zip?.trim()) {
            cityZipParts.push(this.address.zip.trim());
        }
        if (cityZipParts.length > 0) {
            lines.push(cityZipParts.join(', '));
        }

        if (this.address.country?.trim()) {
            lines.push(this.address.country.trim());
        }

        return lines.join('\n');
    }

    /**
     * Returns the raw address object
     */
    getRawAddress(): Omit<Address, 'id' | 'userId'> {
        return this.address;
    }
}

export default AddressFormatter;