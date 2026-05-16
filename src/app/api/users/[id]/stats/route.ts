import { db } from "@/lib/db";
import { computeFinancialProfile } from "@/lib/financial";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Try to find user by ID first, then by name
    let user = db.getUserById(id);
    if (!user) {
      // Convert slug to name (e.g., "amara-okafor" -> "Amara Okafor")
      const name = id
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      user = db.getUserByName(name);
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get completed gigs
    const completedGigs = db.getAllGigs()
      .filter(g => g.worker_id === user.id && g.status === "completed").length;

    // Get proof of work records
    const powRecords = db.getProofOfWorkByWorker(user.id);

    // Get average rating
    const ratings = powRecords.filter(p => p.rating !== null).map(p => p.rating!);
    const avgRating = ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b) / ratings.length * 10) / 10 : null;

    // Get total earnings
    const totalEarnings = powRecords.reduce((sum, p) => sum + p.amount, 0);

    const transactions = db.getTransactionsByUser(user.id);
    const financialProfile = computeFinancialProfile({
      user,
      completedGigs: completedGigs,
      averageRating: avgRating,
      totalEarnings,
      transactions,
      proofRecords: powRecords,
    });

    // Get recent gigs with feedback
    const allGigs = db.getAllGigs();
    const recentGigs = allGigs
      .filter(g => g.worker_id === user.id && g.status === "completed")
      .sort((a, b) => (b.completed_at || 0) - (a.completed_at || 0))
      .slice(0, 5)
      .map(g => {
        const pow = db.getProofOfWorkByGig(g.id);
        return {
          ...g,
          rating: pow?.rating,
          feedback: pow?.feedback,
        };
      });

    return NextResponse.json({
      user,
      stats: {
        completed_gigs: completedGigs,
        average_rating: avgRating,
        total_earnings: totalEarnings,
        trust_score: user.trust_score,
        wallet_balance: user.wallet_balance,
        transaction_count: transactions.length,
      },
      recent_gigs: recentGigs,
      financial_profile: financialProfile,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 });
  }
}
