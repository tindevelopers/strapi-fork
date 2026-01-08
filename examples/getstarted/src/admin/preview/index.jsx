import React from 'react';
import { lazy } from 'react';

const Preview = lazy(() =>
  // @ts-ignore
  import('./dummy-preview').then((module) => ({
    default: module.PreviewComponent,
  }))
);

// Pre-fetch the preview data before the route renders
const previewLoader = async ({ params }) => {
  const { apiName, documentId, locale, status, collectionType } = params;
  const apiToken = process.env.STRAPI_ADMIN_API_TOKEN;

  // #region agent log
  fetch('http://127.0.0.1:7246/ingest/cd0b5f39-fca5-4d31-8c86-7240db87374d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
      location: 'preview/index.jsx:loader:entry',
      message: 'Preview loader entry',
      data: {
        collectionType,
        apiName,
        documentId,
        locale,
        status,
        hasToken: Boolean(apiToken),
        tokenLength: apiToken ? apiToken.length : 0,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!documentId) {
    throw new Error('Document ID is required');
  }

  if (!apiToken) {
    throw new Error('STRAPI_ADMIN_API_TOKEN is not set');
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
      'strapi-encode-source-maps': 'true',
    };
    const searchParams = new URLSearchParams({
      locale,
      status,
      populate: '*',
    });
    const route = collectionType === 'collection-types' ? `${apiName}/${documentId}` : apiName;

    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/cd0b5f39-fca5-4d31-8c86-7240db87374d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
        location: 'preview/index.jsx:loader:before-fetch',
        message: 'Before API fetch',
        data: {
          mainUrl: `/api/${route}?${searchParams.toString()}`,
          unrelatedUrl: '/api/homepage?status=draft',
          authHeaderPrefix: headers.Authorization.substring(0, 20),
          authHeaderLength: headers.Authorization.length,
          tokenPrefix: apiToken.substring(0, 10),
          tokenSuffix: apiToken.substring(apiToken.length - 10),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // Make both fetch requests in parallel
    const [mainResponse, unrelatedResponse] = await Promise.all([
      fetch(`/api/${route}?${searchParams.toString()}`, { headers }),
      fetch(`/api/homepage?status=draft`, { headers }),
    ]);

    // #region agent log
    const mainResponseText = await mainResponse
      .clone()
      .text()
      .catch(() => '');
    const unrelatedResponseText = await unrelatedResponse
      .clone()
      .text()
      .catch(() => '');
    fetch('http://127.0.0.1:7246/ingest/cd0b5f39-fca5-4d31-8c86-7240db87374d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
        location: 'preview/index.jsx:loader:after-fetch',
        message: 'After API fetch with response bodies',
        data: {
          mainStatus: mainResponse.status,
          mainStatusText: mainResponse.statusText,
          mainResponsePreview: mainResponseText.substring(0, 200),
          unrelatedStatus: unrelatedResponse.status,
          unrelatedStatusText: unrelatedResponse.statusText,
          unrelatedResponsePreview: unrelatedResponseText.substring(0, 200),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/cd0b5f39-fca5-4d31-8c86-7240db87374d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
        location: 'preview/index.jsx:loader:responses',
        message: 'Preview loader responses',
        data: {
          route,
          mainStatus: mainResponse.status,
          mainOk: mainResponse.ok,
          unrelatedStatus: unrelatedResponse.status,
          unrelatedOk: unrelatedResponse.ok,
          searchParams: searchParams.toString(),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!mainResponse.ok) {
      throw new Error(`HTTP error! status: ${mainResponse.status}`);
    }

    // Unrelated request is optional - don't fail if it's 404 (endpoint doesn't exist)
    if (!unrelatedResponse.ok && unrelatedResponse.status !== 404) {
      throw new Error(`HTTP error! status: ${unrelatedResponse.status}`);
    }

    // Process both responses - unrelated is optional
    const mainResult = await mainResponse.json();
    let unrelatedResult = null;

    if (unrelatedResponse.ok) {
      try {
        unrelatedResult = await unrelatedResponse.json();
      } catch (e) {
        // Ignore JSON parse errors for unrelated request
      }
    }

    return {
      main: mainResult.data,
      unrelated: unrelatedResult?.data || null,
    };
  } catch (error) {
    console.error('Error fetching preview data:', error);
    throw error;
  }
};

export const registerPreviewRoute = (app) => {
  app.router.addRoute({
    path: 'preview/*',
    children: [
      {
        path: ':collectionType/:apiName/:documentId/:locale/:status',
        element: <Preview />,
        loader: previewLoader,
      },
    ],
  });
};
