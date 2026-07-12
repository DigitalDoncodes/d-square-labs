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
const NotesListPage = lazy(() => import('./pages/NotesListPage'));
const NoteDetailPage = lazy(() => import('./pages/NoteDetailPage'));
const NoteEditorPage = lazy(() => import('./pages/NoteEditorPage'));
const AlbumsListPage = lazy(() => import('./pages/AlbumsListPage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
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
const EntertainmentPage = lazy(() => import('./pages/EntertainmentPage'));
const EntertainmentDetailPage = lazy(() => import('./pages/EntertainmentDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SubscribePage = lazy(() => import('./pages/SubscribePage'));
const AdminSubscriptionsPage = lazy(() => import('./pages/admin/AdminSubscriptionsPage'));
const StudyHubPage = lazy(() => import('./pages/study/StudyHubPage'));
const AssignmentsPage = lazy(() => import('./pages/study/AssignmentsPage'));
const CareerHubPage = lazy(() => import('./pages/career/CareerHubPage'));
const ReadinessPage = lazy(() => import('./pages/career/ReadinessPage'));
const InterviewQuestionsPage = lazy(() => import('./pages/career/InterviewQuestionsPage'));
const CommunityHubPage  = lazy(() => import('./pages/community/CommunityHubPage'));
const AnnouncementsPage = lazy(() => import('./pages/community/AnnouncementsPage'));
const DiscussionsPage   = lazy(() => import('./pages/community/DiscussionsPage'));
const FeedPage          = lazy(() => import('./pages/community/FeedPage'));
const DirectoryPage     = lazy(() => import('./pages/community/DirectoryPage'));
const EventsPage        = lazy(() => import('./pages/community/EventsPage'));
const MarketplacePage   = lazy(() => import('./pages/community/MarketplacePage'));
const MeHubPage         = lazy(() => import('./pages/me/MeHubPage'));
const SubjectPage       = lazy(() => import('./pages/study/SubjectPage'));
const ResourcesPage     = lazy(() => import('./pages/study/ResourcesPage'));
const ProjectsPage      = lazy(() => import('./pages/study/ProjectsPage'));
const AIToolsPage       = lazy(() => import('./pages/study/AIToolsPage'));
const StudyToolsPage    = lazy(() => import('./pages/study/StudyToolsPage'));
const PlacementsPage    = lazy(() => import('./pages/career/PlacementsPage'));
const InternshipsPage   = lazy(() => import('./pages/career/InternshipsPage'));
const SkillExchangePage = lazy(() => import('./pages/career/SkillExchangePage'));
const AdminAICenterPage = lazy(() => import('./pages/admin/AdminAICenterPage'));

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
            <Toaster position="top-center" />
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
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/briefing" element={<IntelligencePage />} />

                <Route path="/study" element={<WorkspaceLayout workspace="study" title="Study" />}>
                  <Route index element={<StudyHubPage />} />
                  <Route path="notes" element={<NotesListPage />} />
                  <Route path="notes/new" element={<NoteEditorPage />} />
                  <Route path="notes/:id" element={<NoteDetailPage />} />
                  <Route path="notes/:id/edit" element={<NoteEditorPage />} />
                  <Route path="assignments" element={<AssignmentsPage />} />
                  <Route path="subject" element={<SubjectPage />} />
                  <Route path="resources" element={<ResourcesPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="ai-tools" element={<AIToolsPage />} />
                  <Route path="study-tools" element={<StudyToolsPage />} />
                  {soonRoutes('study')}
                </Route>

                <Route path="/career" element={<WorkspaceLayout workspace="career" title="Career" />}>
                  <Route index element={<CareerHubPage />} />
                  <Route path="resume" element={<ResumePage />} />
                  <Route path="resume/preview" element={<ResumePreviewPage />} />
                  <Route path="companies" element={<CompaniesPage />} />
                  <Route path="companies/:slug" element={<CompanyDetailPage />} />
                  <Route path="questions" element={<InterviewQuestionsPage />} />
                  <Route path="readiness" element={<ReadinessPage />} />
                  <Route path="placements" element={<PlacementsPage />} />
                  <Route path="internships" element={<InternshipsPage />} />
                  <Route path="skills" element={<SkillExchangePage />} />
                  {soonRoutes('career')}
                </Route>

                <Route path="/community" element={<WorkspaceLayout workspace="community" title="Community" />}>
                  <Route index element={<CommunityHubPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="discussions" element={<DiscussionsPage />} />
                  <Route path="gallery" element={<AlbumsListPage />} />
                  <Route path="archive" element={<EntertainmentPage />} />
                  <Route path="archive/:category/:slug" element={<EntertainmentDetailPage />} />
                  <Route path="feed" element={<FeedPage />} />
                  <Route path="directory" element={<DirectoryPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="marketplace" element={<MarketplacePage />} />
                  {soonRoutes('community')}
                </Route>

                <Route path="/me" element={<WorkspaceLayout workspace="me" title="Me" />}>
                  <Route index element={<MeHubPage />} />
                  <Route path="planner" element={<PlannerPage />} />
                  <Route path="finance" element={<FinancePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="journal" element={<JournalPage />} />
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
