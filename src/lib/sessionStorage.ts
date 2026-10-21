// Webben: Supabase använder webbläsarens egen localStorage när ingen lagring anges.
// (Mobilversionen ligger i sessionStorage.native.ts – Metro väljer rätt fil per plattform.)
export const authStorage = undefined;
