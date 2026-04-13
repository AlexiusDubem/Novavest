# Firebase Setup

1. Copy [.env.local.example](./.env.local.example) to `.env.local`.
2. In Firebase Authentication, enable Email/Password sign-in.
3. In Firestore, create the database in production mode.
4. Paste the contents of [firestore.rules](./firestore.rules) into your Firestore Rules tab and publish.
5. Create your first admin account by signing up normally, then edit its user document in Firestore:
   `users/{uid}.role = "admin"`
6. Sign back in with that account and open `/control`.
7. If you want automatic admin assignment on signup, add `NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com` to `.env.local`.

## Collections Used

- `users`
- `wallets`
- `supportedAssets`
- `notifications`
- `transactions`
- `depositRequests`
- `withdrawalRequests`
- `loanRequests`
- `kycSubmissions`
- `supportTickets`
- `meta`

## Important Note

This app now uses Firestore directly from the client for admin approvals. The rules file is what prevents normal users from approving deposits, withdrawals, loans, or KYC items.
