import mongoose from 'mongoose';

const LearningProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    topicId: {
        type: String,
        required: true
    },
    quizScore: {
        type: Number, // e.g., 3 out of 3
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure one completion per user per topic
LearningProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export default mongoose.models.LearningProgress || mongoose.model('LearningProgress', LearningProgressSchema);
