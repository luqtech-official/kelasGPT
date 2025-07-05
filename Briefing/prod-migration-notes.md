## This Notes is for user to refer when development is completed and everything is ready for deployment to production.
## LLM are allowed to update this file accordingly based on analysed codebase to help make the user life much easier.

## SecurePay Integration
🔧 SecurePay Dashboard Configuration

URLs to Set:
Callback URL: http://localhost:3000/api/payment-callback
Redirect URL: http://localhost:3000/payment-status
Cancel URL: http://localhost:3000/payment-status?status=cancelled
Timeout URL: http://localhost:3000/payment-status?status=timeout

Other Settings:

Payment mode: merchant ✅ (correct)
FPX bank selection: dropdown ✅ (correct)
FPX B2C: Yes ✅ (correct)
FPX B2B1: No ✅ (correct)
Version: v1 ✅ (correct)

🔗 For Production (when you deploy):

When you deploy to production (e.g., Vercel), update these URLs to your live domain:
Callback URL: https://yourdomain.com/api/payment-callback
Redirect URL: https://yourdomain.com/payment-status
Cancel URL: https://yourdomain.com/payment-status?status=cancelled
Timeout URL: https://yourdomain.com/payment-status?status=timeout

## Supabase Integration


## Mailjet Integration


## CronJob integration

