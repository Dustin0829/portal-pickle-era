import { type FormEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, UserRound } from "lucide-react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { Button } from "@/components/ui/button";
import { changePassword, patchMe } from "@/api/features/auth/auth.service";
import { uploadReceiptFile } from "@/api/features/uploads/uploads.service";
import { useAuth } from "@/providers/AuthProvider";

const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function roleLabel(role: string | undefined) {
  if (role === "admin") return "Admin";
  return "Player";
}

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [nameStatus, setNameStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [nameError, setNameError] = useState("");
  const [avatarStatus, setAvatarStatus] = useState<
    "idle" | "uploading" | "error"
  >("idle");
  const [avatarError, setAvatarError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [passwordError, setPasswordError] = useState("");
  const label = roleLabel(user?.role);

  async function onSaveName(event: FormEvent) {
    event.preventDefault();
    const next = nameDraft.trim();
    if (!next) {
      setNameError("Name is required");
      setNameStatus("error");
      return;
    }
    setNameStatus("saving");
    setNameError("");
    try {
      await patchMe({ name: next });
      await refreshUser();
      setEditingName(false);
      setNameStatus("saved");
    } catch (error) {
      setNameStatus("error");
      setNameError(
        error instanceof Error ? error.message : "Could not update name",
      );
    }
  }

  async function onAvatarSelected(file: File | undefined) {
    if (!file) return;
    if (!AVATAR_TYPES.has(file.type)) {
      setAvatarStatus("error");
      setAvatarError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    setAvatarStatus("uploading");
    setAvatarError("");
    try {
      const upload = await uploadReceiptFile(file);
      await patchMe({ image: upload.receiptKey });
      await refreshUser();
      setAvatarStatus("idle");
    } catch (error) {
      setAvatarStatus("error");
      setAvatarError(
        error instanceof Error ? error.message : "Could not upload photo",
      );
    }
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordStatus("saving");
    setPasswordError("");
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordStatus("saved");
    } catch (error) {
      setPasswordStatus("error");
      setPasswordError(
        error instanceof Error ? error.message : "Could not change password",
      );
    }
  }

  return (
    <div className="min-h-full">
      <AppPageShell>
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
            Profile
          </h1>
          <p className="text-sm text-zinc-500">
            Account details from your Pickle Era session.
          </p>
        </header>

        <section className="relative border border-zinc-200 bg-white p-4 sm:p-5">
          <button
            type="button"
            onClick={() => {
              setEditingName(true);
              setNameDraft(user?.name ?? "");
              setNameStatus("idle");
              setNameError("");
            }}
            className="absolute right-4 top-4 inline-flex h-9 items-center gap-2 border border-zinc-200 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600 transition hover:border-yellow hover:text-yellow sm:right-5 sm:top-5"
          >
            <Pencil size={13} aria-hidden />
            Edit name
          </button>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex flex-col items-center gap-3 sm:w-36">
              <div className="grid size-24 place-items-center overflow-hidden rounded-full border border-yellow/40 bg-yellow/10 text-yellow">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound size={40} aria-hidden />
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) =>
                  void onAvatarSelected(event.target.files?.[0])
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={avatarStatus === "uploading"}
                onClick={() => fileRef.current?.click()}
              >
                {avatarStatus === "uploading" ? "Uploading…" : "Upload photo"}
              </Button>
              {avatarError ? (
                <p className="text-center text-xs text-maroon" role="alert">
                  {avatarError}
                </p>
              ) : null}
              <span className="rounded-md bg-green px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow">
                {label}
              </span>
            </div>

            <dl className="min-w-0 flex-1 space-y-4 pt-1 sm:pr-28">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Name
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">
                  {user?.name}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-zinc-900">
                  {user?.email}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Role
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900">
                  {label}
                </dd>
              </div>
            </dl>
          </div>

          {editingName ? (
            <form
              className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4"
              onSubmit={onSaveName}
            >
              <label className="text-xs text-zinc-500">
                Display name
                <input
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  className="mt-1 h-9 w-full max-w-sm border border-zinc-200 px-3 text-sm outline-none focus:border-yellow"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={nameStatus === "saving"}
                >
                  {nameStatus === "saving" ? "Saving…" : "Save name"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </Button>
                {nameError ? (
                  <p className="text-xs text-maroon" role="alert">
                    {nameError}
                  </p>
                ) : null}
                {nameStatus === "saved" ? (
                  <p className="text-xs text-zinc-500" role="status">
                    Saved.
                  </p>
                ) : null}
              </div>
            </form>
          ) : null}
        </section>

        <section className="mt-4 border border-zinc-200 bg-white p-4 sm:p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
            Change password
          </h2>
          <form
            className="mt-3 flex max-w-sm flex-col gap-2.5"
            onSubmit={onChangePassword}
          >
            <label className="text-xs text-zinc-500">
              Current password
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1 h-9 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-yellow"
                required
              />
            </label>
            <label className="text-xs text-zinc-500">
              New password
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                className="mt-1 h-9 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-yellow"
                required
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                className="w-fit"
                disabled={passwordStatus === "saving"}
              >
                {passwordStatus === "saving" ? "Updating…" : "Update password"}
              </Button>
              {passwordStatus === "saved" ? (
                <p className="text-xs text-zinc-500" role="status">
                  Password updated.
                </p>
              ) : null}
              {passwordError ? (
                <p className="text-xs text-maroon" role="alert">
                  {passwordError}
                </p>
              ) : null}
            </div>
          </form>
        </section>

        {user?.role === "admin" ? (
          <Link
            to="/admin"
            className="mt-4 inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-yellow hover:text-zinc-900"
          >
            Open facility admin
          </Link>
        ) : null}
      </AppPageShell>
    </div>
  );
}
