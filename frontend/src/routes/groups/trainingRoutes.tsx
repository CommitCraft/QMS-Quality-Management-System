import {
  AssignCoursePage,
  CoursePage,
  CoursePlayerPage,
  CourseSummaryPage,
  LmsAssignmentsPage,
  LmsCheckingPage,
  LmsContentPage,
  LmsTestSeriesPage,
  MyCoursesPage,
  TestPlayerPage,
  TestSeriesBuilderPage,
} from '../pageRegistry';
import { ROUTE_PATHS } from '../routePaths';
import type { PermissionRouteGroup } from '../routeTypes';

export const trainingRouteGroups: PermissionRouteGroup[] = [
  {
    requiredPermissions: ['VIEW_TRAINING_COURSE'],
    routes: [
      { path: ROUTE_PATHS.courseList, element: <CoursePage /> },
      { path: ROUTE_PATHS.lmsContent, element: <LmsContentPage /> },
      { path: ROUTE_PATHS.lmsAssignments, element: <LmsAssignmentsPage /> },
      { path: ROUTE_PATHS.lmsChecking, element: <LmsCheckingPage /> },
      { path: ROUTE_PATHS.lmsTestSeries, element: <LmsTestSeriesPage /> },
      { path: ROUTE_PATHS.lmsTestSeriesBuilder, element: <TestSeriesBuilderPage /> },
    ],
  },
  {
    requiredPermissions: ['VIEW_MY_COURSES'],
    routes: [
      { path: ROUTE_PATHS.courseMyCourses, element: <MyCoursesPage /> },
      { path: ROUTE_PATHS.trainingMyCoursePlayer, element: <CoursePlayerPage /> },
      { path: ROUTE_PATHS.trainingTestPlayer, element: <TestPlayerPage /> },
    ],
  },
  {
    requiredPermissions: ['MANAGE_TRAINING_ASSIGN_COURSE'],
    routes: [{ path: ROUTE_PATHS.courseAssign, element: <AssignCoursePage /> }],
  },
  {
    requiredPermissions: ['VIEW_COURSE_SUMMARY'],
    routes: [{ path: ROUTE_PATHS.courseSummary, element: <CourseSummaryPage /> }],
  },
];
