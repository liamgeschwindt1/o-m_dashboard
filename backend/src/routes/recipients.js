import { Router } from "express";
import { query } from "../db.js";

const router = Router();

// ── POST /api/routes/:id/share ────────────────────────────────────────────────
// Insert a recipient record and fire-and-forget n8n email webhook
router.post("/:id/share", async (req, res, next) => {
  try {
    const { id: routeId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // Fetch route + instructor for the webhook payload
    const routeResult = await query(
      `SELECT r.name AS route_name, i.name AS instructor_name
       FROM routes r
       JOIN instructors i ON i.id = r.instructor_id
       WHERE r.id = $1`,
      [routeId]
    );

    if (!routeResult.rows.length) {
      return res.status(404).json({ error: "Route not found" });
    }

    const { route_name, instructor_name } = routeResult.rows[0];

    // Insert recipient
    const recipientResult = await query(
      `INSERT INTO route_recipients (route_id, email)
       VALUES ($1, $2)
       RETURNING id, sent_at`,
      [routeId, email]
    );

    // Fire-and-forget: trigger n8n email webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route_id: routeId,
          recipient_email: email,
          route_name,
          instructor_name,
        }),
      }).catch((err) => {
        console.error("n8n webhook failed (non-blocking):", err.message);
      });
    }

    res.status(201).json(recipientResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
