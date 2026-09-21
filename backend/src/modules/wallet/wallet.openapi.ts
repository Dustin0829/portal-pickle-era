import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  paginatedSuccessResponseSchema,
  standardErrorResponses,
  successResponseSchema,
} from "../../lib/openapi-helpers.js";
import { paginatedItemsSchema } from "../../lib/pagination.schema.js";
import {
  adminWalletTopUpDtoSchema,
  createWalletTopUpBodySchema,
  listAdminTopUpsQuerySchema,
  listMyWalletTransactionsQuerySchema,
  patchTopUpBodySchema,
  topUpIdParamsSchema,
  walletDtoSchema,
  walletLedgerEntryDtoSchema,
  walletReceiptUrlResponseSchema,
  walletTopUpDtoSchema,
} from "./wallet.schema.js";

export function registerWalletOpenApi(registry: OpenAPIRegistry) {
  registry.register("Wallet", walletDtoSchema);
  registry.register("WalletTopUp", walletTopUpDtoSchema);
  registry.register("WalletLedgerEntry", walletLedgerEntryDtoSchema);
  registry.register("AdminWalletTopUp", adminWalletTopUpDtoSchema);
  registry.register("WalletReceiptUrl", walletReceiptUrlResponseSchema);

  registry.registerPath({
    method: "get",
    path: "/me/wallet",
    operationId: "getMeWallet",
    tags: ["Wallet"],
    responses: {
      200: {
        description: "Current user wallet balance and recent top-ups",
        content: { "application/json": { schema: successResponseSchema(walletDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/me/wallet/transactions",
    operationId: "getMeWalletTransactions",
    tags: ["Wallet"],
    request: { query: listMyWalletTransactionsQuerySchema },
    responses: {
      200: {
        description: "Paginated wallet ledger entries for the current user",
        content: {
          "application/json": {
            schema: paginatedSuccessResponseSchema(
              paginatedItemsSchema(walletLedgerEntryDtoSchema),
            ),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/me/wallet/top-ups",
    operationId: "postMeWalletTopUps",
    tags: ["Wallet"],
    request: {
      body: {
        content: { "application/json": { schema: createWalletTopUpBodySchema } },
      },
    },
    responses: {
      201: {
        description: "Created pending wallet top-up",
        content: { "application/json": { schema: successResponseSchema(walletTopUpDtoSchema) } },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/wallet/top-ups",
    operationId: "getAdminWalletTopUps",
    tags: ["Wallet"],
    request: { query: listAdminTopUpsQuerySchema },
    responses: {
      200: {
        description: "Paginated wallet top-ups",
        content: {
          "application/json": {
            schema: paginatedSuccessResponseSchema(paginatedItemsSchema(adminWalletTopUpDtoSchema)),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/wallet/top-ups/{id}/receipt-url",
    operationId: "getAdminWalletTopUpReceiptUrl",
    tags: ["Wallet"],
    request: { params: topUpIdParamsSchema },
    responses: {
      200: {
        description: "Short-lived presigned GET URL for the top-up receipt",
        content: {
          "application/json": {
            schema: successResponseSchema(walletReceiptUrlResponseSchema),
          },
        },
      },
      ...standardErrorResponses,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/admin/wallet/top-ups/{id}",
    operationId: "patchAdminWalletTopUp",
    tags: ["Wallet"],
    request: {
      params: topUpIdParamsSchema,
      body: {
        content: { "application/json": { schema: patchTopUpBodySchema } },
      },
    },
    responses: {
      200: {
        description: "Updated top-up status (approve credits once)",
        content: {
          "application/json": { schema: successResponseSchema(adminWalletTopUpDtoSchema) },
        },
      },
      ...standardErrorResponses,
    },
  });
}
