export type AuthActionState = {
  status: "error" | "success";
  message: string;
} | null;