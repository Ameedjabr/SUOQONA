import { Request, Response, NextFunction } from "express";
import { writeAuditLog } from "../modules/audit/audit.service";

/**
 * Middleware that auto-logs admin write operations to AuditLog.
 * Attach to routes after authenticate middleware.
 * Usage: router.post("/", authenticate, authorize("ADMIN"), auditAction("Product", "CREATE"), controller)
 */
export function auditAction(entityType: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Capture the original json method to intercept the response
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Only audit successful mutations
      if (res.statusCode < 400 && req.user) {
        const entityId =
          body?.data?.id || req.params.id || req.params.variantId || "unknown";

        writeAuditLog({
          actorUserId: req.user.userId,
          action,
          entityType,
          entityId,
          after: action !== "DELETE" ? body?.data : null,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        }).catch((err) => console.error("[Audit] Failed to write log:", err));
      }

      return originalJson(body);
    };

    next();
  };
}
