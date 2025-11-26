/**
 * Route to Title Mapping
 * Maps URL segments to page titles for dynamic breadcrumbs and headers
 */

export const routeTitles: Record<string, string> = {
  // Main dashboard
  "": "Dashboard",
  
  // Campaign routes
  "campaign": "Campaigns",
  
  // Admin routes
  "admin-roleaccess": "Role Access Management",
  "admin-teammanagement": "Team Management",
  
  // Settings routes
  "settings": "Settings",
  "email-configuration": "Email Configuration",
  
  // Profile
  "profile": "Profile",
  
  // Templates
  "template": "Email Templates",
  
  // AppFlyer
  "digitar-personal-block": "AppFlyer Dashboard",
  "appsflyer-dashboard": "AppFlyer Dashboard",
};

/**
 * Converts a route segment to a readable title
 * Falls back to transforming the slug if not in mapping
 */
export function getTitleFromSegment(segment: string): string {
  if (!segment) return "Dashboard";
  
  const title = routeTitles[segment];
  if (title) return title;
  
  // Fallback: convert kebab-case to Title Case
  return segment
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generates breadcrumb items from URL segments
 * @param segments Array of URL segments from useSelectedLayoutSegments()
 * @returns Array of breadcrumb objects
 */
export function generateBreadcrumbs(segments: string[]) {
  const breadcrumbs: Array<{
    title: string;
    href?: string;
    isActive?: boolean;
  }> = [];

  // Always start with Dashboard
  breadcrumbs.push({
    title: "Dashboard",
    href: "/",
    isActive: false,
  });

  // Build path for each segment
  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      title: getTitleFromSegment(segment),
      href: isLast ? undefined : currentPath,
      isActive: isLast,
    });
  });

  return breadcrumbs;
}

/**
 * Gets the page title from segments for the browser tab
 * Returns the last segment's title (the current page)
 */
export function getPageTitle(segments: string[]): string {
  if (segments.length === 0) return "Dashboard";
  
  const lastSegment = segments[segments.length - 1];
  return getTitleFromSegment(lastSegment);
}
