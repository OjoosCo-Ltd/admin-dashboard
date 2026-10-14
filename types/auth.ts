/** The signed-in admin as shown in the UI. Tokens never live here. */
export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
}
