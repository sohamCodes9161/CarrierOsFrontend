import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import FullPageLoader from '../components/common/FullPageLoader.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicOnlyRoute from './PublicOnlyRoute.jsx';
import ScrollToTop from './ScrollToTop.jsx';

const Landing = lazy(() => import('../pages/Landing.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Register = lazy(() => import('../pages/Register.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const Account = lazy(() => import('../pages/Account.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));
const ResumePage = lazy(() => import('../pages/resume/ResumePage.jsx'));
const ResumeDetail = lazy(() => import('../pages/resume/ResumeDetail.jsx'));
const GithubPage = lazy(() => import('../pages/github/GithubPage.jsx'));
const GithubDetail = lazy(() => import('../pages/github/GithubDetail.jsx'));
const InterviewList = lazy(() => import('../pages/interview/InterviewList.jsx'));
const InterviewNew = lazy(() => import('../pages/interview/InterviewNew.jsx'));
const InterviewSession = lazy(() => import('../pages/interview/InterviewSession.jsx'));
const CareerProfilePage = lazy(() => import('../pages/CareerProfilePage.jsx'));
const RoadmapPage = lazy(() => import('../pages/roadmap/RoadmapPage.jsx'));
const RoadmapDetail = lazy(() => import('../pages/roadmap/RoadmapDetail.jsx'));
const PortfolioEditor = lazy(() => import('../pages/portfolio/PortfolioEditor.jsx'));
const PublicPortfolio = lazy(() => import('../pages/portfolio/PublicPortfolio.jsx'));

// New Lazy-Loaded Pages
const JobSearchPage = lazy(() => import('../pages/jobSearch/JobSearchPage.jsx'));
const QuizPage = lazy(() => import('../pages/quiz/QuizPage.jsx'));

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>

          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          <Route path="/p/:slug" element={<PublicPortfolio />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/resume/:id" element={<ResumeDetail />} />
              <Route path="/github" element={<GithubPage />} />
              <Route path="/github/:id" element={<GithubDetail />} />
              <Route path="/interviews" element={<InterviewList />} />
              <Route path="/interviews/new" element={<InterviewNew />} />
              <Route path="/interviews/:id" element={<InterviewSession />} />
              <Route path="/jobs" element={<JobSearchPage />} />
              <Route path="/quizzes" element={<QuizPage />} />
              <Route path="/career-profile" element={<CareerProfilePage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/roadmap/:id" element={<RoadmapDetail />} />
              <Route path="/portfolio" element={<PortfolioEditor />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}