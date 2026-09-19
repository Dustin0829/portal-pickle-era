import { type ChangeEvent, type FormEvent, useState } from "react";
import { ImagePlus, UtensilsCrossed } from "lucide-react";
import {
  useAdminFoodMenu,
  useCreateAdminFoodMenuItem,
  usePatchAdminFoodMenuItem,
} from "@/api/features/food/use-food";
import type { FoodMenuItemDto } from "@/api/features/food/food.schema";
import { uploadReceiptFile } from "@/api/features/uploads/uploads.service";
import { Button } from "@/components/ui/button";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import {
  formatCentsAsPesos,
  pesosToCents,
} from "@/lib/wallet/formatWalletMoney";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export function FoodMenuSettingsSection() {
  const { data, isPending, isError, refetch } = useAdminFoodMenu();
  const { mutateAsync: createItem, isPending: isCreating } =
    useCreateAdminFoodMenuItem();
  const { mutateAsync: patchItem, isPending: isPatching } =
    usePatchAdminFoodMenuItem();

  const [name, setName] = useState("");
  const [pricePesos, setPricePesos] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    const pesos = Number(pricePesos);
    if (!name.trim() || !Number.isFinite(pesos) || pesos < 1) {
      setFormError("Enter a name and price of at least ₱1.");
      return;
    }
    try {
      let imageKey: string | undefined;
      let imageMimeType: string | undefined;
      if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
          setFormError("Photo must be a JPEG, PNG, or WebP image.");
          return;
        }
        const upload = await uploadReceiptFile(imageFile);
        imageKey = upload.receiptKey;
        imageMimeType = upload.receiptMimeType;
      }
      await createItem({
        name: name.trim(),
        priceCents: pesosToCents(pesos),
        category: category.trim() || undefined,
        available: true,
        imageKey,
        imageMimeType,
      });
      setName("");
      setPricePesos("");
      setCategory("");
      setImageFile(null);
    } catch (error) {
      setFormError(getUserFacingApiErrorMessage(error));
    }
  }

  async function onToggleAvailable(item: FoodMenuItemDto) {
    await patchItem({ id: item.id, available: !item.available });
  }

  async function onPhotoChange(item: FoodMenuItemDto, file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    try {
      const upload = await uploadReceiptFile(file);
      await patchItem({
        id: item.id,
        imageKey: upload.receiptKey,
        imageMimeType: upload.receiptMimeType,
      });
    } catch (error) {
      setFormError(getUserFacingApiErrorMessage(error));
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
        Food menu
      </h2>
      <p className="mt-1.5 text-sm text-zinc-500">
        Add café items with optional photo. Players only see available items.
      </p>

      <form
        className="mt-4 grid gap-2 sm:grid-cols-[1fr_7rem_1fr_auto] sm:items-end"
        onSubmit={(event) => void onCreate(event)}
      >
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Price ₱
          <input
            type="number"
            min={1}
            step={1}
            value={pricePesos}
            onChange={(event) => setPricePesos(event.target.value)}
            className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Category
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Optional"
            className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs text-zinc-600 hover:border-yellow">
            <ImagePlus size={14} aria-hidden />
            <span className="max-w-[7rem] truncate">
              {imageFile?.name ?? "Photo"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setImageFile(event.target.files?.[0] ?? null)
              }
            />
          </label>
          <Button type="submit" disabled={isCreating} className="h-9">
            {isCreating ? "Adding…" : "Add"}
          </Button>
        </div>
      </form>
      {formError ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="mt-5">
        {isPending ? (
          <PortalListSkeleton rows={3} />
        ) : isError ? (
          <div className="text-sm text-zinc-500" role="alert">
            <p>Could not load menu.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700"
            >
              Try again
            </button>
          </div>
        ) : !data?.length ? (
          <p className="text-sm text-zinc-500">No menu items yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-2.5"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-zinc-400">
                      <UtensilsCrossed size={18} aria-hidden />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatCentsAsPesos(item.priceCents)}
                    {item.category ? ` · ${item.category}` : ""}
                    {item.available ? "" : " · Hidden"}
                  </p>
                </div>
                <label className="grid size-9 cursor-pointer place-items-center rounded-lg border border-zinc-200 text-zinc-500 hover:border-yellow hover:text-amber-700">
                  <ImagePlus size={14} aria-hidden />
                  <span className="sr-only">Upload photo for {item.name}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) =>
                      void onPhotoChange(item, event.target.files?.[0] ?? null)
                    }
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPatching}
                  onClick={() => void onToggleAvailable(item)}
                >
                  {item.available ? "Hide" : "Show"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
