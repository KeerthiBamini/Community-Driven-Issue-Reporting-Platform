const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Community name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },

    location: {
      address: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      zipCode: {
        type: String,
        required: true,
        trim: true
      }
    },

    // Admin(s) reference
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
      }
    ],

    // Maintenance Staff reference
    maintenanceStaff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaintenanceStaff",
        default: null
      }
    ],

    // Residents/Users reference
    residents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },

    totalResidents: {
      type: Number,
      default: 0
    },

    totalBlocks: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },

    phone: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    }
  },
  { timestamps: true }
);

// Static method to add admin to community
communitySchema.statics.addAdmin = async function (communityId, adminId) {
  return await this.findByIdAndUpdate(
    communityId,
    { $addToSet: { admins: adminId } },
    { new: true }
  ).populate("admins");
};

// Static method to add maintenance staff to community
communitySchema.statics.addMaintenanceStaff = async function (communityId, staffId) {
  return await this.findByIdAndUpdate(
    communityId,
    { $addToSet: { maintenanceStaff: staffId } },
    { new: true }
  ).populate("maintenanceStaff");
};

// Static method to add resident to community
communitySchema.statics.addResident = async function (communityId, userId) {
  return await this.findByIdAndUpdate(
    communityId,
    { $addToSet: { residents: userId }, $inc: { totalResidents: 1 } },
    { new: true }
  ).populate("residents");
};

// Virtual to get all staff (admins + maintenance)
communitySchema.virtual("allStaff").get(function () {
  return [...(this.admins || []), ...(this.maintenanceStaff || [])];
});

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;