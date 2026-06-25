const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email address"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false   // 🔒 Never return password in queries
    },

    role: {
      type: String,
      enum: ["user", "admin", "maintenance"],
      default: "user"
    },

    apartmentBlock: {
      type: String,
      required: function () {
        return this.role === "user";
      }
    },

    flatNumber: {
      type: String,
      required: function () {
        return this.role === "user";
      }
    },

    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
    },

    profileImage: {
      type: String   // Cloudinary image URL
    },

    isActive: {
      type: Boolean,
      default: true
    },

    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true   // createdAt & updatedAt
  }
);


// 🔐 ==============================
// HASH PASSWORD BEFORE SAVE
// ==============================

userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// 🔑 ==============================
// COMPARE PASSWORD METHOD
// ==============================

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// 🎟 ==============================
// GENERATE JWT TOKEN
// ==============================

userSchema.methods.generateAuthToken = function () {
  return generateToken(this._id, this.role);
};


// 📊 ==============================
// INDEXING (Performance Optimization)
// ==============================

userSchema.index({ role: 1 });


module.exports = mongoose.model("User", userSchema);
