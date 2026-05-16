export type Role = "learner" | "instructor" | "admin" | "institution";

export const ROLES: readonly Role[] = ["learner", "instructor", "admin", "institution"];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  institution: string | null;
  cohort_id: string | null;
  account_type: "individual" | "university" | "corporate" | null;
  created_at: string;
}

const ROLE_RANK: Record<Role, number> = {
  learner: 1,
  instructor: 2,
  institution: 3,
  admin: 4,
};

export function hasAtLeast(role: Role | null | undefined, minimum: Role): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function canAccessPath(role: Role | null | undefined, pathname: string): boolean {
  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/cohorts")) return hasAtLeast(role, "instructor");
  if (pathname.startsWith("/companies")) return hasAtLeast(role, "learner");
  return true;
}
