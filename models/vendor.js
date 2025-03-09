import mongoose, { Schema, models } from "mongoose";

const vendorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    shopName: {
      type: String,
      required: true,
    },
    menuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      }
    ],

    address: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

const Vendor = models.Vendor || mongoose.model("Vendor", vendorSchema);
export default Vendor;
