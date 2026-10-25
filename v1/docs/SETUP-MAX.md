# Connect Max and real accounts

These are real provider integrations, not simulated sign-ins or model replies. The implementation was tested without live credentials, using explicitly labeled test transports for provider responses. Finish the steps below in your own Codespace/project before expecting live features.

## Free-only Max with OpenRouter

Create an OpenRouter account and an API key. Free models have provider-dependent limits and variable availability; a free text model may not support screenshots. Check current provider terms, data policies and model capabilities in your account before sending student information. No fixed quota or permanent free availability is promised.

In GitHub → Settings → Codespaces → Secrets, add these for this repository, or put them in an ignored `v1/.env`:

```dotenv
ACADIA_AI_PROVIDER=openrouter
ACADIA_AI_API_KEY=your-private-openrouter-key
ACADIA_AI_MODEL=openrouter/free
ACADIA_ALLOW_GUEST_AI=false
```

Never paste the key into chat, Git, a screenshot or any `NEXT_PUBLIC_` variable. An OpenAI key does not authenticate with OpenRouter.

OpenRouter mode accepts only `openrouter/free` or explicit model IDs ending in `:free`, and requests zero prompt/completion pricing with provider data collection denied. It has no paid model fallback. If no eligible free endpoint is available, the request fails clearly. The app does not turn on billing or switch to paid models. For screenshots, choose an available free model that supports image input; otherwise use manual entry. Test with fabricated/non-sensitive information first.

Authenticated users can use Max by default. For a **private Codespace preview only**, you may explicitly set `ACADIA_ALLOW_GUEST_AI=true` to test without account setup. Keep port 5173 private. This grants anyone who can access that preview use of the AI key; do not enable it on a public deployment. Single-process request limits apply (30 chats and 6 images per 15-minute window per user, with one shared guest bucket); they are not a distributed production limiter.

A deliberately chosen alternative is `ACADIA_AI_PROVIDER=openai`, an OpenAI key, and a supported model such as `gpt-4.1-mini`. That alternative can cost money. It is never an automatic fallback from OpenRouter.

Restart the Codespace or development server after setting secrets. Open **Ask Max**, review the data-sharing options, and send a question. A configured key is not proof it is valid; the first successful reply verifies your account's access. API errors never trigger fake replies.

## Supabase email, Google and database storage

1. Create a Supabase project. Run `supabase/migrations/202610250001_workspaces.sql` in its SQL editor. This creates the account-owned workspace table, enables/forces row-level security, and adds the revision-checked save function. No service-role key is used by this application.
2. Set the following Codespaces secrets, using the project's **public anon/publishable key**, never its service-role/secret key:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-project-key
```

3. In Supabase Authentication → URL Configuration, set the Site URL to the **forwarded app origin**, such as `https://YOUR-CODESPACE-5173.app.github.dev`. Add that exact origin followed by `/auth/callback` to Redirect URLs. For local testing add `http://localhost:5173/auth/callback` separately. Avoid broad production redirect wildcards. For non-Codespaces production, also set server `ACADIA_APP_ORIGIN` to the exact HTTPS app origin; Codespaces detects its own forwarded origin automatically.
4. Enable the email provider and appropriate email confirmations. Sign-up that requires confirmation says to check email; it does not pretend the user is signed in. Production email delivery/rate limits and password recovery need configuration before launch.
5. To enable Google, create Google OAuth credentials and configure Google's client ID/secret **inside Supabase's Google provider settings**, not the app. Google's authorized redirect URI is Supabase's provider callback (shown by Supabase, normally `https://YOUR-PROJECT.supabase.co/auth/v1/callback`). The Acadia callback in step 3 is a different URL. Ensure your Google test users/publishing status and any school-account administrator restrictions allow sign-in.
6. Restart the Codespace/server. Start at Acadia's welcome screen, create/confirm an email account or choose Google, then complete school setup and the goals/profile review. Account data is saved in Supabase; a guest browser planner is not silently merged into an account. Use validated export/import deliberately if you want to transfer it.
7. In a **disposable** development project, run `supabase/tests/isolation.sql` as the project database owner. It creates temporary test users within a rollback transaction and checks that one user cannot read/update/delete another user's workspace. Also test account A/B in separate browser profiles. These live database/auth checks could not be executed without project access in the execution environment.

`NEXT_PUBLIC_` values are embedded at build time. Set the public project URL/key before `npm run build` for production, not only after building. Never put a private API key there. Codespaces secrets do not automatically appear in an already-running process; restart.

Cloud saves use owner authentication on every request, runtime validation, RLS and optimistic revisions. A conflicting save stops rather than overwriting another tab; export on-screen changes and reload. Signing out resets the UI; guest and cloud data are kept separate. Deleting the cloud planner does not delete the Supabase authentication identity; use a reviewed identity-deletion workflow before a real student launch.

## Schoology and Alma

No official school API credentials/approval or integration documentation were supplied. These remain **not connected**, and Acadia does not collect school passwords. Do not assume Google login grants access to school records. Ask a school administrator for an approved sandbox, OAuth/API scopes, course/grade/calendar endpoints, consent requirements and a revocation policy before adding either connector.

Working fallback: school name, courses, periods, optional current grade text, recurring classes/clubs and manual assignments. Screenshot reading requires a configured, image-capable provider and explicit consent. Crop/redact identifiers first. Extraction is editable and never saved until approved. Unknown dates/times are not guessed. Acadia does not persist original images; the AI provider's retention terms still apply.

## Calendar, reminders, Max and data

- Calendar has Day/Week/Month/Year views; recurring classes/clubs block preparation schedules and AI task approval.
- Max sees goals/interests, recent chat, tasks and recurring commitments after consent. Course/grade sharing has a separate opt-in; name and school name are omitted automatically. Students can still type private information themselves, so avoid identifiers in messages.
- Last 40 chat messages persist with the planner; clear chat is available. Unapproved AI schedule proposals expire when leaving Ask Max. Approved sessions are conflict-checked, and past/unknown dates are refused.
- Browser alerts are opt-in while the app is open. In-app reminders remain available without notification permission. Closing the app stops these checks; no background push/email delivery is implemented.
- Completed existing tasks earn 10 coins once per task ID; reopening cannot farm coins. Feed Max for 5 coins or buy/equip gear. Coins are cosmetic, have no monetary value, and are not tamper-proof financial records.
- Existing v2 browser planners migrate to schema v3 with empty school/chat data and a new Max. JSON exports are now `acadia-planner-v3.json`. The browser storage key keeps its old name to preserve access. Legacy SQLite accounts remain untouched for recovery.

Before actual student use, obtain qualified review for age/consent, privacy, retention, AI-provider data terms, screenshot handling and school agreements. Review production auth recovery/deletion, notification delivery, access logging, distributed abuse protection and actual database policy tests. No compliance certification or educational outcome is claimed.
