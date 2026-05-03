import { DocumentsPage } from '../pageRegistry';
import { ROUTE_PATHS } from '../routePaths';
import type { PermissionRouteGroup, RouteDefinition } from '../routeTypes';

const documentRoutes: RouteDefinition[] = [
  { path: ROUTE_PATHS.documents, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.assignListView, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.assignFolderView, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.documentsListView, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.documentsFolderView, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.categories, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.documentsDeepSearch, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.aiDocumentGenerator, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.aiDocumentGeneratorList, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.aiPromptTemplate, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.documentsOcrContentExtractor, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.bulkDocumentUpload, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.fileRequest, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.documentAuditTrails, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.recentActivity, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.archiveDocuments, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.archiveFolders, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.archiveRetentionPeriod, element: <DocumentsPage /> },
  { path: ROUTE_PATHS.documentStatus, element: <DocumentsPage /> },
];

export const documentRouteGroups: PermissionRouteGroup[] = [
  {
    requiredPermissions: ['VIEW_MY_DOCUMENTS'],
    routes: documentRoutes,
  },
];
