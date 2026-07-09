const User = require("../models/User");
const Booking = require("../models/Booking");
const Request = require("../models/Request");

// @desc     Get total overview metrics across the whole platform
// @route    GET /api/admin/dashboard-stats
// @access   Private (Admin Only)
const getAdminStats = async (req, res) => {
  try {
    // Run counts in parallel for optimal backend speed performance
    const [totalUsers, totalTutors, totalStudents, totalBookings, totalRequests] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "tutor" }),
      User.countDocuments({ role: "student" }),
      Booking.countDocuments(),
      Request.countDocuments(),
    ]);

    res.status(200).json({
      totalUsers,
      totalTutors,
      totalStudents,
      totalBookings,
      totalRequests,
    }); // Changed the ']' to '}' here
  } catch (error) {
    res.status(500).json({ message: "Error retrieving metrics", error: error.message });
  }
};

// @desc     Get all registered accounts for tracking activity
// @route    GET /api/admin/users
// @access   Private (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    // Exclude sensitive fields for security (add refresh tokens here if applicable)
    const users = await User.find({}).select("-password -tokens").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users list", error: error.message });
  }
};

// @desc     Remove/Ban a problematic user account from the system
// @route    DELETE /api/admin/users/:id
// @access   Private (Admin Only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User target not found" });
    }
    
    res.status(200).json({ message: `Account for ${user.fullName || 'User'} successfully removed.` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};


// @desc     Get recent platform activity for the admin feed
// @route    GET /api/admin/activity
// @access   Private (Admin Only)
const getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select("fullName role createdAt");

    const activity = recentUsers.map((u) => ({
      icon: "👤",
      message: `${u.fullName} joined as a ${u.role}`,
      createdAt: u.createdAt,
    }));

    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity", error: error.message });
  }
};

// @desc     Toggle Ban/Unban status of a user
// @route    PUT /api/admin/users/:id/toggle-ban
// @access   Private (Admin Only)
const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kept for debugging your middleware payload
    console.log("req.user contents:", req.user);

    // 1. Find the target user first to know their current state
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Prevent admins from accidentally banning themselves if req.user contains the admin ID
    if (req.user && req.user.id === id) {
      return res.status(400).json({ message: "Action denied. You cannot ban your own administrator account." });
    }

    // 3. Toggle and return the fresh updated document
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { isBanned: !user.isBanned } },
      { new: true } // Returns the newly modified object
    );

    res.status(200).json({ 
      message: `User status changed to ${updatedUser.isBanned ? "Banned" : "Active"}.`, 
      userId: updatedUser._id, 
      isBanned: updatedUser.isBanned 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export the functions to be used in the routing files
module.exports = {
  toggleUserBan,
  getAdminStats,
  getAllUsers,
  deleteUser,
 getRecentActivity,
};