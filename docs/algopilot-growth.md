# AlgoPilot growth work

## What changed

- Reframed the landing page around the real wedge: remembering solved patterns before interviews.
- Added a public `/demo` route with a sample review queue, due count, and streak so visitors can see value without an account.
- Added a branded `/signin` page and configured NextAuth to use it instead of the default auth screen.
- Signup validation and database failures now return a visible message instead of silently failing.
- Added metadata, Open Graph, and X card copy for shared links.
- Added a comparison section and an honest open-source maker section.

## Signed-in flow audit

| Flow | Current state | Follow-up |
| --- | --- | --- |
| Signup | Email/password works locally; prior server-action errors were not shown in the form. | Test a fresh production account and verify the row/session in the database. |
| Sign in | Credentials provider exists; the default NextAuth page was unbranded. | The branded page now reports invalid credentials and preserves the callback URL. |
| Onboarding | Track, daily goal, difficulty, reminders, and interview date are all on one page. | Reduce the first session to track + pace, then ask for optional settings later. |
| Problems | Public searchable library; signed-in users can log a solve and see due status. | Keep defaults in the solve modal and test the mobile layout with a real phone. |
| Reviews | Due, overdue, upcoming, track, and difficulty filters exist. | Add a single “start review” action and record review completion as an event. |
| Dashboard | Shows due work, weekly progress, recommendations, and a streak based on submissions. | Verify the empty state and the first-day path with a fresh account. |
| Analytics | Product analytics instrumentation is not present yet. | Add privacy-friendly events after choosing a provider and environment variables. |
| Profile/Roadmap | Existing pages cover progress and track selection. | Avoid expanding these until activation and retention are measured. |

## Production checks still required

These cannot be verified from the repository alone:

1. Create a fresh account on the deployed site and confirm the `User` row, JWT session, and redirect to onboarding.
2. Check Vercel environment variables for `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
3. Confirm the deployed schema contains the current Prisma models.
4. Inspect Vercel runtime logs while creating an account and signing in.
5. Test the same flow from a mobile browser and a second email address.

## Name options (approval required)

1. RecallTrack — recalltrack.in / recalltrack.dev
2. PatternLoop — patternloop.in / patternloop.dev
3. SolveAgain — solveagain.in / solveagain.dev
4. InterviewRecall — interviewrecall.in / interviewrecall.dev
5. PrepMemory — prepmemory.in / prepmemory.dev

Recommendation: **PatternLoop** is clear, memorable, and describes the solve-review cycle without the algo-trading collision. Do not rename the product until the creator checks trademark/domain availability and approves it.

## Four-week plan for the first 20 users

### Week 1: five guided users

- Invite five batchmates who already solve LeetCode problems; ask each to use the demo, sign up, choose a track, and log one solve while screen-sharing.
- Watch for: time to first problem, confusion about confidence/rating, whether the next action is obvious, and whether they understand why a review is scheduled.
- Check in on day 3 with the exact question: “Did you open the queue again? If not, what stopped you?”

### Week 2: fix the first-session bottleneck

- Make only the top two observed blockers easier.
- Invite five more students from a different preparation level.
- Track signup completion, first logged problem, and return on day 3; do not ask for positive testimonials.

### Week 3: run a seven-day batch challenge

- Invite ten students with a specific promise: use the queue for seven days, not “try my app”.
- Send one reminder with the due count and ask for a screenshot or one sentence about what was confusing.
- Watch whether reminders create useful returns or feel like noise.

### Week 4: retain the five who returned

- Interview every day-7 returner for 15 minutes.
- Ask what they would miss if AlgoPilot disappeared, what they still do in LeetCode/Sheets, and which review felt useful.
- Publish only verified observations; turn the strongest repeated workflow into the next small product change.

## Copy to send

### WhatsApp/Telegram

> I built a small free tool for the problem I keep having during interview prep: I solve a pattern, then forget it two weeks later. AlgoPilot gives you a curated track and brings problems back for short reviews before they fade.  
>  
> Would you use it for 7 days while preparing? I’ll check in on day 3 and day 7. Start here: https://algo-olive-one.vercel.app/demo  
>  
> I’m looking for honest feedback, not a compliment: where did you get stuck or lose interest?

### LinkedIn

> I kept solving coding interview problems and forgetting the patterns a few weeks later.  
>  
> So I built AlgoPilot: a free, open-source study loop for placement prep. You choose a curated track, log what happened during a real solve, and get a short review when that pattern is likely to fade.  
>  
> It is built for students who already use LeetCode or interview sheets but do not have a personal “what should I revisit today?” queue.  
>  
> I’m looking for 20 students to use it for seven days and tell me where the flow breaks. No fake testimonials or inflated launch numbers—just real feedback.  
>  
> Demo: https://algo-olive-one.vercel.app/demo  
> Source: https://github.com/Pointdexter37/Algo

### Reddit/Discord

> I built a small open-source tool after noticing that I could solve a problem once but not reliably recall the pattern later. AlgoPilot combines curated interview tracks with a review queue based on your own attempts.  
>  
> It is aimed at students preparing for placements/internships, and it is free. I’m not claiming it replaces LeetCode or a good sheet; the useful part is deciding what to revisit.  
>  
> If you try it, I’d value specific criticism about onboarding and the first review. Demo: https://algo-olive-one.vercel.app/demo  
> Source: https://github.com/Pointdexter37/Algo  
>  
> Follow each community’s self-promotion rules, use a weekly showcase/feedback thread where required, and do not repost the same message across communities.

### Product Hunt description

**AlgoPilot — remember the patterns you already solved**

I built AlgoPilot because I kept solving coding interview problems on LeetCode and forgetting the underlying pattern a few weeks later. It is a free, open-source study loop: choose a curated track, record a real attempt, and get a focused review queue when a problem deserves another look.

It is for students preparing for placements and internships who want more than a static sheet or an ever-growing solved count. AlgoPilot does not promise magic; it makes the next review easier to find.

### Product Hunt first comment

I’m a final-year B.Tech CSE student building this in public. The first version is intentionally small: curated tracks, honest solve logging, and SM-2 scheduling. I’m looking for feedback from people who already practice interview problems: what makes you return, and what makes you abandon a review queue?

Needed launch visuals: a 10-second demo of choosing a track and logging a solve; a dashboard screenshot showing due today and streak; a review card showing the problem and next action; and a mobile screenshot. Label all examples as sample data until they are real.

## Three-email onboarding sequence

### Email 1 — welcome

**Subject:** Your first AlgoPilot review takes one problem

Pick a track, solve one problem normally, and record how it actually went. AlgoPilot uses that attempt to decide when the pattern deserves another look. Start with one problem today: {{first_problem_url}}

### Email 2 — first review reminder

**Subject:** {{due_count}} problem(s) are ready for a short review

You do not need a full study session. Open the queue, try to recall the approach before looking at the solution, and rate how it felt. The goal is to keep the pattern available when an interview asks for it.

### Email 3 — day 7 check-in

**Subject:** What did you actually remember this week?

You have used AlgoPilot for seven days. Which review helped, and where did the flow slow you down? Reply with one honest sentence. If your queue is clear, choose the next problem from your track; if it is not, do the oldest due review first.

## Open questions

- Should the product remain AlgoPilot, or should we approve a new name before launch?
- Which reminder channel is acceptable first: email, Telegram, or a shareable WhatsApp link?
- Which analytics provider and data-retention policy are acceptable?
- Who is the maker name/photo to use in the public section?
- Should the first onboarding screen ask only for track + pace, with reminders moved to profile?
- Is a public username/pasted-list import worth adding now, or should it wait until the first 20 users?
