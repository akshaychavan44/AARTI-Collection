import { redirect } from "next/navigation";

/**
 * Direct route redirect: http://localhost:3000/profile/admin -> /admin
 */
export default function ProfileAdminPage() {
  redirect("/admin");
}
