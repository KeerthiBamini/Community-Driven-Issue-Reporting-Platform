
const calculatePriority = (issue) => {
  const {
    criticalLevel = 1,
    upvotes = 0,
    urgencyLevel = 1,
    createdAt,
    status = "open",
  } = issue;

  let score = 0;

  // =====================================================
  // 🔥 1. Critical Level Weight (Most Important)
  // Weight: 40%
  // =====================================================
  score += criticalLevel * 8; // max 5*8 = 40

  // =====================================================
  // 👍 2. Community Upvotes Weight
  // Weight: 20%
  // =====================================================
  score += Math.min(upvotes, 20); // cap at 20 points

  // =====================================================
  // 🚨 3. Urgency Level Weight
  // Weight: 25%
  // =====================================================
  score += urgencyLevel * 5; // max 5*5 = 25

  // =====================================================
  // ⏳ 4. Age of Issue Weight
  // Older unresolved issues increase priority
  // Weight: 10%
  // =====================================================
  if (createdAt) {
    const daysOld = Math.floor(
      (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
    );

    score += Math.min(daysOld, 10); // max 10 points
  }

  // =====================================================
  // ✅ 5. Status Adjustment
  // =====================================================
  if (status === "resolved") {
    score = 0; // resolved issues get lowest priority
  }

  // =====================================================
  // 🎯 Priority Labels
  // =====================================================
  let label;

  if (score >= 80) {
    label = "Critical";
  } else if (score >= 60) {
    label = "High";
  } else if (score >= 40) {
    label = "Medium";
  } else {
    label = "Low";
  }

  return {
    score,
    label,
  };
};

module.exports = calculatePriority;