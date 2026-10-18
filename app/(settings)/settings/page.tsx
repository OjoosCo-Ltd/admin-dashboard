import { redirect } from "next/navigation";

// Settings opens on the admin's own profile, the menu's first item.
export default function SettingsPage() {
  redirect("/settings/profile");
}
