---
name: project-large-feature-pass-jul2026
description: Comprehensive feature pass across all sections of DATAD — July 2026
metadata:
  type: project
---

Large feature pass completed July 2026. Changes made across:

**Registration**: Roll number field added (no restrictions) — User model, auth controller, RegisterPage.

**About page**: DATA story section added before T.A.D story (data facts grid, hook paragraph, turning-point section). Scroll-reveal animations on all sections (pillars, timeline milestones).

**Study Hub**: Motivational quote rotates on every refresh (12-quote pool). DailyCaseCard enhanced with category colors, "How to use" explainer, thinking hints toggle, and structured layout.

**Notes**: Attachment support added — PDF/doc/Excel/Drive link uploads. Mandatory custom subject field when "Other" selected. Backend upload endpoint via Cloudinary.

**Assignments (Work section)**: "New assignment" self-planning modal added directly in AssignmentsPage.

**Resources**: Folder-structure view grouping by subject. Clicking folder shows files inside. Centered "Add a new resource" block at bottom.

**Focus (StudyTools)**: Multi-mode Pomodoro (Focus/Short break/Long break). Pomodoro technique explainer toggle. Focus tips section. Better stats row.

**Career - Readiness**: Score=0 shows "Start now / Curious?" card instead of 0s. "Needs attention" section renamed to "Growth opportunities" and changed from red to indigo.

**Companies**: Data sources + transparency footer added to CompanyDetailPage with links to LinkedIn, Glassdoor, AmbitionBox, ET, Moneycontrol.

**Opportunities**: Replaced with "Upcoming Milestones" view showing drives + internships sorted by deadline.

**Resume**: Templates section added at bottom (6 design options, scroll-to from Templates button).

**Community Hub**: "Nostalgia Archive" renamed to "BatchVault". Discussions section replaced with "Feed" preview. Marketplace + Skills cards added to hub overview.

**Community navbar (workspaces.js)**: Added Marketplace + Skills tabs to community workspace tabs.

**Student Directory**: Roll number shown below name in cards and modal. Backend populate updated.

**Me Hub**: Personalised greeting, 3-stat summary row (due today/overdue/this week), uniform 2×2 feature card grid. Settings removed from Me tabs.

**Settings**: Gear icon added to AppShell header near the profile bell. Settings route still /me/settings.

**Wellbeing**: Subcategory tabs added (Breathing / Study Tips / Memory / Routines / Support) so each technique section is its own tab.

**Why:** User requested comprehensive feature improvements across all pages in one session.
**How to apply:** These are all live in the codebase. Admin corrections are next.
