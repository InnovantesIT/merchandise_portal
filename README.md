**Project Name**

Topline Portal

 **Version**
 
 v-1.0.0 

**Release Date**

31-Mar-2026
 
**Release Given By**

Gulchetan Singh (16046)
 
**Tested By**

Varun Sharma (16053)
 
**Issues/Enhancements**

1. Implement a redirect to the login page when the api receives 401 Unauthorized or 403 Forbidden responses. [Issue 5](https://github.com/InnovantesIT/merchandise_portal/issues/5)



**Database Changes**
 
**NO**,




**Configuration/ENV file changes**
 
**No**


**Impacted Files**


1. .gitignore
2. app/cart/page.tsx
3. app/components/BillingDetails.tsx
4. app/dealer-orders/page.tsx
5. app/lib/axiosInstance.ts
6. app/order-history/page.tsx
7. app/page.tsx
8. app/products/page.tsx
9. app/profile/page.tsx
10. package-lock.json




**Release Checklist**

1. None of the database connection strings should be hardcoded or exposed in code. - Yes
2. All 3rd-party API keys, tokens, and secrets must be stored in .env or configuration files only. - Yes
3. .env and configuration files must be excluded from the repository (.gitignore entry required). - Yes
4. Environment/config files should not be publicly accessible through hosting or build artifacts. - Yes
5. All user input must be validated and sanitized before processing. - Yes
6. No hardcoded URLs, IPs, or internal endpoints in the code. - Yes
7. Use parameterized queries/procedures (avoid raw SQL concatenation) to prevent SQL injection. - Yes
8. All API endpoints must be implemented with proper authentication and authorization checks. - Yes
9. Avoid logging sensitive data e.g. passwords, tokens, credit card details, etc. If any sensitive information is logged please mention the module. - Yes
10. Application should follow HTTPS communication. HTTP should force redirect to HTTPS. - Yes
11. Ensure CORS, CSRF, and XSS protection mechanisms are implemented. Yes
12. Robots.txt file must be added for all internal use projects. - No
    
 **Base Version**
 
  1f216d5

