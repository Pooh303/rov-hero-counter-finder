// src/app/ThemeRegistry.js
'use client';

import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';

// Define theme customizations using the CSS variable
const theme = extendTheme({
  fontFamily: {
    // Use the CSS variable from next/font/local
    // Use Joy's fallback variable AND the Inter variable as further fallbacks
    body: 'var(--font-noto-sans-thai), var(--font-inter), var(--joy-fontFamily-fallback)',
    display: 'var(--font-noto-sans-thai), var(--font-inter), var(--joy-fontFamily-fallback)',
    // You might need to adjust code fallback if NotoSansThai doesn't have specific code styles
    code: 'var(--font-noto-sans-thai), var(--joy-fontFamily-code)',
  },
  // Add any other theme overrides here
});

// ... rest of the ThemeRegistry code remains the same ...
export default function ThemeRegistry(props) {
  const { options, children } = props;

  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      {/* Pass the customized theme to CssVarsProvider */}
      <CssVarsProvider theme={theme} defaultMode="system">
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </CacheProvider>
  );
}