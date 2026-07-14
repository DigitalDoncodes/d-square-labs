import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { PWAProvider } from './context/PWAContext';
import InstallPrompt from './components/pwa/InstallPrompt';
import OfflineBanner from './components/pwa/OfflineBanner';
import UpdateBanner from './components/pwa/UpdateBanner';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import WorkspaceLayout from './components/layout/WorkspaceLayout';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';
import { UPCOMING_FEATURES } from './utils/upcomingFeatures';
import { UPCOMING_WORKSPACE, upcomingPath } from './utils/workspaces';

// Route-level code splitting: each page loads on demand, keeping the initial
// bundle small. Vite emits one chunk per page.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const NotesListPage = lazy(() => import('./pages/NotesListPage'));
const NoteDetailPage = lazy(() => import('./pages/NoteDetailPage'));
const NoteEditorPage = lazy(() => import('./pages/NoteEditorPage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const FinanceHubPage        = lazy(() => import('./pages/me/FinanceHubPage'));
const FinanceOverviewPage   = lazy(() => import('./pages/me/FinanceOverviewPage'));
const FinanceTrackerPage    = lazy(() => import('./pages/me/FinanceTrackerPage'));
const FinanceCalculatorPage = lazy(() => import('./pages/me/FinanceCalculatorPage'));
const FinanceLearnPage      = lazy(() => import('./pages/me/FinanceLearnPage'));
const IntelligencePage = lazy(() => import('./pages/IntelligencePage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const ResumePreviewPage = lazy(() => import('./pages/ResumePreviewPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminStudentsPage = lazy(() => import('./pages/admin/AdminStudentsPage'));
const AdminStudioPage = lazy(() => import('./pages/admin/AdminStudioPage'));
const AdminStudioReviewPage = lazy(() => import('./pages/admin/AdminStudioReviewPage'));
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncementsPage'));
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'));
const AdminReferralsPage = lazy(() => import('./pages/admin/AdminReferralsPage'));
const AdminArchivePage = lazy(() => import('./pages/admin/AdminArchivePage'));
const AdminCompaniesPage = lazy(() => import('./pages/admin/AdminCompaniesPage'));
const AdminCasesPage = lazy(() => import('./pages/admin/AdminCasesPage'));
const AdminAutomationPage = lazy(() => import('./pages/admin/AdminAutomationPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('./pages/CompanyDetailPage'));
const CreatorPage = lazy(() => import('./pages/CreatorPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const EntertainmentDetailPage = lazy(() => import('./pages/EntertainmentDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SubscribePage = lazy(() => import('./pages/SubscribePage'));
const AdminSubscriptionsPage = lazy(() => import('./pages/admin/AdminSubscriptionsPage'));
const StudyHubPage = lazy(() => import('./pages/study/StudyHubPage'));
const WellbeingPage         = lazy(() => import('./pages/me/WellbeingPage'));
const WellbeingStudyPage    = lazy(() => import('./pages/me/WellbeingStudyPage'));
const WellbeingMemoryPage   = lazy(() => import('./pages/me/WellbeingMemoryPage'));
const WellbeingRoutinesPage = lazy(() => import('./pages/me/WellbeingRoutinesPage'));
const WellbeingSupportPage  = lazy(() => import('./pages/me/WellbeingSupportPage'));
const WorkPage = lazy(() => import('./pages/study/WorkPage'));
const ReadinessPage = lazy(() => import('./pages/career/ReadinessPage'));
const OpportunitiesPage = lazy(() => import('./pages/career/OpportunitiesPage'));
const InterviewQuestionsPage = lazy(() => import('./pages/career/InterviewQuestionsPage'));
const CommunityHubPage  = lazy(() => import('./pages/community/CommunityHubPage'));
const AnnouncementsPage = lazy(() => import('./pages/community/AnnouncementsPage'));
const StreamPage        = lazy(() => import('./pages/community/StreamPage'));
const MemoriesPage      = lazy(() => import('./pages/community/MemoriesPage'));
const DirectoryPage     = lazy(() => import('./pages/community/DirectoryPage'));
const EventsPage        = lazy(() => import('./pages/community/EventsPage'));
const MarketplacePage   = lazy(() => import('./pages/community/MarketplacePage'));
const MeHubPage         = lazy(() => import('./pages/me/MeHubPage'));
const SubjectPage       = lazy(() => import('./pages/study/SubjectPage'));
const ResourcesPage     = lazy(() => import('./pages/study/ResourcesPage'));
const StudyToolsPage    = lazy(() => import('./pages/study/StudyToolsPage'));
const SkillExchangePage = lazy(() => import('./pages/career/SkillExchangePage'));
const AdminAICenterPage = lazy(() => import('./pages/admin/AdminAICenterPage'));
const PivotPage         = lazy(() => import('./pages/career/PivotPage'));
const StarStoriesPage   = lazy(() => import('./pages/career/StarStoriesPage'));
const FinanceROIPage    = lazy(() => import('./pages/me/FinanceROIPage'));

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppLayout() {
  return (
    <ProtectedRoute>
      <SubscriptionProvider>
      <AppShell>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </AppShell>
      </SubscriptionProvider>
    </ProtectedRoute>
  );
}

// "/" — the startup page for visitors; the daily dashboard once logged in.
function HomeGate() {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  return (
    <SubscriptionProvider>
      <AppShell>
        <ErrorBoundary>
          <DashboardPage />
        </ErrorBoundary>
      </AppShell>
    </SubscriptionProvider>
  );
}

// Old top-level URLs keep working: strip the legacy prefix, keep the rest.
function LegacyRedirect({ from, to }) {
  const location = useLocation();
  const rest = location.pathname.startsWith(from) ? location.pathname.slice(from.length) : '';
  return <Navigate to={`${to}${rest}${location.search}`} replace />;
}

// Coming-soon routes nested inside their workspace ("/career/soon/placements").
const soonRoutes = (workspace) =>
  UPCOMING_FEATURES.filter((f) => UPCOMING_WORKSPACE[f.slug] === workspace).map((f) => (
    <Route key={f.slug} path={`soon/${f.slug}`} element={<ComingSoonPage feature={f} />} />
  ));

export default function App() {
  return (
    <PWAProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <OfflineBanner />
            <UpdateBanner />
            <Toaster
              position="top-center"
              toastOptions={{
                className: 'datad-toast',
                duration: 3500,
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
              }}
            />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/creator" element={<CreatorPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              {/* "/" is the public landing for visitors, the dashboard once logged in */}
              <Route path="/" element={<HomeGate />} />
              <Route element={<AppLayout />}>
                <Route path="/briefing" element={<IntelligencePage />} />

                <Route path="/study" element={<WorkspaceLayout workspace="study" title="Study" />}>
                  <Route index element={<StudyHubPage />} />
                  <Route path="notes" element={<NotesListPage />} />
                  <Route path="notes/new" element={<NoteEditorPage />} />
                  <Route path="notes/:id" element={<NoteDetailPage />} />
                  <Route path="notes/:id/edit" element={<NoteEditorPage />} />
                  <Route path="work" element={<WorkPage />} />
                  <Route path="subject" element={<SubjectPage />} />
                  <Route path="resources" element={<ResourcesPage />} />
                  <Route path="focus" element={<StudyToolsPage />} />
                  {/* Merged/dissolved tabs — old URLs keep working */}
                  <Route path="assignments" element={<Navigate to="/study/work" replace />} />
                  <Route path="projects" element={<Navigate to="/study/work?view=projects" replace />} />
                  <Route path="study-tools" element={<Navigate to="/study/focus" replace />} />
                  <Route path="ai-tools" element={<Navigate to="/study/notes" replace />} />
                  {soonRoutes('study')}
                </Route>

                <Route path="/career" element={<WorkspaceLayout workspace="career" title="Career" />}>
                  {/* Readiness IS the overview: score + what to do today */}
                  <Route index element={<ReadinessPage />} />
                  <Route path="resume" element={<ResumePage />} />
                  <Route path="resume/preview" element={<ResumePreviewPage />} />
                  <Route path="companies" element={<CompaniesPage />} />
                  <Route path="companies/:slug" element={<CompanyDetailPage />} />
                  <Route path="questions" element={<InterviewQuestionsPage />} />
                  <Route path="opportunities" element={<OpportunitiesPage />} />
                  {/* Merged/moved tabs — old URLs keep working */}
                  <Route path="readiness" element={<Navigate to="/career" replace />} />
                  <Route path="placements" element={<Navigate to="/career/opportunities" replace />} />
                  <Route path="internships" element={<Navigate to="/career/opportunities?view=internships" replace />} />
                  <Route path="skills" element={<Navigate to="/community/skills" replace />} />
                  <Route path="pivot" element={<PivotPage />} />
                  <Route path="stories" element={<StarStoriesPage />} />
                  {soonRoutes('career')}
                </Route>

                <Route path="/community" element={<WorkspaceLayout workspace="community" title="Community" />}>
                  <Route index element={<CommunityHubPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="feed" element={<StreamPage />} />
                  <Route path="memories" element={<MemoriesPage />} />
                  <Route path="archive/:category/:slug" element={<EntertainmentDetailPage />} />
                  <Route path="directory" element={<DirectoryPage />} />
                  <Route path="events" element={<EventsPage />} />
                  {/* No top tab — reachable from the Community overview */}
                  <Route path="marketplace" element={<MarketplacePage />} />
                  <Route path="skills" element={<SkillExchangePage />} />
                  {/* Merged tabs — old URLs keep working */}
                  <Route path="discussions" element={<Navigate to="/community/feed?view=discussions" replace />} />
                  <Route path="gallery" element={<Navigate to="/community/memories" replace />} />
                  <Route path="archive" element={<Navigate to="/community/memories?view=archive" replace />} />
                  {soonRoutes('community')}
                </Route>

                <Route path="/me" element={<WorkspaceLayout workspace="me" title="Life" />}>
                  <Route index element={<MeHubPage />} />
                  <Route path="planner" element={<PlannerPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="journal" element={<JournalPage />} />
                </Route>

                <Route path="/me/finance" element={<WorkspaceLayout workspace="finance" title="Finance" />}>
                  <Route index element={<FinanceOverviewPage />} />
                  <Route path="tracker" element={<FinanceTrackerPage />} />
                  <Route path="calculator" element={<FinanceCalculatorPage />} />
                  <Route path="learn" element={<FinanceLearnPage />} />
                  <Route path="roi" element={<FinanceROIPage />} />
                </Route>

                <Route path="/me/wellbeing" element={<WorkspaceLayout workspace="wellbeing" title="Wellbeing" />}>
                  <Route index element={<WellbeingPage />} />
                  <Route path="study" element={<WellbeingStudyPage />} />
                  <Route path="memory" element={<WellbeingMemoryPage />} />
                  <Route path="routines" element={<WellbeingRoutinesPage />} />
                  <Route path="support" element={<WellbeingSupportPage />} />
                </Route>

                <Route path="/subscribe" element={<SubscribePage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                <Route path="/admin/students" element={<AdminRoute><AdminStudentsPage /></AdminRoute>} />
                <Route path="/admin/studio" element={<AdminRoute><AdminStudioPage /></AdminRoute>} />
                <Route path="/admin/studio/:id" element={<AdminRoute><AdminStudioReviewPage /></AdminRoute>} />
                <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncementsPage /></AdminRoute>} />
                <Route path="/admin/logs" element={<AdminRoute><AdminLogsPage /></AdminRoute>} />
                <Route path="/admin/referrals" element={<AdminRoute><AdminReferralsPage /></AdminRoute>} />
                <Route path="/admin/archive" element={<AdminRoute><AdminArchivePage /></AdminRoute>} />
                <Route path="/admin/companies" element={<AdminRoute><AdminCompaniesPage /></AdminRoute>} />
                <Route path="/admin/cases" element={<AdminRoute><AdminCasesPage /></AdminRoute>} />
                <Route path="/admin/automation" element={<AdminRoute><AdminAutomationPage /></AdminRoute>} />
                <Route path="/admin/ai-center" element={<AdminRoute><AdminAICenterPage /></AdminRoute>} />
                <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptionsPage /></AdminRoute>} />

                {/* Legacy routes → new workspace homes */}
                <Route path="/notes/*" element={<LegacyRedirect from="/notes" to="/study/notes" />} />
                <Route path="/planner" element={<Navigate to="/me/planner" replace />} />
                <Route path="/finance" element={<Navigate to="/me/finance" replace />} />
                <Route path="/settings" element={<Navigate to="/me/settings" replace />} />
                <Route path="/journal" element={<Navigate to="/me/journal" replace />} />
                <Route path="/news" element={<Navigate to="/briefing" replace />} />
                <Route path="/resume/*" element={<LegacyRedirect from="/resume" to="/career/resume" />} />
                <Route path="/companies/*" element={<LegacyRedirect from="/companies" to="/career/companies" />} />
                <Route path="/albums" element={<Navigate to="/community/gallery" replace />} />
                <Route path="/entertainment/*" element={<LegacyRedirect from="/entertainment" to="/community/archive" />} />
                {/* 'community' slug would collide with the real /community workspace */}
                {UPCOMING_FEATURES.filter((f) => f.slug !== 'community').map((f) => (
                  <Route key={f.slug} path={`/${f.slug}`} element={<Navigate to={upcomingPath(f.slug)} replace />} />
                ))}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
          <InstallPrompt />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </PWAProvider>
  );
}
