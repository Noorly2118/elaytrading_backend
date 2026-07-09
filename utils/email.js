import { createRequire } from "module";
const require = createRequire(import.meta.url);
const brevo = require("@getbrevo/brevo");

console.log("=== BREVO DEBUG ===");
console.log("Top-level keys:", Object.keys(brevo));
console.log("Has default?", "default" in brevo);
if (brevo.default) {
  console.log("Keys under .default:", Object.keys(brevo.default));
}
console.log("Type of TransactionalEmailsApi:", typeof brevo.TransactionalEmailsApi);
console.log("=== END BREVO DEBUG ===");

const { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } = brevo;