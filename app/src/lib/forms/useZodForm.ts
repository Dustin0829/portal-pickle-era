import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";

export function useZodForm<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues>,
  options?: {
    defaultValues?: DefaultValues<TFieldValues>;
  },
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    // ponytail: cast until @hookform/resolvers ships first-class Zod v4 inference.
    resolver: zodResolver(schema as never) as Resolver<TFieldValues>,
    defaultValues: options?.defaultValues,
  });
}
