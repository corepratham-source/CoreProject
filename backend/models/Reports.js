import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  location: String,
  category: String,
  profilesAnalyzed: Number,
  description: String,
  isTrending: Boolean,
  link: String,
  document: String
});
export default mongoose.model("Report", reportSchema);