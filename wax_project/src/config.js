// === SAAS Config ===
export const SAAS_CONFIG = {
    DEFAULT_CAR_WASH_ID: 1,
    FREE_MONTHS: 1,
};

export function getCarWashId() {
    // Later this can parse subdomain (e.g. wash1.chistoapp.ru)
    return SAAS_CONFIG.DEFAULT_CAR_WASH_ID;
}
