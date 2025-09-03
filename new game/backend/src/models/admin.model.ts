// Import
import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
    username: String,
    password: String
}, { timestamps: true });

// Export
export default model('Admin', adminSchema);