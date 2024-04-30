import * as dotenv from 'dotenv'

dotenv.config()

/**
 * @param {string} name         Name of the environment variable.
 * @param {string} defaultValue Value to use if the variable isn't present.
 */
export function env (name: string, defaultValue?: string): string {

    const value = process.env[name];

    if (typeof value === 'string') {
        return value;
    }

    if (typeof defaultValue === 'string') {
        return defaultValue;
    }

    throw new Error(`Missing environment variable "${name}" and no default value argument present.`);

}