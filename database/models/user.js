import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter your name"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Please enter your email"],
			unique: true,
			trim: true,
			lowercase: true,
			validate: {
				validator: (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v),
				message: (props) => `${props.value} is not a valid email address!`,
			},
		},
		password: {
			type: String,
			required: [true, "Please enter your password"],
			minlength: [6, "Your password must be at least 6 characters long"],
			select: false,
		},
		role: {
			type: String,
			enum: ["user", "admin", "moderator"],
			default: "user",
		},
	},
	{ timestamps: true },
);

userSchema.index({ email: 1 });

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}

	try {
		this.password = await bcrypt.hash(this.password, 10);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (error) {
		throw new Error(error);
	}
};

const User = mongoose.models.User || mongoose.model("User", userSchema, "user");

export default User;
