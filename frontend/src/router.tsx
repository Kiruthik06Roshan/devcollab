import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layouts/AppShell';
import { ProtectedRoute } from './components/layouts/ProtectedRoute';
import { PublicShell } from './components/layouts/PublicShell';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';
import PricingPage from './pages/public/PricingPage';
import DashboardPage from './pages/app/DashboardPage';
import WorkspacePage from './pages/app/WorkspacePage';
import WorkspaceProjectsPage from './pages/app/WorkspaceProjectsPage';
import ProjectBoardPage from './pages/app/ProjectBoardPage';
import ProjectListPage from './pages/app/ProjectListPage';
import ProjectCalendarPage from './pages/app/ProjectCalendarPage';
import ProjectWikiPage from './pages/app/ProjectWikiPage';
import ProjectSnippetsPage from './pages/app/ProjectSnippetsPage';
import ProjectActivityPage from './pages/app/ProjectActivityPage';
import NotificationsPage from './pages/app/NotificationsPage';
import ProfilePage from './pages/app/ProfilePage';
import SettingsPage from './pages/app/SettingsPage';

export const router = createBrowserRouter([
  {
    element: <PublicShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/pricing', element: <PricingPage /> }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/workspace/:workspaceId', element: <WorkspacePage /> },
          { path: '/workspace/:workspaceId/projects', element: <WorkspaceProjectsPage /> },
          { path: '/project/:projectId/board', element: <ProjectBoardPage /> },
          { path: '/project/:projectId/list', element: <ProjectListPage /> },
          { path: '/project/:projectId/calendar', element: <ProjectCalendarPage /> },
          { path: '/project/:projectId/wiki', element: <ProjectWikiPage /> },
          { path: '/project/:projectId/snippets', element: <ProjectSnippetsPage /> },
          { path: '/project/:projectId/activity', element: <ProjectActivityPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/profile/:userId', element: <ProfilePage /> },
          { path: '/settings', element: <SettingsPage /> }
        ]
      }
    ]
  }
]);