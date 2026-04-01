import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import * as auditService from "./audit.service";
import { sendSuccess } from "../../lib/response";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await auditService.getAuditLogs({
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
      actorUserId: req.query.actorUserId as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 30,
    });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

export default router;
