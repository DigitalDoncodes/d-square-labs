const User = require('../../../models/User');
const UserProfile = require('../../../models/UserProfile');
const SiteMeta = require('../../../models/SiteMeta');
const StudentIdentity = require('../../../models/StudentIdentity');

async function collect(userId) {
  try {
    const [user, profile, meta, studentIdentity] = await Promise.all([
      User.findById(userId).select('name email role tier interests rollNumber studentType workExYears programs activeProgram createdAt').lean().catch(() => null),
      UserProfile.findOne({ user: userId }).lean().catch(() => null),
      SiteMeta.findOne({ key: 'main' }).select('placementDate batchName').lean().catch(() => null),
      StudentIdentity.findOne({ user: userId }).lean().catch(() => null),
    ]);

    if (!user) return null;

    const placementDate = meta?.placementDate;
    const daysToPlacement = placementDate
      ? Math.ceil((new Date(placementDate) - new Date()) / 86400000)
      : null;

    return {
      userId,
      name: user.name || 'Unknown',
      email: user.email,
      role: user.role,
      tier: user.tier || 'free',
      rollNumber: user.rollNumber,
      studentType: user.studentType || 'fresher',
      workExYears: user.workExYears || 0,
      programs: user.programs || [],
      activeProgram: user.activeProgram || null,
      interests: user.interests || [],
      joinedAt: user.createdAt,
      batch: meta?.batchName || (studentIdentity?.batch || profile?.batch || ''),
      specialization: profile?.specialization || studentIdentity?.specialization || '',
      placementDate,
      daysToPlacement,
      learningStyle: profile?.learningStyle || studentIdentity?.learningStyle || null,
      dreamRole: profile?.dreamRole || studentIdentity?.dreamRole || null,
      preferredIndustries: profile?.preferredIndustries || studentIdentity?.preferredIndustries || [],
      goals: studentIdentity?.goals || [],
      challenges: studentIdentity?.challenges || [],
      college: studentIdentity?.college || profile?.college || '',
      semester: studentIdentity?.semester || profile?.semester || '',
      graduationYear: studentIdentity?.graduationYear || profile?.graduationYear || null,
    };
  } catch {
    return null;
  }
}

module.exports = { collect };
