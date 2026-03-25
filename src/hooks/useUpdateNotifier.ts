'use client';

import { useState, useEffect } from 'react';

// This hook checks for a new version of the application and notifies the user.
const useUpdateNotifier = (checkInterval: number = 1000 * 60 * 30) => { // Default to 30 minutes
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    let initialVersion = '';

    // Fetch the version of the currently loaded app
    fetch('/version.json')
      .then((res) => res.json())
      .then((initial) => {
        initialVersion = initial.version;
      })
      .catch(() => {
        // Silently fail if version.json doesn't exist on first load
      });

    const interval = setInterval(() => {
      // Use 'no-store' to bypass the browser cache and get the latest version from the server.
      fetch('/version.json', { cache: 'no-store' })
        .then((res) => res.json())
        .then((latest) => {
          if (initialVersion && latest.version !== initialVersion) {
            setIsUpdateAvailable(true);
            clearInterval(interval); // Stop checking once an update is found
          }
        })
        .catch(() => {
          // Silently fail if the check fails, to avoid console errors.
        });
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  // Function to be called by the UI to reload the page.
  const refreshPage = () => {
    window.location.reload();
  };

  return { isUpdateAvailable, refreshPage };
};

export default useUpdateNotifier;
