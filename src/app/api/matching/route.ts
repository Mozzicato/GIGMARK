import { db, parseSkills } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Matching Engine - ranks workers for a given gig
 * Based on: skills overlap, location, trust score, completion rate
 */
export async function GET(request: NextRequest) {
  try {
    const gigId = request.nextUrl.searchParams.get("gig_id");

    if (!gigId) {
      return NextResponse.json({ error: "Missing gig_id" }, { status: 400 });
    }

    const gig = db.getGigById(gigId);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    // Get all workers (excluding those with active non-completed gigs)
    const allGigs = db.getAllGigs();
    const busyWorkerIds = new Set(
      allGigs
        .filter(g => g.status !== "completed" && g.status !== "cancelled" && g.worker_id)
        .map(g => g.worker_id)
    );

    const workers = db.getAllUsers()
      .filter(u => u.role === "worker" && !busyWorkerIds.has(u.id));

    const gigSkills = parseSkills(gig.required_skills);

    // Score each worker
    const scored = workers.map((w) => {
      const workerSkills = parseSkills(w.skills);

      // Calculate skill match
      const matchedSkills = gigSkills.filter((s) => workerSkills.includes(s)).length;
      const skillScore = gigSkills.length > 0 ? matchedSkills / gigSkills.length : 0.5;

      // Get completion metrics
      const workerGigs = allGigs.filter(g => g.worker_id === w.id);
      const completedGigs = workerGigs.filter(g => g.status === "completed").length;
      const assignedGigs = workerGigs.filter(g => g.status === "assigned" || g.status === "completed").length;

      const completionRate = assignedGigs > 0 ? completedGigs / assignedGigs : 0.8;

      // Trust score influence
      const trustScoreNorm = w.trust_score / 100;

      // Calculate final match score
      const matchScore = skillScore * 0.4 + completionRate * 0.3 + trustScoreNorm * 0.3;

      return {
        ...w,
        match_score: Math.round(matchScore * 100),
        skill_match: Math.round(skillScore * 100),
        completion_rate: Math.round(completionRate * 100),
        total_gigs_completed: completedGigs,
      };
    });

    // Sort by match score
    scored.sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json(scored.slice(0, 10));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to match workers" }, { status: 500 });
  }
}
