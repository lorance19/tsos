/**
 * Removes undefined and null values from an object, keeping only defined values.
 * Useful for partial updates where you only want to update fields that are present.
 *
 * @param obj - The object to clean
 * @returns A new object with only defined (non-null, non-undefined) values
 *
 * @example
 * const data = { name: "John", age: undefined, email: null, phone: "123" };
 * const cleaned = removeUndefinedValues(data);
 * // Result: { name: "John", phone: "123" }
 */
export function removeUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: any = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            // Skip undefined and null values
            if (value === undefined || value === null) {
                continue;
            }

            // Recursively clean nested objects
            // @ts-ignore
            if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                const cleaned = removeUndefinedValues(value);
                // Only include nested object if it has keys
                if (Object.keys(cleaned).length > 0) {
                    result[key] = cleaned;
                }
            } else {
                result[key] = value;
            }
        }
    }

    return result;
}

/**
 * Prepares data for a partial Prisma update by removing undefined/null values
 * and separating nested relations that need special update syntax.
 *
 * @param data - The data object to prepare
 * @param nestedFields - Array of field names that are nested relations (e.g., ['address', 'profile'])
 * @returns Cleaned data object ready for Prisma update
 *
 * @example
 * const userData = { firstName: "John", lastName: undefined, address: { city: "NYC", zip: null } };
 * const prepared = preparePartialUpdate(userData, ['address']);
 * // For use in: prisma.user.update({ where: { id }, data: prepared })
 */
export function preparePartialUpdate<T extends Record<string, any>>(
    data: T,
    nestedFields: string[] = []
): Record<string, any> {
    const cleaned = removeUndefinedValues(data);
    const result: Record<string, any> = {};

    for (const key in cleaned) {
        if (cleaned.hasOwnProperty(key)) {
            const value = cleaned[key];

            // Handle nested relations with Prisma's upsert syntax
            if (nestedFields.includes(key) && typeof value === 'object') {
                result[key] = {
                    upsert: {
                        create: value,
                        update: value
                    }
                };
            } else {
                result[key] = value;
            }
        }
    }

    return result;
}