import mongoose from "mongoose";

const declareModelSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter model name"],
			unique: true,
			trim: true,
		},
		description: {
			type: String,
			required: [true, "Please enter model description"],
		},
		reference: {
			name: {
				type: String,
				trim: true,
			},
			url: {
				type: String,
				trim: true,
				validate: {
					validator: (v) => (
						v === null ||
						v === "" ||
						/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})(\/[-\w\._~:/?#[\]@!$&'()*+,;=]*)*\/?$/.test(
							v,
						)
					),
					message: (props) => `${props.value} is not a valid URL!`,
				},
			},
		},
		contentURL: {
			type: String,
		},
		textRepURL: {
			type: String,
		},
		imageURL: {
			type: String,
		},
		automataUrl: {
			type: String,
		},
		public: {
			type: Boolean,
			default: true,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Author ID is required"],
		},
	},
	{ timestamps: true },
);

const DeclareModel =
	mongoose.models.DeclareModel ||
	mongoose.model("DeclareModel", declareModelSchema, "declareModel");

export default DeclareModel;
