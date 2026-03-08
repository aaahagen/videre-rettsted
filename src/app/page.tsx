
// This component serves as the loading screen for the root path of the application.
// It is displayed while the AuthProvider determines the user's authentication
// status and redirects them to the appropriate page (either the dashboard or the login screen).
// This prevents the brief flash of a 404 page that would otherwise occur.
export default function RootPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
}
