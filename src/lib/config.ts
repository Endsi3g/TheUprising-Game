
// Application Constants

// Validate Tenant ID format (UUID)
const isValidUUID = (uuid: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '00000000-0000-0000-0000-000000000001';

if (!isValidUUID(TENANT_ID)) {
    console.warn(`[Config] Invalid TENANT_ID format: ${TENANT_ID}. Using default.`);
}

export const APP_NAME = 'Salon AI';
