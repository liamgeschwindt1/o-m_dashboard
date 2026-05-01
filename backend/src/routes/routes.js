import { Router } from "express";
import { query } from "../db.js";

const router = Router();

// ── POST /api/routes ──────────────────────────────────────────────────────────
// Upsert instructor, then insert route. Returns the created route id.
router.post("/", async (req, res, next) => {
  try {
    const { name, org_code, instructor_email, instructor_name, payload } = req.body;

    if (!name || !instructor_email || !payload) {
      return res.status(400).json({ error: "name, instructor_email, and payload are required" });
    }

    // Upsert instructor
    const instructorResult = await query(
      `INSERT INTO instructors (email, name, org_code)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE
         SET name     = EXCLUDED.name,
             org_code = EXCLUDED.org_code
       RETURNING id`,
      [instructor_email, instructor_name ?? null, org_code ?? null]
    );

    const instructorId = instructorResult.rows[0].id;

    // Insert route
    const routeResult = await query(
      `INSERT INTO routes (instructor_id, name, payload)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [instructorId, name, JSON.stringify(payload)]
    );

    res.status(201).json(routeResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/routes ───────────────────────────────────────────────────────────
// List all routes, optionally filtered by ?org_code=
router.get("/", async (req, res, next) => {
  try {
    const { org_code } = req.query;

    const result = await query(
      `SELECT r.id, r.name, r.status, r.created_at,
              i.email AS instructor_email, i.name AS instructor_name, i.org_code
       FROM routes r
       JOIN instructors i ON i.id = r.instructor_id
       WHERE ($1::text IS NULL OR i.org_code = $1)
       ORDER BY r.created_at DESC`,
      [org_code ?? null]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/routes/:id ───────────────────────────────────────────────────────
// Single route with full payload and recipient list
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const [routeResult, recipientsResult] = await Promise.all([
      query(
        `SELECT r.id, r.name, r.status, r.payload, r.created_at,
                i.email AS instructor_email, i.name AS instructor_name, i.org_code
         FROM routes r
         JOIN instructors i ON i.id = r.instructor_id
         WHERE r.id = $1`,
        [id]
      ),
      query(
        `SELECT id, email, sent_at, opened_at
         FROM route_recipients
         WHERE route_id = $1
         ORDER BY sent_at DESC`,
        [id]
      ),
    ]);

    if (!routeResult.rows.length) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json({ ...routeResult.rows[0], recipients: recipientsResult.rows });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/routes/:id ─────────────────────────────────────────────────────
// Update route status (e.g. archive)
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["active", "archived"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
    }

    const result = await query(
      `UPDATE routes SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/routes/:id/view ─────────────────────────────────────────────────
// Log an anonymous view event (no PII)
router.post("/:id/view", async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      `INSERT INTO route_views (route_id) VALUES ($1)`,
      [id]
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
